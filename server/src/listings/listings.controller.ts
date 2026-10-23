import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import type { RequestWithUser } from 'src/common/request-with-user';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  private parsePagination(page?: string, limit?: string) {
    const p = Math.max(1, parseInt(page ?? '1', 10) || 1);
    const l = Math.min(100, Math.max(1, parseInt(limit ?? '20', 10) || 20));
    return { skip: (p - 1) * l, take: l };
  }

  @ApiBearerAuth()
  @ApiResponse({
    example: {
      id: 2,
      title: 'test1',
      description: 'some1',
      address: 'somewhere1',
      pricePerNight: 999,
      numberOfGuests: 50,
      ownerId: 7,
    },
  })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() createListingDto: CreateListingDto,
    @Req() req: RequestWithUser,
  ) {
    return this.listingsService.create(createListingDto, req.user.id);
  }

  @ApiBearerAuth()
  @ApiResponse({
    example: [
      {
        id: 2,
        title: 'test1',
        description: 'some1',
        address: 'somewhere1',
        pricePerNight: 999,
        numberOfGuests: 50,
        ownerId: 1,
      },
      {
        id: 3,
        title: 'test2',
        description: 'some2',
        address: 'somewhere2',
        pricePerNight: 5555,
        numberOfGuests: 100,
        ownerId: 1,
      },
    ],
  })
  @UseGuards(AuthGuard('jwt'))
  @Get()
  find(
    @Req() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.listingsService.find(
      req.user.id,
      this.parsePagination(page, limit),
    );
  }

  @ApiResponse({
    example: [
      {
        id: 2,
        title: 'test1',
        description: 'some1',
        address: 'somewhere1',
        pricePerNight: 999,
        numberOfGuests: 50,
        ownerId: 7,
      },
      {
        id: 3,
        title: 'test2',
        description: 'some2',
        address: 'somewhere2',
        pricePerNight: 5555,
        numberOfGuests: 100,
        ownerId: 16,
      },
    ],
  })
  @Get('all')
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.listingsService.findAll(this.parsePagination(page, limit));
  }

  @ApiResponse({
    example: {
      id: 2,
      title: 'test1',
      description: 'some1',
      address: 'somewhere1',
      pricePerNight: 999,
      numberOfGuests: 50,
      ownerId: 7,
    },
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.listingsService.findOne(id);
  }

  @ApiResponse({
    example: {
      id: 2,
      title: 'test1',
      description: 'some1',
      address: 'somewhere1',
      pricePerNight: 999,
      numberOfGuests: 50,
      ownerId: 7,
    },
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateListingDto: UpdateListingDto,
    @Req() req: RequestWithUser,
  ) {
    return this.listingsService.update(id, updateListingDto, req.user.id);
  }

  @ApiResponse({
    example: {
      id: 2,
      title: 'test1',
      description: 'some1',
      address: 'somewhere1',
      pricePerNight: 999,
      numberOfGuests: 50,
      ownerId: 7,
    },
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.listingsService.remove(id, req.user.id);
  }
}
