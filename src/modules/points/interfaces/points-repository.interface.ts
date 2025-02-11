import { IGenericRepository } from '@common/interfaces';
import { ITransactionEntity } from './transaction-entity.interface';
import { PayerRemainingBalance } from '../types';

export interface IPointsRepository
  extends IGenericRepository<ITransactionEntity> {
  getAllPayersBalances(): PayerRemainingBalance;
  clear(): void;
  addTransactions(transactions: Omit<ITransactionEntity, 'id'>[]): void;
}
