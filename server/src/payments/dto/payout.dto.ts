import { IsString, MinLength } from 'class-validator';

export class PayoutDto {
  @IsString()
  @MinLength(4)
  readonly recipientCardNumber: string;
}
