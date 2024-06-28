import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBudgetDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'The amount of money that the budget has' })
  amount: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "The budget's name" })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: "The budget's goal" })
  goal?: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Starting date of the budget' })
  start_date: Date;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Ending date of the budget' })
  end_date: Date;
}

export default CreateBudgetDto;
