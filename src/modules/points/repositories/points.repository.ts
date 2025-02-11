import { Injectable } from '@nestjs/common';
import { ITransactionEntity, IPointsRepository } from '../interfaces';
import { v4 as uuidv4 } from 'uuid';
import { PayerRemainingBalance } from '../types';

@Injectable()
export class PointsRepository implements IPointsRepository {
  private transactions: ITransactionEntity[] = [];
  private balances: PayerRemainingBalance = {};

  create(item: Omit<ITransactionEntity, 'id'>): ITransactionEntity {
    this.transactions.push({
      ...item,
      id: uuidv4(),
    });

    return this.transactions[this.transactions.length - 1];
  }

  getAllPayersBalances(): PayerRemainingBalance {
    return { ...this.balances };
  }

  addTransactions(
    transactions: Omit<ITransactionEntity, 'id'>[],
  ): Array<ITransactionEntity> {
    transactions.forEach((transaction) => {
      this.create(transaction);
      this.balances[transaction.payer] =
        (this.balances[transaction.payer] || 0) + transaction.points;
    });

    return this.transactions;
  }

  public updateBalances(spentPoints: PayerRemainingBalance): void {
    Object.entries(spentPoints).forEach(([payer, points]) => {
      this.balances[payer] += points;
    });
  }

  public getTransactions(): ITransactionEntity[] {
    return [...this.transactions];
  }

  public updateBalance(payer: string, points: number): void {
    this.balances[payer] = (this.balances[payer] || 0) + points;
  }

  public clear(): void {
    this.transactions = [];
    this.balances = {};
  }
}
