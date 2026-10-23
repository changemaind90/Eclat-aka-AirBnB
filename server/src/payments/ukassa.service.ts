import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { PaymentDto } from './dto/payment.dto';
import { PayoutDto } from './dto/payout.dto';
import { PrismaService } from 'prisma/prisma.service';
import type { AuthUser } from 'src/auth/types';

type YooKassaAmount = { value: string; currency: string };

type YooKassaPaymentResponse = {
  id: string;
  status: string;
  amount: YooKassaAmount;
  confirmation?: { confirmation_url: string };
};

type YooKassaPayoutResponse = {
  id: string;
  status: string;
  amount: YooKassaAmount;
  metadata?: Record<string, unknown>;
};

@Injectable()
export class UkassaService {
  private readonly baseUrl = 'https://api.yookassa.ru/v3';

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private get shopId() {
    return this.configService.getOrThrow<string>('YOOKASSA_SHOP_ID');
  }

  private get secretKey() {
    return this.configService.getOrThrow<string>('YOOKASSA_SECRET_KEY');
  }

  private get gatewayId() {
    return this.configService.getOrThrow<string>('YOOKASSA_GATEWAY_ID');
  }

  private get payoutSecretKey() {
    return this.configService.getOrThrow<string>('YOOKASSA_PAYOUT_SECRET_KEY');
  }

  private get headers() {
    const credentials = btoa(`${this.shopId}:${this.secretKey}`);
    return {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials}`,
      'Idempotence-Key': uuidv4(),
    };
  }

  private get payoutHeaders() {
    const credentials = btoa(`${this.gatewayId}:${this.payoutSecretKey}`);
    return {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials}`,
      'Idempotence-Key': uuidv4(),
    };
  }

  async createPayment(
    paymentDto: PaymentDto,
    user: Pick<AuthUser, 'id'>,
  ): Promise<YooKassaPaymentResponse> {
    const booking = await this.prismaService.booking.findUnique({
      where: { id: paymentDto.bookingId },
      include: { listing: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== user.id) {
      throw new ForbiddenException('You cannot pay for someone else booking');
    }
    if (booking.status === 'CANCELED' || booking.status === 'COMPLETED') {
      throw new BadRequestException('Booking cannot be paid');
    }

    const toUserId = booking.listing.ownerId;
    const amount = booking.totalPrice;

    const existingPayment = await this.prismaService.payment.findFirst({
      where: { fromUserId: user.id, listingId: booking.listingId, status: 'SUCCEEDED' },
    });
    if (existingPayment) {
      throw new BadRequestException('Booking is already paid');
    }

    const payment = await this.prismaService.payment.create({
      data: {
        amount,
        fromUserId: user.id,
        toUserId,
        listingId: booking.listingId,
      },
    });

    try {
      const response = await axios.post<YooKassaPaymentResponse>(
        `${this.baseUrl}/payments`,
        {
          amount: {
            value: amount.toFixed(2),
            currency: 'RUB',
          },
          confirmation: {
            type: 'redirect',
            return_url: paymentDto.returnUrl,
          },
          capture: true,
          description: 'Оплата бронирования',
          metadata: {
            paymentId: payment.id,
          },
        },
        { headers: this.headers },
      );

      await this.prismaService.payment.update({
        where: { id: payment.id },
        data: { yookassaId: response.data.id },
      });

      return response.data;
    } catch (error) {
      await this.prismaService.payment.delete({ where: { id: payment.id } });
      throw error;
    }
  }

  async getPayment(paymentId: string): Promise<YooKassaPaymentResponse> {
    const response = await axios.get<YooKassaPaymentResponse>(
      `${this.baseUrl}/payments/${paymentId}`,
      { headers: this.headers },
    );
    return response.data;
  }

  async getPayout(payoutId: string): Promise<YooKassaPayoutResponse> {
    const response = await axios.get<YooKassaPayoutResponse>(
      `${this.baseUrl}/payouts/${payoutId}`,
      { headers: this.payoutHeaders },
    );
    return response.data;
  }

  async createPayout(payoutDto: PayoutDto, user: Pick<AuthUser, 'id'>) {
    const userDb = await this.prismaService.user.findUnique({
      where: { id: user.id },
    });
    const balance = userDb?.balance ?? 0;
    if (balance <= 0) {
      throw new BadRequestException('Nothing to withdraw');
    }

    const response = await axios.post<YooKassaPayoutResponse>(
      `${this.baseUrl}/payouts`,
      {
        amount: {
          value: balance.toFixed(2),
          currency: 'RUB',
        },
        payout_destination_data: {
          type: 'bank_card',
          card: {
            number: payoutDto.recipientCardNumber,
          },
        },
        description: 'Выплата пользователю',
        metadata: {
          userId: user.id,
        },
      },
      { headers: this.payoutHeaders },
    );

    return response.data;
  }
}
