/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { PrismaService } from 'prisma/prisma.service';

describe('BookingService', () => {
  let service: BookingService;

  const prisma = {
    listing: { findUnique: jest.fn() },
    booking: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((cb: (tx: unknown) => unknown) => cb(prisma)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<BookingService>(BookingService);
  });

  it('throws NotFound when listing does not exist', async () => {
    prisma.listing.findUnique.mockResolvedValue(null);
    await expect(
      service.createBook(
        { listingId: 1, startDate: '2026-01-01', endDate: '2026-01-03' },
        1,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws BadRequest when endDate is not after startDate', async () => {
    prisma.listing.findUnique.mockResolvedValue({ id: 1, pricePerNight: 100 });
    await expect(
      service.createBook(
        { listingId: 1, startDate: '2026-01-03', endDate: '2026-01-01' },
        1,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('computes totalPrice from nights and creates booking', async () => {
    prisma.listing.findUnique.mockResolvedValue({ id: 1, pricePerNight: 100 });
    prisma.booking.findFirst.mockResolvedValue(null);
    prisma.booking.create.mockResolvedValue({ id: 10 });

    await service.createBook(
      { listingId: 1, startDate: '2026-01-01', endDate: '2026-01-03' },
      7,
    );

    expect(prisma.booking.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ totalPrice: 200, status: 'PENDING' }),
      }),
    );
  });

  it('throws Conflict when dates overlap an existing booking', async () => {
    prisma.listing.findUnique.mockResolvedValue({ id: 1, pricePerNight: 100 });
    prisma.booking.findFirst.mockResolvedValue({ id: 99 });

    await expect(
      service.createBook(
        { listingId: 1, startDate: '2026-01-01', endDate: '2026-01-03' },
        7,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('forbids confirming a booking you do not own', async () => {
    prisma.booking.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.confirmBook(1, 2)).rejects.toThrow();
  });
});
