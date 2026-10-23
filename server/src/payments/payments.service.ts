import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

type WebhookPayload = {
  id: string;
  amount: number;
  userId?: number;
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async creditMoney({ id, amount }: WebhookPayload) {
    if (!id) return;

    const payment = await this.prisma.payment.findUnique({
      where: { yookassaId: id },
    });
    if (!payment || payment.status === 'SUCCEEDED') return;

    if (Math.round(amount) !== payment.amount) {
      this.logger.warn(
        `Payment ${id} amount mismatch: expected ${payment.amount}, got ${amount}`,
      );
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.payment.updateMany({
        where: { id: payment.id, status: 'PENDING' },
        data: { status: 'SUCCEEDED' },
      });
      if (updated.count === 0) return;

      await tx.transaction.create({
        data: {
          amount: payment.amount,
          fromId: payment.fromUserId,
          toId: payment.toUserId,
          listingId: payment.listingId,
          paymentId: id,
        },
      });
      await tx.user.update({
        where: { id: payment.toUserId },
        data: { balance: { increment: payment.amount } },
      });
    });
  }

  async withdrawMoney({ id, amount, userId }: WebhookPayload) {
    if (!id || !userId) return;

    const rounded = Math.round(amount);
    if (!Number.isFinite(rounded) || rounded <= 0) return;

    try {
      await this.prisma.$transaction(async (tx) => {
        // Unique paymentId guarantees idempotency for concurrent webhooks.
        await tx.transaction.create({
          data: {
            amount: rounded,
            fromId: userId,
            paymentId: id,
          },
        });

        const updated = await tx.user.updateMany({
          where: { id: userId, balance: { gte: rounded } },
          data: { balance: { decrement: rounded } },
        });
        if (updated.count === 0) {
          throw new BadRequestException('Insufficient balance');
        }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return;
      }
      throw error;
    }
  }
}
