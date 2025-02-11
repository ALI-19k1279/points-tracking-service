import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsString } from 'class-validator';

export class AddTransactionDto {
  @IsString()
  @ApiProperty()
  payer: string;

  @IsNumber()
  @ApiProperty()
  points: number;

  @IsDateString()
  @ApiProperty()
  timestamp: string;
}
