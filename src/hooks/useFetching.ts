import { useState } from 'react';

type FetchingFunction<T extends any[]> = (...args: T) => Promise<void>;

export const useFetching = <T extends any[]>(
  callback: FetchingFunction<T>
): [FetchingFunction<T>, boolean, string] => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetching = async (...args: T): Promise<void> => {
    try {
      setIsLoading(true);
      await callback(...args);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return [fetching, isLoading, error];
};
