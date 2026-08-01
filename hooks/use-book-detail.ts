import { useQuery } from '@tanstack/react-query';
import { CatalogService } from '../services/api/catalog-service';

export function useBookDetail(bookIdOrPath?: string) {
  return useQuery({
    queryKey: ['book-detail', bookIdOrPath],
    queryFn: ({ signal }) => {
      if (!bookIdOrPath) return null;
      return CatalogService.fetchBookDetails(bookIdOrPath, signal);
    },
    enabled: Boolean(bookIdOrPath),
    staleTime: 1000 * 60 * 15,
    retry: 2,
  });
}
