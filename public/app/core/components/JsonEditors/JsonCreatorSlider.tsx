import { Icon, LegacyForms } from '@grafana/ui';
import React, { PureComponent } from 'react';
import { SlideDown } from '../Animations/SlideDown';
const { FormField } = LegacyForms;

export interface Props {
  isOpen: boolean;
  onToggle: any;
  configs: any;
  updateConfig: any;
}

interface State {
  index: number;
  key: string;
  value: string;
}

export class JsonCreatorSlider extends PureComponent<Props, State> {
  state: State = {
    index: 0,
    key: '',
    value: '',
  };

  onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    switch (event.target.id) {
      case 'index':
        this.setState({
          index: Number(event.target.value),
        });
        break;
      case 'key':
        this.setState({
          key: event.target.value,
        });
        break;
      case 'value':
        this.setState({
          value: event.target.value,
        });
        break;
    }
  };

  add = async () => {
    const { key, index, value } = this.state;
    let { configs } = this.props;
    configs = {
      ...configs,
      [key]: { value: value, index: index },
    };
    this.setState({
      index: 0,
      key: '',
      value: '',
    });
    this.props.updateConfig(configs);
  };

  render() {
    const { isOpen } = this.props;
    const { index, key, value } = this.state;
    return (
      <>
        <SlideDown in={isOpen}>
          <div className="cta-form">
            <button className="cta-form__close btn btn-transparent" onClick={this.props.onToggle}>
              <Icon name="times" />
            </button>
            <h5>Item Details</h5>
            <div className="gf-form-inline">
              <FormField
                id="index"
                className="gf-form"
                label="SortIndex"
                value={index}
                onChange={this.onChange}
                inputWidth={10}
                labelWidth={5}
                required
              />
              <FormField
                id="key"
                className="gf-form"
                label="Key"
                value={key}
                onChange={this.onChange}
                inputWidth={10}
                labelWidth={5}
                required
              />
              <FormField
                id="value"
                className="gf-form"
                label="Value"
                value={value}
                onChange={this.onChange}
                inputWidth={10}
                labelWidth={5}
                required
              />
            </div>
            <button className="btn btn-primary gf-form-btn" type="submit" onClick={this.add}>
              Add
            </button>
          </div>
        </SlideDown>
      </>
    );
  }
}

export default JsonCreatorSlider;
