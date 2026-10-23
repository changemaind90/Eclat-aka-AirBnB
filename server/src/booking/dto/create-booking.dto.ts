import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  readonly listingId: number;

  @ApiProperty({ example: '2025-06-20' })
  @IsDateString()
  readonly startDate: string;

  @ApiProperty({ example: '2025-06-27' })
  @IsDateString()
  readonly endDate: string;
}
