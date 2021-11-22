import React, { FC, memo } from 'react';
import { useUrlParams } from 'app/core/navigation/hooks';
import { defaultQueryParams } from '../reducers/searchQueryReducer';
import CustomSearch from './CustomSearch';

export const SearchWrapper: FC = memo(() => {
  const [params, updateUrlParams] = useUrlParams();
  const isOpen = params.get('search') === 'open';

  const closeSearch = () => {
    if (isOpen) {
      updateUrlParams({ search: null, folder: null, ...defaultQueryParams });
    }
  };

  return isOpen ? <CustomSearch onCloseSearch={closeSearch} /> : null;
});

SearchWrapper.displayName = 'SearchWrapper';
