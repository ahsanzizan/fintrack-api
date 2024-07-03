import { Controller, Get, Param } from '@nestjs/common';
import { MONTHS } from 'src/utils/constants';
import { ResponseTemplate } from 'src/utils/interceptors/transform.interceptor';

import { UseAuth } from '../auth/auth.decorator';
import { UserPayload } from '../auth/types';
import { GetReportParamDto } from './dto/getReportParam.dto';
import { ReportsService } from './reports.service';
import { MonthlyReport } from './types';

@Controller({ path: 'reports', version: '1' })
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get(':year/:month')
  async getReport(
    @UseAuth() user: UserPayload,
    @Param() params: GetReportParamDto,
  ): Promise<ResponseTemplate<MonthlyReport>> {
    const { year, month: paramMonth } = params;
    const month = MONTHS[paramMonth - 1];

    const report = await this.reportsService.getReportByDate(user, year, month);

    return {
      message: `Successfully retrieved the report for ${month}, ${year} for ${user.name}`,
      result: report,
    };
  }
}
