import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'some@gmail.com' })
  @IsEmail()
  readonly email: string;

  @ApiProperty({ example: '12345' })
  @IsString()
  readonly password: string;
}
