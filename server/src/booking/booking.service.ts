import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PrismaService } from 'prisma/prisma.service';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async createBook(createBookingDto: CreateBookingDto, userId: number) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: createBookingDto.listingId },
    });
    if (!listing) throw new NotFoundException('Listing not found');

    const startDate = new Date(createBookingDto.startDate);
    const endDate = new Date(createBookingDto.endDate);
    if (endDate <= startDate) {
      throw new BadRequestException('endDate must be after startDate');
    }
    const nights = Math.max(
      1,
      Math.ceil((endDate.getTime() - startDate.getTime()) / MS_PER_DAY),
    );

    return this.prisma.$transaction(async (tx) => {
      const overlapping = await tx.booking.findFirst({
        where: {
          listingId: createBookingDto.listingId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          startDate: { lt: endDate },
          endDate: { gt: startDate },
        },
      });
      if (overlapping) {
        throw new ConflictException(
          'Listing is already booked for the selected dates',
        );
      }

      return tx.booking.create({
        data: {
          startDate,
          endDate,
          totalPrice: listing.pricePerNight * nights,
          status: 'PENDING',
          user: { connect: { id: userId } },
          listing: { connect: { id: createBookingDto.listingId } },
        },
      });
    });
  }

  async confirmBook(id: number, userId: number) {
    const result = await this.prisma.booking.updateMany({
      where: {
        id,
        status: 'PENDING',
        listing: { ownerId: userId },
      },
      data: { status: 'CONFIRMED' },
    });
    if (result.count === 0) {
      throw new ForbiddenException('Booking not found or cannot be confirmed');
    }
    return this.prisma.booking.findUnique({ where: { id } });
  }

  async cancelBook(id: number, userId: number) {
    const result = await this.prisma.booking.updateMany({
      where: {
        id,
        userId,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      data: { status: 'CANCELED' },
    });
    if (result.count === 0) {
      throw new ForbiddenException('Booking not found or cannot be canceled');
    }
    return this.prisma.booking.findUnique({ where: { id } });
  }

  async completeBook(id: number, userId: number) {
    const result = await this.prisma.booking.updateMany({
      where: {
        id,
        status: 'CONFIRMED',
        listing: { ownerId: userId },
      },
      data: { status: 'COMPLETED' },
    });
    if (result.count === 0) {
      throw new ForbiddenException('Booking not found or cannot be completed');
    }
    return this.prisma.booking.findUnique({ where: { id } });
  }

  async getBooks(userId: number) {
    return this.prisma.booking.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });
  }

  async getBooksForOwner(userId: number) {
    return this.prisma.booking.findMany({
      where: { listing: { ownerId: userId } },
      orderBy: { startDate: 'desc' },
    });
  }
}
