import { IsNotEmpty } from 'class-validator';

import { IsMonth } from '../validator/month.validator';
import { IsYear } from '../validator/year.validator';

export class GetReportParamDto {
  @IsYear()
  @IsNotEmpty()
  year: number;

  @IsMonth()
  @IsNotEmpty()
  month: number;
}
