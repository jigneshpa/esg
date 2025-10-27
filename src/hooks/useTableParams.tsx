import { useCallback, useEffect, useState } from 'react';

export interface Params {
  departmentIds?: number[];
  user_id?: number;
  page: number;
  max_results: number;
  sort_by?: string | null;
  sort?: string | null;
  companyIds?: number[];
  assetIds?: number[];
  assetTypes?: string[];
  countryIds?: number[];
  industryIds?: number[];
  submittedByIds?: number[];
  frameworkIds?: number[];
  roles?: string[];
  status?: string[];
  Country?: number[];
}

const useTableParams = (initialParams: Params) => {
  const [params, setParams] = useState<Params>(initialParams);
  const [activeSortKey, setActiveSortKey] = useState<string | null>(null);

  const handleSortChange = useCallback(
    (sortKey: string) => {
      let newSortStatus: string | null;
      if (params.sort_by === `${sortKey}_asc`) {
        newSortStatus = `${sortKey}_desc`;
      } else if (params.sort_by === `${sortKey}_desc`) {
        newSortStatus = null;
      } else {
        newSortStatus = `${sortKey}_asc`;
      }

      setParams(prev => ({ ...prev, sort_by: newSortStatus }));

      setActiveSortKey(newSortStatus ? sortKey : null);
    },
    [params]
  );

  const handleFilterChange = useCallback((filterKey: keyof Params, value: any) => {
    setParams(prev => ({ ...prev, [filterKey]: value, page: 1 }));
  }, []);
  const handlePageChange = useCallback((page: number) => {
    setParams(prevParams => ({ ...prevParams, page }));
  }, []);

  const handleMaxResultsChange = useCallback((maxResults: number) => {
    setParams(prevParams => ({ ...prevParams, max_results: maxResults }));
  }, []);

  useEffect(() => {
    setParams(prevParams => ({ ...prevParams, max_results: params.max_results }));
  }, [params.max_results]);

  return { params, activeSortKey, handleSortChange, handlePageChange, handleMaxResultsChange, handleFilterChange };
};

export default useTableParams;
