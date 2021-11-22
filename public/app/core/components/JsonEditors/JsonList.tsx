import React, { PureComponent } from 'react';
import { DeleteButton, LegacyForms } from '@grafana/ui';
import EmptyList from '../EmptyListCTA/EmptyList';
const { FormField } = LegacyForms;

export interface Props {
  isEditable: boolean;
  isDeletable: boolean;
  configs: any;
  updateConfig: any;
}

export class JsonList extends PureComponent<Props> {
  onChange = (event: any, key: string) => {
    let { configs } = this.props;
    configs = {
      ...configs,
      [key]: { value: event.target.value, index: configs[key].index },
    };
    this.props.updateConfig(configs);
  };

  onDelete = (key: string) => {
    let { configs } = this.props;
    let newConfigs = {};
    Object.keys(configs).map((name) => {
      if (name !== key) {
        newConfigs = {
          ...newConfigs,
          [name]: { value: configs[name].value, index: configs[name].index },
        };
      }
    });
    this.props.updateConfig(newConfigs);
  };

  renderJson = (i: number, key: string, value: any) => {
    return (
      <div className="gf-form" key={i}>
        <FormField
          className="gf-form"
          label={key}
          value={value.value}
          onChange={(e) => this.onChange(e, key)}
          inputWidth={20}
          labelWidth={15}
          disabled={!this.props.isEditable}
          required
        />
        <div className="page-action-bar__spacer" />
        {this.props.isDeletable && <DeleteButton size="md" onConfirm={() => this.onDelete(key)} />}
      </div>
    );
  };

  render() {
    const sortedConfigs = Object.keys(this.props.configs).sort(
      (a, b) => this.props.configs[a].index - this.props.configs[b].index
    );

    if (!sortedConfigs.length) {
      return (
        <>
          <EmptyList title="There are no items created for this Object" proTip="Ask administrator to update Object." />
        </>
      );
    } else {
      return (
        <>
          <div className="gf-form-group">
            {sortedConfigs.map((key, i) => this.renderJson(i, key, this.props.configs[key]))}
          </div>
        </>
      );
    }
  }
}

export default JsonList;
