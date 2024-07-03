import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { IsMonth } from '../validator/month.validator';
import { IsYear } from '../validator/year.validator';

export class GetReportParamDto {
  @IsYear()
  @IsNotEmpty()
  @ApiProperty({ example: 2024, description: 'Year in YYYY format' })
  year: number;

  @IsMonth()
  @IsNotEmpty()
  @ApiProperty({ example: 7, description: 'Month as an integer (1-12)' })
  month: number;
}
