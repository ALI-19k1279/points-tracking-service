import { IsNumber, Min } from 'class-validator';

export class SpendPointsDto {
  @IsNumber()
  @Min(0)
  points: number;
}
