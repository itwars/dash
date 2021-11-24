import { DataserviceDatasource } from './datasource';
import { DataSourcePlugin } from '@grafana/data';
import { ConfigEditor } from './ConfigEditor';

class DataserviceAnnotationsQueryCtrl {
  static templateUrl = 'partials/annotations.editor.html';
}

export const plugin = new DataSourcePlugin(DataserviceDatasource)
  .setConfigEditor(ConfigEditor)
  .setAnnotationQueryCtrl(DataserviceAnnotationsQueryCtrl);
