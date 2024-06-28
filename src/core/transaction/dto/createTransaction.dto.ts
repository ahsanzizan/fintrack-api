import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'The amount of money put into the transaction' })
  amount: number;

  @IsDateString()
  @IsOptional()
  @ApiProperty({ description: 'Date the transaction created' })
  transaction_date: Date;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "The transaction's description" })
  description: string;

  @IsEnum(TransactionType)
  @IsNotEmpty()
  @ApiProperty({ description: 'Type of the transaction' })
  transaction_type: TransactionType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "The category's name" })
  categoryName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "The transaction's used budget's id" })
  budgetId: string;
}

export default CreateTransactionDto;
