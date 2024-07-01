import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

enum OrderByEnum {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
}

enum OrderTypeEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PaginationDto {
  @IsInt()
  @IsOptional()
  @Min(1)
  page?: number;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(OrderByEnum)
  @IsOptional()
  order_by?: string;

  @IsEnum(OrderTypeEnum)
  @IsOptional()
  order_type?: string;
}
