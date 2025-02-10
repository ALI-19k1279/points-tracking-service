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
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { Http } from 'winston/lib/winston/transports';

@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Post('add')
  @ApiBody({ type: AddTransactionDto })
  @ApiOperation({ summary: 'Add a transaction' })
  @HttpCode(HttpStatus.CREATED)
  addTransaction(@Body() transaction: AddTransactionDto) {
    return this.pointsService.addTransaction(transaction);
  }

  @Post('spend')
  @ApiBody({ type: SpendPointsDto })
  @ApiOperation({ summary: 'Spend points' })
  @HttpCode(HttpStatus.OK)
  spendPoints(@Body() spendPoints: SpendPointsDto) {
    return this.pointsService.spendPoints(spendPoints.points);
  }

  @Get('balances')
  @ApiOperation({ summary: 'Get balances' })
  @HttpCode(HttpStatus.OK)
  getBalances() {
    return this.pointsService.getBalances();
  }
}
