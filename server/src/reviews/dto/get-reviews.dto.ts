import { IsInt } from 'class-validator';

export class GetReviewsDto {
  @IsInt()
  readonly listingId: number;
}
