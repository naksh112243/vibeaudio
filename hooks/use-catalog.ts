import { useQuery } from '@tanstack/react-query';
import { CatalogService } from '../services/api/catalog-service';
import { useAppStore } from '../stores/use-app-store';
import { useEffect } from 'react';

export function useCatalog() {
  const setBooks = useAppStore((state) => state.setBooks);
  const setLoadingLibrary = useAppStore((state) => state.setLoadingLibrary);
  const setLibraryError = useAppStore((state) => state.setLibraryError);

  const query = useQuery({
    queryKey: ['catalog'],
    queryFn: ({ signal }) => CatalogService.fetchCatalog(signal),
    staleTime: 1000 * 60 * 10, // 10 minutes cache
    gcTime: 1000 * 60 * 30,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setLoadingLibrary(query.isLoading);
    if (query.data) {
      setBooks(query.data);
    }
    if (query.error) {
      setLibraryError((query.error as Error).message || 'Failed to load library');
    }
  }, [query.data, query.isLoading, query.error, setBooks, setLoadingLibrary, setLibraryError]);

  return query;
}
