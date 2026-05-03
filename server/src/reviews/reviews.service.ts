import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { GetReviewsDto } from './dto/get-reviews.dto';
import { PrismaService } from 'prisma/prisma.service';
import type { AuthUser } from 'src/auth/types';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createReviewDto: CreateReviewDto, user: Pick<AuthUser, 'id'>) {
    const review = await this.prisma.review.create({
      data: {
        author: {
          connect: {
            id: user.id,
          },
        },
        listing: {
          connect: {
            id: createReviewDto.listingId,
          },
        },
        booking: {
          connect: {
            id: createReviewDto.bookingId,
          },
        },
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
      },
    });
    return review;
  }

  async getAllForListing(getReviewsDto: GetReviewsDto) {
    const reviews = await this.prisma.review.findMany({
      where: {
        listingId: getReviewsDto.listingId,
      },
    });

    const overallRating =
      reviews.length === 0
        ? 0
        : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    return {
      overallRating,
      reviews,
    };
  }
}
