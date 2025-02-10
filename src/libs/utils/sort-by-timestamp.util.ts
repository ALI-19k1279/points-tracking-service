type EntityToSort = {
  timestamp: Date;
};

export const sortByTimestamp = <T extends EntityToSort>(
  items: T[],
  order: 'asc' | 'desc' = 'asc',
): T[] => {
  return [...items].sort((a, b) => {
    const comparison = a.timestamp.getTime() - b.timestamp.getTime();
    return order === 'asc' ? comparison : -comparison;
  });
};
