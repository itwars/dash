import React, { PureComponent } from 'react';
import Page from 'app/core/components/Page/Page';
import { Button, LegacyForms, Select } from '@grafana/ui';
const { FormField } = LegacyForms;
import { SelectableValue } from '@grafana/data';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { connect, ConnectedProps } from 'react-redux';
import { getNavModel } from 'app/core/selectors/navModel';
import { AssetType, StoreState } from 'app/types';
import { FormLabel } from '@grafana/ui/src/components/FormLabel/FormLabel';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';

interface CreateAssetRouteParams {
  id: string;
}

export interface OwnProps extends GrafanaRouteComponentProps<CreateAssetRouteParams> {}

export type Props = OwnProps & ConnectedProps<typeof connector>;

const connector = connect(mapStateToProps);

function mapStateToProps(state: StoreState, props: OwnProps) {
  const siteId = parseInt(props.match.params.id, 10);
  return {
    siteId: siteId,
    navModel: getNavModel(state.navIndex, `site-assets-${siteId}`),
  };
}

interface State {
  type: string;
  name: string;
  serial: string;
  description: string;
  long: number;
  lat: number;
  types: Array<SelectableValue<string>>;
}

export class CreateAsset extends PureComponent<Props, State> {
  state: State = {
    type: '',
    name: '',
    serial: '',
    description: '',
    long: 0.0,
    lat: 0.0,
    types: [],
  };

  componentDidMount() {
    this.assetTypes();
  }

  assetTypes = async () => {
    const types = await getBackendSrv().get('/api/assettypes', { perpage: 10000, page: 1 });
    this.setState({
      types: types.data.map(
        (type: AssetType): SelectableValue<string> => ({
          value: type.type,
          label: type.type,
          name: type.type,
        })
      ),
    });
  };

  create = async () => {
    const { type, name, serial, description, long, lat } = this.state;
    const result = await getBackendSrv().post(`/api/sites/${this.props.siteId}/assets`, {
      type,
      name,
      serial,
      description,
      long,
      lat,
    });
    if (result.assetId) {
      locationService.push(`/org/sites/${this.props.siteId}/assets/edit/${result.assetId}`);
    }
  };

  onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    switch (event.target.id) {
      case 'name':
        this.setState({
          name: event.target.value,
        });
        break;
      case 'serial':
        this.setState({
          serial: event.target.value,
        });
        break;
      case 'description':
        this.setState({
          description: event.target.value,
        });
        break;
      case 'long':
        this.setState({
          long: Number(event.target.value),
        });
        break;
      case 'lat':
        this.setState({
          lat: Number(event.target.value),
        });
        break;
    }
  };

  onTypeChange = (event: any) => {
    this.setState({
      type: event.value,
    });
  };

  render() {
    const { navModel } = this.props;
    const { type, name, serial, description, long, lat, types } = this.state;
    return (
      <Page navModel={navModel}>
        <Page.Contents>
          <div>
            <h3 className="page-sub-heading">New Asset</h3>

            <div className="gf-form-group">
              <div className="gf-form">
                <FormLabel width={10}>Type</FormLabel>
                <Select
                  onChange={this.onTypeChange}
                  options={types}
                  placeholder="Choose asset type"
                  className="gf-form-select-box__single-value max-width-20"
                  width={20}
                  value={type}
                />
              </div>
              <FormField
                id="name"
                className="gf-form"
                label="Name"
                value={name}
                onChange={this.onChange}
                inputWidth={20}
                labelWidth={10}
              />
              <FormField
                id="serial"
                className="gf-form"
                label="Serial"
                value={serial}
                onChange={this.onChange}
                inputWidth={20}
                labelWidth={10}
              />
              <FormField
                id="description"
                className="gf-form"
                label="Description"
                value={description}
                onChange={this.onChange}
                inputWidth={20}
                labelWidth={10}
              />
              <FormField
                id="long"
                className="gf-form"
                label="Long"
                value={long}
                onChange={this.onChange}
                inputWidth={20}
                labelWidth={10}
              />
              <FormField
                id="lat"
                className="gf-form"
                label="Lat"
                value={lat}
                onChange={this.onChange}
                inputWidth={20}
                labelWidth={10}
              />
              <div className="gf-form-button-row">
                <Button variant="secondary" onClick={this.create}>
                  Create
                </Button>
              </div>
            </div>
          </div>
        </Page.Contents>
      </Page>
    );
  }
}

export default connector(CreateAsset);
