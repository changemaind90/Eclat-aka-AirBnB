import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import type { RequestWithUser } from 'src/common/request-with-user';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @ApiResponse({
    example: {
      id: 7,
      startDate: '2025-06-20T00:00:00.000Z',
      endDate: '2025-06-27T00:00:00.000Z',
      totalPrice: 9999,
      status: 'PENDING',
      userId: 7,
      listingId: 2,
    },
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  createBook(
    @Body() createBookingDto: CreateBookingDto,
    @Req() req: RequestWithUser,
  ) {
    return this.bookingService.createBook(createBookingDto, req.user.id);
  }

  @ApiResponse({
    example: {
      id: 7,
      startDate: '2025-06-20T00:00:00.000Z',
      endDate: '2025-06-27T00:00:00.000Z',
      totalPrice: 9999,
      status: 'CONFIRMED',
      userId: 7,
      listingId: 2,
    },
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('/confirm/:id')
  confirmBook(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    return this.bookingService.confirmBook(id, req.user.id);
  }

  @ApiResponse({
    example: {
      id: 7,
      startDate: '2025-06-20T00:00:00.000Z',
      endDate: '2025-06-27T00:00:00.000Z',
      totalPrice: 9999,
      status: 'CANCELED',
      userId: 7,
      listingId: 2,
    },
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('/cancel/:id')
  cancelBook(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    return this.bookingService.cancelBook(id, req.user.id);
  }

  @ApiResponse({
    example: {
      id: 7,
      startDate: '2025-06-20T00:00:00.000Z',
      endDate: '2025-06-27T00:00:00.000Z',
      totalPrice: 9999,
      status: 'COMPLETED',
      userId: 7,
      listingId: 2,
    },
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('/complete/:id')
  completeBook(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    return this.bookingService.completeBook(id, req.user.id);
  }

  @ApiResponse({
    example: [
      {
        id: 1,
        startDate: '2025-05-15T00:00:00.000Z',
        endDate: '2025-05-16T00:00:00.000Z',
        totalPrice: 99999,
        status: 'COMPLETED',
        userId: 7,
        listingId: 3,
      },
      {
        id: 6,
        startDate: '2025-06-20T00:00:00.000Z',
        endDate: '2025-06-27T00:00:00.000Z',
        totalPrice: 9999,
        status: 'CONFIRMED',
        userId: 7,
        listingId: 2,
      },
      {
        id: 7,
        startDate: '2025-06-20T00:00:00.000Z',
        endDate: '2025-06-27T00:00:00.000Z',
        totalPrice: 9999,
        status: 'CONFIRMED',
        userId: 7,
        listingId: 2,
      },
    ],
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  getBooks(@Req() req: RequestWithUser) {
    return this.bookingService.getBooks(req.user.id);
  }

  @ApiResponse({
    example: [
      {
        id: 2,
        startDate: '2025-05-15T00:00:00.000Z',
        endDate: '2025-05-16T00:00:00.000Z',
        totalPrice: 99999,
        status: 'CONFIRMED',
        userId: 1,
        listingId: 3,
      },
      {
        id: 3,
        startDate: '2025-05-15T00:00:00.000Z',
        endDate: '2025-05-16T00:00:00.000Z',
        totalPrice: 99999,
        status: 'CONFIRMED',
        userId: 1,
        listingId: 3,
      },
      {
        id: 4,
        startDate: '2025-05-15T00:00:00.000Z',
        endDate: '2025-05-16T00:00:00.000Z',
        totalPrice: 99999,
        status: 'CONFIRMED',
        userId: 1,
        listingId: 2,
      },
    ],
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('for-owner')
  getBooksForOwner(@Req() req: RequestWithUser) {
    return this.bookingService.getBooksForOwner(req.user.id);
  }
}
