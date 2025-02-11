import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AddTransactionDto, SpendPointsResponseDto } from './dto';
import { PayerRemainingBalance } from './types';
import { ERROR_MESSAGES } from '@common/constants';
import { Logger } from 'winston';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { sortByTimestamp } from '@libs/utils';
import { PointsRepository } from './repositories';
import { ITransactionEntity } from './interfaces';

@Injectable()
export class PointsService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly pointsRepository: PointsRepository,
  ) {}

  private validateTransactionRequest(
    transactions: Omit<ITransactionEntity, 'id'>[],
  ): void {
    const tempBalance: Record<string, number> =
      this.pointsRepository.getAllPayersBalances();

    for (const transaction of transactions) {
      const currentBalance = tempBalance[transaction.payer] || 0;
      tempBalance[transaction.payer] = currentBalance + transaction.points;

      if (tempBalance[transaction.payer] < 0) {
        throw new BadRequestException(
          ERROR_MESSAGES.NEGATIVE_BALANCE(
            transaction.payer,
            transaction.timestamp.toISOString(),
          ),
        );
      }
    }
  }

  private validateSpendPointsRequest(pointsToSpend: number): void {
    if (pointsToSpend <= 0) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_REQUEST);
    }

    const balances = this.pointsRepository.getAllPayersBalances();
    const totalPoints = Object.values(balances).reduce(
      (sum, points) => sum + points,
      0,
    );

    console.log('TOTAL POINTS', totalPoints);
    if (pointsToSpend > totalPoints) {
      throw new BadRequestException(ERROR_MESSAGES.INSUFFICIENT_POINTS);
    }
  }

  private calculateAvailablePoints(
    transaction: ITransactionEntity,
    sortedTransactions: ITransactionEntity[],
    processedTransactions: ITransactionEntity[],
  ): number {
    const futureNegativePoints = sortedTransactions
      .filter(
        (t) =>
          t.payer === transaction.payer &&
          t.points < 0 &&
          t.timestamp > transaction.timestamp &&
          !processedTransactions.includes(t),
      )
      .reduce((sum, t) => sum + t.points, 0);

    return transaction.points + futureNegativePoints;
  }

  addTransaction(transactions: AddTransactionDto[]): Array<ITransactionEntity> {
    try {
      const newTransactions: Omit<ITransactionEntity, 'id'>[] =
        transactions.map((t) => ({
          payer: t.payer,
          points: t.points,
          timestamp: new Date(t.timestamp),
        }));

      const existingTransactions: Omit<ITransactionEntity, 'id'>[] =
        this.pointsRepository.getTransactions()?.map((t) => ({
          payer: t.payer,
          points: t.points,
          timestamp: t.timestamp,
        }));

      const allTransactions = sortByTimestamp([
        ...existingTransactions,
        ...newTransactions,
      ]);

      this.validateTransactionRequest(allTransactions);

      const updatedTransactions =
        this.pointsRepository.addTransactions(newTransactions);

      return updatedTransactions;
    } catch (error) {
      this.logger.error(error.message, PointsService.name);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        ERROR_MESSAGES.SOMETHING_WENT_WRONG,
      );
    }
  }

  spendPoints(pointsToSpend: number): SpendPointsResponseDto[] {
    try {
      this.validateSpendPointsRequest(pointsToSpend);

      const transactions = this.pointsRepository.getTransactions();

      const sortedTransactions = sortByTimestamp(transactions);
      const spentPoints: PayerRemainingBalance = {};
      let remainingPointsToSpend = pointsToSpend;
      const processedTransactions: ITransactionEntity[] = [];

      for (const transaction of sortedTransactions) {
        if (remainingPointsToSpend <= 0) break;

        const payer = transaction.payer;

        const pointsAvailable = this.calculateAvailablePoints(
          transaction,
          sortedTransactions,
          processedTransactions,
        );

        if (pointsAvailable <= 0) {
          processedTransactions.push(transaction);
          continue;
        }

        const pointsToDeduct = Math.min(
          pointsAvailable,
          remainingPointsToSpend,
        );
        spentPoints[payer] = (spentPoints[payer] || 0) - pointsToDeduct;
        remainingPointsToSpend -= pointsToDeduct;

        processedTransactions.push(transaction);
      }

      this.pointsRepository.updateBalances(spentPoints);

      const response: SpendPointsResponseDto[] = Object.entries(
        spentPoints,
      ).map(([payer, points]) => ({
        payer,
        points,
      }));

      return response;
    } catch (error) {
      this.logger.error(error.message, PointsService.name);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error.message,
        ERROR_MESSAGES.SOMETHING_WENT_WRONG,
      );
    }
  }

  getBalances(): PayerRemainingBalance {
    return this.pointsRepository.getAllPayersBalances();
  }
}
