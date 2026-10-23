import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { UkassaService } from './ukassa.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, UkassaService],
})
export class PaymentsModule {}
