export const ERROR_MESSAGES = {
  SOMETHING_WENT_WRONG: 'Something went wrong',
  INVALID_REQUEST: 'Invalid request',
  INVALID_TRANSACTION: 'Invalid transaction',
  NEGATIVE_BALANCE: (payer: string, timestamp: string) =>
    `Transaction for ${payer} at ${timestamp} would make balance negative`,
  INSUFFICIENT_POINTS: 'Not enough points available',
};

export const INITIAL_VALUES = {
  ZERO_POINTS: 0,
};
