export interface Transaction {
  payer: string;
  points: number;
  timestamp: Date;
}

export interface SpendPointsRequest {
  points: number;
}

export interface SpendPointsResponse {
  payer: string;
  points: number;
}

export interface PayerRemainingBalance {
  [payer: string]: number;
}
