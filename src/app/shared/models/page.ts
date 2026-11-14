/** A page of a paginated list (mapped from Laravel's `{ data, meta }` envelope). */
export interface Page<T> {
  items: readonly T[];
  page: number;
  lastPage: number;
  total: number;
}

/** Laravel's paginated resource collection. */
export interface PaginatedDto<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const toPage = <T, U>(dto: PaginatedDto<T>, map: (item: T) => U): Page<U> => ({
  items: dto.data.map(map),
  page: dto.meta.current_page,
  lastPage: dto.meta.last_page,
  total: dto.meta.total,
});
