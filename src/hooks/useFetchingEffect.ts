import { useEffect } from 'react';
import { useFetching } from './useFetching';

type FetchingFunction = () => Promise<void>;

export const useFetchingEffect = (
  callback: FetchingFunction, list: any[]
): [FetchingFunction, boolean, string] => {
  const [fetch, isLoading, error] = useFetching(callback)
  useEffect(() => {fetch()}, list)
  return [fetch, isLoading, error]
};
