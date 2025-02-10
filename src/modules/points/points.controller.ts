import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AddTransactionDto, SpendPointsDto } from './dto';
import { PointsService } from './points.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { API_OPERATION, CONTROLLER } from './constants';
import { API_TAGS } from '@common/constants/api-tags';

@ApiTags(API_TAGS.POINTS)
@Controller(CONTROLLER.POINTS)
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Post('add')
  @ApiBody({ type: AddTransactionDto, isArray: true })
  @ApiOperation({ summary: API_OPERATION.ADD_TRANSACTION })
  @HttpCode(HttpStatus.CREATED)
  addTransaction(@Body() transactions: AddTransactionDto[]) {
    return this.pointsService.addTransaction(transactions);
  }

  @Post('spend')
  @ApiBody({ type: SpendPointsDto })
  @ApiOperation({ summary: API_OPERATION.SPEND_POINTS })
  @HttpCode(HttpStatus.OK)
  spendPoints(@Body() spendPoints: SpendPointsDto) {
    return this.pointsService.spendPoints(spendPoints.points);
  }

  @Get('balances')
  @ApiOperation({ summary: API_OPERATION.GET_BALANCES })
  @HttpCode(HttpStatus.OK)
  getBalances() {
    return this.pointsService.getBalances();
  }
}
