import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateBudgetDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ description: 'The amount of money that the budget has' })
  amount: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: "The budget's name" })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: "The budget's goal" })
  goal?: string;

  @IsDateString()
  @IsOptional()
  @ApiProperty({ description: 'Starting date of the budget' })
  start_date: Date;

  @IsDateString()
  @IsOptional()
  @ApiProperty({ description: 'Ending date of the budget' })
  end_date: Date;
}

export default UpdateBudgetDto;
