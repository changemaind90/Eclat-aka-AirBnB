import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createListingDto: CreateListingDto, userId: number) {
    return this.prisma.listing.create({
      data: {
        ...createListingDto,
        owner: { connect: { id: userId } },
      },
    });
  }

  async find(userId: number, pagination: { skip: number; take: number }) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.listing.findMany({
        where: { ownerId: userId },
        orderBy: { id: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.listing.count({ where: { ownerId: userId } }),
    ]);
    return { items, total };
  }

  async findAll(pagination: { skip: number; take: number }) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.listing.findMany({
        orderBy: { id: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.listing.count(),
    ]);
    return { items, total };
  }

  async findOne(id: number) {
    const listing = await this.prisma.listing.findFirst({ where: { id } });
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  async update(
    id: number,
    updateListingDto: UpdateListingDto,
    ownerId: number,
  ) {
    const result = await this.prisma.listing.updateMany({
      where: { id, ownerId },
      data: updateListingDto,
    });
    if (result.count === 0) throw new NotFoundException('Listing not found');
    return this.prisma.listing.findUnique({ where: { id } });
  }

  async remove(id: number, ownerId: number) {
    const result = await this.prisma.listing.deleteMany({
      where: { id, ownerId },
    });
    if (result.count === 0) throw new NotFoundException('Listing not found');
    return { success: true };
  }
}
