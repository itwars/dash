import { DashboardNav, ThunkResult } from 'app/types';
import { updateNavIndex } from 'app/core/actions';
import { buildNavModel } from './navModel';

import { SearchSrv } from 'app/core/services/search_srv';
import { dashboardNavsLoaded } from './reducers';

const searchSrv = new SearchSrv();
export function loadDashboards(folder: number, siteId: number, assetId: number): ThunkResult<void> {
  let folderIds: number[] = [folder];
  return async (dispatch) => {
    const skipRecent = true;
    const skipStarred = true;
    const response = await searchSrv.search({ skipRecent, skipStarred, folderIds }).then((results) => {
      let dashNavs: DashboardNav[] = [];
      results.map((result) => {
        if (result.type === 'dash-folder' && folder === result.id) {
          result.items.map((item: { id: any; index: any; title: any; url: any; type: any }) => {
            dashNavs.push({
              id: item.id,
              index: item.index,
              title: item.title,
              url: item.url,
              type: item.type,
            });
          });
        }
      });
      return dashNavs;
    });
    dispatch(dashboardNavsLoaded(response));
    dispatch(updateNavIndex(buildNavModel('', folder, siteId, assetId, response)));
  };
}
