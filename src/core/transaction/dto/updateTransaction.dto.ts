import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateTransactionDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ description: 'The amount of money put into the transaction' })
  amount?: number;

  @IsDateString()
  @IsOptional()
  @ApiProperty({ description: 'Date the transaction created' })
  transaction_date?: Date;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: "The transaction's description" })
  description?: string;

  @IsEnum(TransactionType)
  @IsOptional()
  @ApiProperty({ description: 'Type of the transaction' })
  transaction_type?: TransactionType;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Category of the transaction' })
  categoryName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Payment method of the transaction' })
  paymentMethodName?: string;

  @IsUUID()
  @IsOptional()
  @ApiProperty({ description: "The transaction's used budget's id" })
  budgetId?: string;
}

export default UpdateTransactionDto;
