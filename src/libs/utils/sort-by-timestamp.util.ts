type EntityToSort = {
  timestamp: Date;
  id?: string;
};

export const sortByTimestamp = <T extends EntityToSort>(
  items: T[],
  order: 'asc' | 'desc' = 'asc',
): T[] => {
  return [...items].sort((a, b) => {
    const timestampA = a.timestamp.getTime();
    const timestampB = b.timestamp.getTime();
    const comparison = timestampA - timestampB;
    return order === 'asc' ? comparison : -comparison;
  });
};
