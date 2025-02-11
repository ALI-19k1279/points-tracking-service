import { Module } from '@nestjs/common';
import { PointsService } from './points.service';
import { PointsController } from './points.controller';
import { PointsRepository } from './repositories';

@Module({
  providers: [PointsService, PointsRepository],
  controllers: [PointsController],
})
export class PointsModule {}
