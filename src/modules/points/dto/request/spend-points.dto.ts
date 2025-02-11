import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class SpendPointsDto {
  @IsNumber()
  @Min(0)
  @ApiProperty()
  points: number;
}
