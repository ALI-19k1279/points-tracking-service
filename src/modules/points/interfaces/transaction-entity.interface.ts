import { IBaseEntity } from '@common/interfaces';

export interface ITransactionEntity extends IBaseEntity {
  payer: string;
  points: number;
  timestamp: Date;
}
