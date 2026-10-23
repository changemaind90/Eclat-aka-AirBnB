import { IsInt, IsUrl } from 'class-validator';

export class PaymentDto {
  @IsInt()
  readonly bookingId: number;

  @IsUrl()
  readonly returnUrl: string;
}
