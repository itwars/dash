import React, { FC, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Button, Field, FieldSet, Form, Select, VerticalGroup } from '@grafana/ui';
import { updateAsset } from './state/actions';
import { Asset, AssetType, OrgRole, StoreState } from 'app/types';
import JsonList from 'app/core/components/JsonEditors/JsonList';
import { SelectableValue } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { contextSrv } from 'app/core/services/context_srv';
import { FormField } from '@grafana/ui/src/components/FormField/FormField';
import { FormLabel } from '@grafana/ui/src/components/FormLabel/FormLabel';

export interface OwnProps {
  asset: Asset;
}

function mapStateToProps(state: StoreState, props: OwnProps) {
  return {
    asset: props.asset,
    signedInUser: contextSrv.user,
  };
}

const mapDispatchToProps = {
  updateAsset,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = ConnectedProps<typeof connector> & OwnProps;

export const AssetSettings: FC<Props> = ({ asset, signedInUser, updateAsset }) => {
  const [assetData, setAssetData] = useState(asset);
  const [types, setTypes] = useState<Array<SelectableValue<string>>>([]);

  useEffect(() => {
    setAssetData(asset);
  }, [asset]);

  const onTypeChange = (event: any) => {
    setAssetData({ ...assetData, type: event.value });
  };

  const onUpdateAssetControllerConfig = (config: any) => {
    setAssetData({ ...assetData, asset_controller_configs: config });
  };

  const onUpdateAssetAppConfig = (config: any) => {
    setAssetData({ ...assetData, asset_app_configs: config });
  };

  const onUpdateAssetProps = (config: any) => {
    setAssetData({ ...assetData, asset_props: config });
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    switch (event.target.id) {
      case 'name':
        setAssetData({
          ...assetData,
          name: event.target.value,
        });
        break;
      case 'serial':
        setAssetData({
          ...assetData,
          serial: event.target.value,
        });
        break;
      case 'description':
        setAssetData({
          ...assetData,
          description: event.target.value,
        });
        break;
      case 'long':
        setAssetData({
          ...assetData,
          long: Number(event.target.value),
        });
        break;
      case 'lat':
        setAssetData({
          ...assetData,
          lat: Number(event.target.value),
        });
        break;
    }
  };

  const isEditable = () => {
    return (
      signedInUser.isGrafanaAdmin || signedInUser.orgRole === OrgRole.Admin || signedInUser.orgRole === OrgRole.Editor
    );
  };

  const initializeTypes = async () => {
    const types = await getBackendSrv().get('/api/assettypes', { perpage: 10000, page: 1 });
    setTypes(
      types.data.map(
        (type: AssetType): SelectableValue<string> => ({
          value: type.type,
          label: type.type,
          name: type.type,
        })
      )
    );
  };

  useEffect(() => {
    initializeTypes();
  }, []);

  return (
    <VerticalGroup>
      <FieldSet label="Team Settings">
        <Form
          defaultValues={{ ...assetData }}
          onSubmit={() => {
            updateAsset(
              assetData.type,
              assetData.name,
              assetData.serial,
              assetData.description,
              assetData.long,
              assetData.lat,
              assetData.asset_controller_configs,
              assetData.asset_app_configs,
              assetData.asset_props
            );
          }}
        >
          {() => (
            <div>
              <div className="gf-form-group">
                <div className="gf-form">
                  <FormLabel width={15}>Type</FormLabel>
                  <Select
                    onChange={onTypeChange}
                    options={types}
                    placeholder="Choose asset type"
                    className="gf-form-select-box__single-value max-width-20"
                    width={20}
                    disabled={!isEditable()}
                    value={assetData.type}
                  />
                </div>
                <FormField
                  id="name"
                  className="gf-form"
                  label="Name"
                  value={assetData.name}
                  onChange={onChange}
                  inputWidth={20}
                  labelWidth={15}
                  disabled={!isEditable()}
                />
                <FormField
                  id="serial"
                  className="gf-form"
                  label="Serial"
                  value={assetData.serial}
                  onChange={onChange}
                  inputWidth={20}
                  labelWidth={15}
                  disabled={!isEditable()}
                />
                <FormField
                  id="description"
                  className="gf-form"
                  label="Description"
                  value={assetData.description}
                  onChange={onChange}
                  inputWidth={20}
                  labelWidth={15}
                  disabled={!isEditable()}
                />
                <FormField
                  id="long"
                  className="gf-form"
                  label="Long"
                  value={assetData.long}
                  onChange={onChange}
                  inputWidth={20}
                  labelWidth={15}
                  disabled={!isEditable()}
                />
                <FormField
                  id="lat"
                  className="gf-form"
                  label="Lat"
                  value={assetData.lat}
                  onChange={onChange}
                  inputWidth={20}
                  labelWidth={15}
                  disabled={!isEditable()}
                />
                <div className="page-action-bar__spacer" />
              </div>
              <Field label="Application Configurations">
                <JsonList
                  isEditable={isEditable()}
                  isDeletable={false}
                  configs={assetData.asset_app_configs}
                  updateConfig={onUpdateAssetAppConfig}
                />
              </Field>
              <Field label="Properties">
                <JsonList
                  isEditable={isEditable()}
                  isDeletable={false}
                  configs={assetData.asset_props}
                  updateConfig={onUpdateAssetProps}
                />
              </Field>
              <Field label="Controller Configurations">
                <JsonList
                  isEditable={isEditable()}
                  isDeletable={false}
                  configs={assetData.asset_controller_configs}
                  updateConfig={onUpdateAssetControllerConfig}
                />
              </Field>
              <Button type="submit">Update</Button>
            </div>
          )}
        </Form>
      </FieldSet>
    </VerticalGroup>
  );
};

export default connector(AssetSettings);
