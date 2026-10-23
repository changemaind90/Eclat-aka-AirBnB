import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'some@gmail.com' })
  @IsEmail()
  readonly email: string;

  @ApiProperty({ example: '12345' })
  @IsString()
  @MinLength(6)
  readonly password: string;
}
