import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

type CreditMetadata = {
  id: string;
  amount: number;
  toUserId: number;
  fromUserId: number;
  listingId: number;
};

type WithdrawMetadata = {
  id: string;
  amount: number;
  userId: number;
};

@Injectable()
export class PaymentsService {
  constructor(private readonly prismaService: PrismaService) {}

  async creditMoney(metadata: Record<string, unknown>) {
    const m = metadata as Partial<CreditMetadata>;
    if (!m.id) return;

    const transaction = await this.prismaService.transaction.findFirst({
      where: { paymentId: m.id },
    });

    if (!transaction) {
      const amount = typeof m.amount === 'number' ? m.amount : Number(m.amount);
      const toUserId = Number(m.toUserId);
      const fromUserId = Number(m.fromUserId);
      const listingId = Number(m.listingId);

      await this.prismaService.transaction.create({
        data: {
          amount: Math.round(amount),
          to: {
            connect: {
              id: toUserId,
            },
          },
          from: {
            connect: {
              id: fromUserId,
            },
          },
          listing: {
            connect: {
              id: listingId,
            },
          },
          paymentId: m.id,
        },
      });
      await this.prismaService.user.update({
        where: { id: toUserId },
        data: {
          balance: {
            increment: Math.round(amount),
          },
        },
      });
    }
  }

  async withdrawMoney(metadata: Record<string, unknown>) {
    const m = metadata as Partial<WithdrawMetadata>;
    if (!m.id) return;

    const transaction = await this.prismaService.transaction.findFirst({
      where: { paymentId: m.id },
    });

    if (!transaction) {
      const amount = typeof m.amount === 'number' ? m.amount : Number(m.amount);
      const userId = Number(m.userId);
      await this.prismaService.transaction.create({
        data: {
          amount: Math.round(amount),
          from: {
            connect: {
              id: userId,
            },
          },
          paymentId: m.id,
        },
      });
      await this.prismaService.user.update({
        where: { id: userId },
        data: {
          balance: 0,
        },
      });
    }
  }
}
