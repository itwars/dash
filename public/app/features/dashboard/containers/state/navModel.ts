import { NavModelItem, NavModel } from '@grafana/data';
import { DashboardNav } from 'app/types';

export function buildNavModel(
  id: string,
  dashtype: number,
  siteId: number,
  assetId: number,
  results: DashboardNav[]
): NavModelItem {
  let children: NavModelItem[] = [];
  children = results.map((result) => {
    const slug = result.title ? result.title.toLowerCase() : '';
    const query = `?dashtype=${dashtype}&siteId=${siteId}&assetId=${assetId}`;
    const item: NavModelItem = {
      id: slug,
      text: result.title ? result.title : 'Loading',
      url: result.url ? result.url + query : 'Loading',
      active: id === slug,
      index: result.index,
    };
    return item;
  });
  const navModel = {
    id: '1',
    text: 'Loading',
    children: children,
  };
  return navModel;
}

export function getDashboardNav(
  id: string,
  dashtype: number,
  siteId: number,
  assetId: number,
  results: DashboardNav[]
): NavModel {
  let main = buildNavModel(id, dashtype, siteId, assetId, results);
  let node: NavModelItem;

  for (const child of main.children!) {
    if (child.id === id) {
      node = child;
      break;
    }
  }

  return {
    main: main,
    node: node!,
  };
}
