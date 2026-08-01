import { ApiClient } from './api-client';
import { Book } from '../../types/book';

export class CatalogService {
  public static async fetchCatalog(signal?: AbortSignal): Promise<Book[]> {
    return ApiClient.fetchCatalog(signal);
  }

  public static async fetchBookDetails(bookIdOrPath: string, signal?: AbortSignal): Promise<Book | null> {
    const details = await ApiClient.fetchBookDetails(bookIdOrPath, signal);
    if (details) return details;

    const catalog = await ApiClient.fetchCatalog(signal);
    return catalog.find((b) => b.bookId === bookIdOrPath || b.dataPath === bookIdOrPath) || null;
  }
}
