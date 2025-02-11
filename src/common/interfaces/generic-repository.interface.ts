export interface IGenericRepository<T> {
  create(item: T): T;
  //extend this interface with more methods
}
