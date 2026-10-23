import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { PrismaService } from 'prisma/prisma.service';
import type { AuthUser } from 'src/auth/types';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createReviewDto: CreateReviewDto, user: Pick<AuthUser, 'id'>) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: createReviewDto.bookingId },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== user.id) {
      throw new ForbiddenException('You can review only your own booking');
    }
    if (booking.listingId !== createReviewDto.listingId) {
      throw new BadRequestException('Booking does not belong to this listing');
    }
    if (booking.status !== 'COMPLETED') {
      throw new BadRequestException('You can review only completed bookings');
    }

    const existing = await this.prisma.review.findFirst({
      where: { bookingId: createReviewDto.bookingId },
    });
    if (existing) {
      throw new ConflictException('Booking is already reviewed');
    }

    return this.prisma.review.create({
      data: {
        author: { connect: { id: user.id } },
        listing: { connect: { id: createReviewDto.listingId } },
        booking: { connect: { id: createReviewDto.bookingId } },
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
      },
    });
  }

  async getAllForListing(listingId: number) {
    const reviews = await this.prisma.review.findMany({
      where: { listingId },
      orderBy: { id: 'desc' },
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
