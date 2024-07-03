import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MONTHS } from 'src/utils/constants';
import { ResponseTemplate } from 'src/utils/interceptors/transform.interceptor';

import { UseAuth } from '../auth/auth.decorator';
import { UserPayload } from '../auth/types';
import { GetReportParamDto } from './dto/getReportParam.dto';
import { ReportsService } from './reports.service';
import { MonthlyReport } from './types';

@Controller({ path: 'reports', version: '1' })
@ApiTags('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get(':year/:month')
  @ApiOperation({ summary: 'Get monthly report' })
  @ApiParam({
    name: 'year',
    required: true,
    type: Number,
    description: 'Year in YYYY format',
  })
  @ApiParam({
    name: 'month',
    required: true,
    type: Number,
    description: 'Month as an integer (1-12)',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the report',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
