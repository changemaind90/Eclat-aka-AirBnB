import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async createBook(createBookingDto: CreateBookingDto, userId: number) {
    const booking_id = await this.prisma.listing.findUnique({
      where: { id: createBookingDto.listingId },
    });
    if (!booking_id) throw new NotFoundException('Booking not found');

    const d1 = new Date(createBookingDto.startDate);
    const d2 = new Date(createBookingDto.endDate);

    const diffMs = Math.abs(d2.getTime() - d1.getTime());
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;

    return await this.prisma.booking.create({
      data: {
        startDate: new Date(createBookingDto.startDate),
        endDate: new Date(createBookingDto.endDate),
        totalPrice: booking_id.pricePerNight * days,
        status: 'PENDING',
        user: {
          connect: { id: userId },
        },
        listing: {
          connect: { id: createBookingDto.listingId },
        },
      },
    });
  }

  async confirmBook(id: number) {
    return await this.prisma.booking.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
      },
    });
  }

  async cancelBook(id: number) {
    return await this.prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELED',
      },
    });
  }

  async completeBook(id: number) {
    return await this.prisma.booking.update({
      where: { id },
      data: {
        status: 'COMPLETED',
      },
    });
  }

  async getBooks(userId: number) {
    return await this.prisma.booking.findMany({ where: { userId } });
  }

  async getBooksForOwner(userId: number) {
    const listings = await this.prisma.listing.findMany({
      where: { ownerId: userId },
    });
    const listingsIds = listings.map((listing) => listing.id);

    return await this.prisma.booking.findMany({
      where: {
        listingId: {
          in: listingsIds,
        },
      },
    });
  }
}
