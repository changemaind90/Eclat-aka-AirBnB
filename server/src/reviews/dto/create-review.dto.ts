import { IsInt, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  readonly listingId: number;

  @IsInt()
  readonly bookingId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  readonly rating: number;

  @IsString()
  @MinLength(1)
  readonly comment: string;
}
