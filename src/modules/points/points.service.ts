import { BadRequestException, Injectable } from '@nestjs/common';
import { AddTransactionDto } from './dto';
import {
  PayerRemainingBalance,
  SpendPointsResponse,
  Transaction,
} from './types';

@Injectable()
export class PointsService {
  private readonly transactions: Transaction[] = [];
  private balances: PayerRemainingBalance = {};

  addTransaction(transaction: AddTransactionDto): Array<Transaction> {
    const currentBalance = this.balances[transaction.payer] || 0;
    if (currentBalance + transaction.points < 0) {
      throw new BadRequestException(
        'Transaction would make payer balance negative',
      );
    }

    this.transactions.push({
      payer: transaction.payer,
      points: transaction.points,
      timestamp: new Date(transaction.timestamp),
    });

    this.balances[transaction.payer] = currentBalance + transaction.points;

    return this.transactions;
  }

  spendPoints(pointsToSpend: number): SpendPointsResponse[] {
    const totalPoints = Object.values(this.balances).reduce(
      (sum, points) => sum + points,
      0,
    );
    if (pointsToSpend > totalPoints) {
      throw new BadRequestException('Not enough points available');
    }

    const sortedTransactions = [...this.transactions].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );

    const spentPoints: PayerRemainingBalance = {};
    let remainingPointsToSpend = pointsToSpend;
    const processedTransactions: Transaction[] = [];

    for (const transaction of sortedTransactions) {
      if (remainingPointsToSpend <= 0) break;

      const payer = transaction.payer;
      let pointsAvailable = transaction.points;

      const futureNegativePoints = sortedTransactions
        .filter(
          (t) =>
            t.payer === payer &&
            t.points < 0 &&
            t.timestamp > transaction.timestamp &&
            !processedTransactions.includes(t),
        )
        .reduce((sum, t) => sum + t.points, 0);

      pointsAvailable += futureNegativePoints;

      if (pointsAvailable <= 0) {
        processedTransactions.push(transaction);
        continue;
      }

      const pointsToDeduct = Math.min(pointsAvailable, remainingPointsToSpend);
      spentPoints[payer] = (spentPoints[payer] || 0) - pointsToDeduct;
      remainingPointsToSpend -= pointsToDeduct;

      processedTransactions.push(transaction);
    }

    Object.entries(spentPoints).forEach(([payer, points]) => {
      this.balances[payer] += points;
    });

    const response = Object.entries(spentPoints).map(([payer, points]) => ({
      payer,
      points,
    }));

    return response;
  }

  getBalances(): PayerRemainingBalance {
    return this.balances;
  }

  getPayerBalances(payer: string): PayerRemainingBalance {
    return { [payer]: this.balances[payer] || 0 };
  }
}
