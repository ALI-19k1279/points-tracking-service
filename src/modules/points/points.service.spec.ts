import { Test, TestingModule } from '@nestjs/testing';
import { PointsService } from './points.service';
import { BadRequestException } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { AddTransactionDto } from './dto';

describe('PointsService', () => {
  let service: PointsService;
  let logger: Logger;

  beforeEach(async () => {
    logger = { error: jest.fn() } as unknown as Logger;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointsService,
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: logger,
        },
      ],
    }).compile();

    service = module.get<PointsService>(PointsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add transactions and update balances', () => {
    const transactions: AddTransactionDto[] = [
      { payer: 'DANNON', points: 1000, timestamp: '2020-11-02T14:00:00Z' },
      { payer: 'UNILEVER', points: 200, timestamp: '2020-10-31T11:00:00Z' },
    ];

    const result = service.addTransaction(transactions);

    expect(result.length).toBe(2);
    expect(service.getBalances()).toEqual({ DANNON: 1000, UNILEVER: 200 });
  });

  it('should throw error for invalid transaction request', () => {
    const transactions: AddTransactionDto[] = [
      { payer: 'DANNON', points: -1000, timestamp: '2020-11-02T14:00:00Z' },
    ];

    expect(() => service.addTransaction(transactions)).toThrow(
      BadRequestException,
    );
  });

  it('should spend points and update balances', () => {
    service.addTransaction([
      { payer: 'DANNON', points: 1000, timestamp: '2020-11-02T14:00:00Z' },
      { payer: 'UNILEVER', points: 200, timestamp: '2020-10-31T11:00:00Z' },
    ]);

    const result = service.spendPoints(500);

    expect(result).toEqual([
      { payer: 'UNILEVER', points: -200 },
      { payer: 'DANNON', points: -300 },
    ]);
    expect(service.getBalances()).toEqual({ DANNON: 700, UNILEVER: 0 });
  });

  it('should throw error for invalid spend points request', () => {
    expect(() => service.spendPoints(-500)).toThrow(BadRequestException);
  });

  it('should throw error for insufficient points', () => {
    service.addTransaction([
      { payer: 'DANNON', points: 1000, timestamp: '2020-11-02T14:00:00Z' },
    ]);

    expect(() => service.spendPoints(1500)).toThrow(BadRequestException);
  });

  it('should return current balances', () => {
    service.addTransaction([
      { payer: 'DANNON', points: 1000, timestamp: '2020-11-02T14:00:00Z' },
    ]);

    const balances = service.getBalances();

    expect(balances).toEqual({ DANNON: 1000 });
  });
});
