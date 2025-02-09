import { Body, Controller, Get, Post } from '@nestjs/common';
import { AddTransactionDto, SpendPointsDto } from './dto';
import { PointsService } from './points.service';

@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Post('add')
  addTransaction(@Body() transaction: AddTransactionDto) {
    return this.pointsService.addTransaction(transaction);
  }

  @Post('spend')
  spendPoints(@Body() spendPoints: SpendPointsDto) {
    return this.pointsService.spendPoints(spendPoints.points);
  }

  @Get('balances')
  getBalances() {
    return this.pointsService.getBalances();
  }
}
