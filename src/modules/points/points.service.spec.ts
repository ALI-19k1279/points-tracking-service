import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PointsService } from './points.service';
import { PointsRepository } from './repositories';
import { AddTransactionDto } from './dto';
import { ITransactionEntity } from './interfaces';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

describe('PointsService', () => {
  let service: PointsService;
  let pointsRepository: PointsRepository;
  let logger: Logger;

  const mockTransactionEntity = (
    dto: AddTransactionDto,
  ): ITransactionEntity => ({
    id: expect.any(String),
    payer: dto.payer,
    points: dto.points,
    timestamp: new Date(dto.timestamp),
  });

  beforeEach(async () => {
    logger = { error: jest.fn() } as unknown as Logger;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointsService,
        {
          provide: PointsRepository,
          useValue: {
            getAllPayersBalances: jest.fn(),
            getTransactions: jest.fn(),
            addTransactions: jest.fn(),
          },
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: logger,
        },
      ],
    }).compile();

    service = module.get<PointsService>(PointsService);
    pointsRepository = module.get<PointsRepository>(PointsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addTransaction', () => {
    it('should add transactions and update balances', () => {
      const transactionDto = [
        {
          payer: 'Payer1',
          points: 100,
          timestamp: '2020-10-31T11:00:00Z',
        },
      ];

      const expectedEntities = transactionDto.map(mockTransactionEntity);

      jest.spyOn(pointsRepository, 'getAllPayersBalances').mockReturnValue({});
      jest.spyOn(pointsRepository, 'getTransactions').mockReturnValue([]);
      jest
        .spyOn(pointsRepository, 'addTransactions')
        .mockReturnValue(expectedEntities);

      const result = service.addTransaction(transactionDto);

      expect(result).toEqual(expectedEntities);
      expect(pointsRepository.addTransactions).toHaveBeenCalledWith(
        transactionDto.map((t) => ({
          payer: t.payer,
          points: t.points,
          timestamp: new Date(t.timestamp),
        })),
      );
    });

    it('should throw BadRequestException for insufficient points', () => {
      const transactions = [
        { payer: 'Payer1', points: -500, timestamp: '2020-10-31T11:00:00Z' },
      ];

      jest.spyOn(pointsRepository, 'getAllPayersBalances').mockReturnValue({
        Payer1: 200,
      });
      jest.spyOn(pointsRepository, 'getTransactions').mockReturnValue([]);

      expect(() => service.addTransaction(transactions)).toThrow(
        BadRequestException,
      );
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('would make balance negative'),
        PointsService.name,
      );
    });

    it('should throw InternalServerErrorException for unexpected errors', () => {
      const transactions = [
        { payer: 'Payer1', points: 100, timestamp: '2020-10-31T11:00:00Z' },
      ];

      jest.spyOn(pointsRepository, 'getAllPayersBalances').mockReturnValue({});

      jest.spyOn(pointsRepository, 'getTransactions').mockImplementation(() => {
        throw new Error('Database error');
      });

      expect(() => service.addTransaction(transactions)).toThrow(
        InternalServerErrorException,
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Database error',
        PointsService.name,
      );
    });
  });
});
