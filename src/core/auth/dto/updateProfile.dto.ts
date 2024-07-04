import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: "The user's name" })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: "The user's email" })
  email?: string;
}
