import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AddTransactionDto } from './dto';
import {
  PayerRemainingBalance,
  SpendPointsResponse,
  Transaction,
} from './types';
import { ERROR_MESSAGES } from '@common/constants';
import { Logger } from 'winston';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { sortByTimestamp } from '@libs/utils';

@Injectable()
export class PointsService {
  private readonly transactions: Transaction[] = [];
  private balances: PayerRemainingBalance = {};

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  private validateTransactionRequest(transactions: Transaction[]): void {
    const tempBalance: Record<string, number> = { ...this.balances };
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

    const totalPoints = Object.values(this.balances).reduce(
      (sum, points) => sum + points,
      0,
    );

    if (pointsToSpend > totalPoints) {
      throw new BadRequestException(ERROR_MESSAGES.INSUFFICIENT_POINTS);
    }
  }

  private calculateAvailablePoints(
    transaction: Transaction,
    sortedTransactions: Transaction[],
    processedTransactions: Transaction[],
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

  private updateBalances(spentPoints: PayerRemainingBalance): void {
    Object.entries(spentPoints).forEach(([payer, points]) => {
      this.balances[payer] += points;
    });
  }

  addTransaction(transactions: AddTransactionDto[]): Array<Transaction> {
    try {
      const newTransactions: Transaction[] = transactions.map((t) => ({
        payer: t.payer,
        points: t.points,
        timestamp: new Date(t.timestamp),
      }));

      const allTransactions = sortByTimestamp([
        ...this.transactions,
        ...newTransactions,
      ]);

      this.validateTransactionRequest(allTransactions);

      for (const transaction of newTransactions) {
        this.transactions.push(transaction);
        this.balances[transaction.payer] =
          (this.balances[transaction.payer] || 0) + transaction.points;
      }

      return this.transactions;
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

  spendPoints(pointsToSpend: number): SpendPointsResponse[] {
    try {
      this.validateSpendPointsRequest(pointsToSpend);

      const sortedTransactions = sortByTimestamp(this.transactions);
      const spentPoints: PayerRemainingBalance = {};
      let remainingPointsToSpend = pointsToSpend;
      const processedTransactions: Transaction[] = [];

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

      this.updateBalances(spentPoints);

      const response = Object.entries(spentPoints).map(([payer, points]) => ({
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
    return this.balances;
  }
}
