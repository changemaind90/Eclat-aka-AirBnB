import { Controller, Post, Body, Res, UseGuards, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Response } from 'express';
import { UkassaService } from './ukassa.service';
import { PaymentDto } from './dto/payment.dto';
import { PayoutDto } from './dto/payout.dto';
import { AuthGuard } from '@nestjs/passport';
import type { RequestWithUser } from 'src/common/request-with-user';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly ukassaService: UkassaService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('pay')
  async createPayment(
    @Body() paymentDto: PaymentDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: RequestWithUser,
  ) {
    const response = await this.ukassaService.createPayment(
      paymentDto,
      req.user,
    );
    res.redirect(response.confirmation.confirmation_url);
  }

  @Post('credit-money')
  async creditMoney(
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    const event = body as {
      object?: {
        status?: string;
        metadata?: Record<string, unknown>;
        amount?: { value?: string | number };
        id?: string;
      };
    };

    if (event.object?.status === 'succeeded') {
      const metadata = event.object.metadata ?? {};
      const amountValue = event.object.amount?.value;
      const amount =
        typeof amountValue === 'number' ? amountValue : Number(amountValue);
      const id = event.object.id ?? '';
      await this.paymentsService.creditMoney({ ...metadata, amount, id });
    }
    res.status(200).send();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('payout')
  async createPayout(
    @Body() payoutDto: PayoutDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: RequestWithUser,
  ) {
    return await this.ukassaService.createPayout(payoutDto, req.user);
  }

  @Post('withdraw-money')
  async withdrawMoney(
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    const event = body as {
      object?: {
        status?: string;
        metadata?: Record<string, unknown>;
        amount?: { value?: string | number };
        id?: string;
      };
    };

    if (event.object?.status === 'succeeded') {
      const metadata = event.object.metadata ?? {};
      const amountValue = event.object.amount?.value;
      const amount =
        typeof amountValue === 'number' ? amountValue : Number(amountValue);
      const id = event.object.id ?? '';
      await this.paymentsService.withdrawMoney({ ...metadata, amount, id });
    }
    res.status(200).send();
  }
}
