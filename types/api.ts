import { Book } from './book';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SearchParams {
  query?: string;
  genre?: string;
  mood?: string;
}

export interface CatalogFetchResult {
  books: Book[];
  isFallback: boolean;
}
