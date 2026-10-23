import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateListingDto {
  @ApiProperty({ example: 'something' })
  @IsString()
  @MinLength(1)
  readonly title: string;

  @ApiProperty({ example: 'some description' })
  @IsString()
  @MinLength(1)
  readonly description: string;

  @ApiProperty({ example: 'Country, City, Street, Building' })
  @IsString()
  @MinLength(1)
  readonly address: string;

  @ApiProperty({ example: 99999 })
  @IsInt()
  @Min(1)
  @Max(10000000)
  readonly pricePerNight: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  @Max(10)
  readonly numberOfGuests: number;
}
