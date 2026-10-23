import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { AuthGuard } from '@nestjs/passport';
import type { RequestWithUser } from 'src/common/request-with-user';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() createReviewDto: CreateReviewDto,
    @Req() req: RequestWithUser,
  ) {
    return this.reviewsService.create(createReviewDto, req.user);
  }

  @Get()
  getAllForListing(@Query('listingId', ParseIntPipe) listingId: number) {
    return this.reviewsService.getAllForListing(listingId);
  }
}
