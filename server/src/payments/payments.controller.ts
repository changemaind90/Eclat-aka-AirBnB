import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { PaymentsService } from './payments.service';
import { UkassaService } from './ukassa.service';
import { PaymentDto } from './dto/payment.dto';
import { PayoutDto } from './dto/payout.dto';
import type { RequestWithUser } from 'src/common/request-with-user';

type YooKassaWebhook = {
  event?: string;
  object?: {
    id?: string;
    status?: string;
    amount?: { value?: string | number };
    metadata?: Record<string, unknown>;
  };
};

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly ukassaService: UkassaService,
  ) {}

  private assertTrustedIp(ip: string | undefined) {
    const allowlist = (process.env.YOOKASSA_WEBHOOK_IPS ?? '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
    if (allowlist.length === 0) return;
    if (!ip || !allowlist.includes(ip)) {
      throw new ForbiddenException('Untrusted webhook source');
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('pay')
  async createPayment(
    @Body() paymentDto: PaymentDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ) {
    const response = await this.ukassaService.createPayment(
      paymentDto,
      req.user,
    );
    const confirmationUrl = response.confirmation?.confirmation_url;
    if (!confirmationUrl) {
      throw new ForbiddenException('Payment confirmation URL is missing');
    }
    return res.redirect(confirmationUrl);
  }

  @HttpCode(200)
  @Post('credit-money')
  async creditMoney(
    @Body() body: YooKassaWebhook,
    @Req() req: { ip?: string },
  ) {
    this.assertTrustedIp(req.ip);
    const object = body.object;
    if (object?.status === 'succeeded' && object.id) {
      const verified = await this.ukassaService.getPayment(object.id);
      if (verified.status === 'succeeded') {
        await this.paymentsService.creditMoney({
          id: object.id,
          amount: Number(verified.amount.value),
        });
      }
    }
    return { ok: true };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('payout')
  async createPayout(
    @Body() payoutDto: PayoutDto,
    @Req() req: RequestWithUser,
  ) {
    return this.ukassaService.createPayout(payoutDto, req.user);
  }

  @HttpCode(200)
  @Post('withdraw-money')
  async withdrawMoney(
    @Body() body: YooKassaWebhook,
    @Req() req: { ip?: string },
  ) {
    this.assertTrustedIp(req.ip);
    const object = body.object;
    if (object?.status === 'succeeded' && object.id) {
      // Re-read payout from YooKassa: never trust userId/amount from the body.
      const verified = await this.ukassaService.getPayout(object.id);
      const userId = Number(verified.metadata?.userId);
      if (verified.status === 'succeeded' && userId) {
        await this.paymentsService.withdrawMoney({
          id: object.id,
          amount: Number(verified.amount.value),
          userId,
        });
      }
    }
    return { ok: true };
  }
}
