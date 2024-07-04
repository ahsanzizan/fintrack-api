import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The reset token' })
  resetToken: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The new password' })
  newPassword: string;
}
