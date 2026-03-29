export interface ApiResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

export interface ApiSingleResponse<T> {
  data: T;
}
