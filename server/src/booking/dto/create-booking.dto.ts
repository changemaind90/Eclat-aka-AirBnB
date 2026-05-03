import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 1 })
  readonly listingId: number;

  @ApiProperty({ example: '2025-06-20' })
  readonly startDate: string;

  @ApiProperty({ example: '2025-06-27' })
  readonly endDate: string;
}
