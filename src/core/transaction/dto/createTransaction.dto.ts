import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
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
  @ApiProperty({ description: 'Category of the transaction' })
  categoryName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Payment method of the transaction' })
  paymentMethodName: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: "The transaction's used budget's id" })
  budgetId: string;
}
