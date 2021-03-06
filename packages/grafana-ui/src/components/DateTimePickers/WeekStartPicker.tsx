import React, { useCallback } from 'react';
import { SelectableValue } from '@grafana/data';
import { Select } from '../Select/Select';
import { selectors } from '@grafana/e2e-selectors';

export interface Props {
  onChange: (weekStart: string) => void;
  value: string;
  width?: number;
  autoFocus?: boolean;
  onBlur?: () => void;
  includeInternal?: boolean;
  disabled?: boolean;
  inputId?: string;
}

const weekStarts: Array<SelectableValue<string>> = [
  { value: '', label: 'Default' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' },
];

export const WeekStartPicker: React.FC<Props> = (props) => {
  const { onChange, width, autoFocus = false, onBlur, value, disabled = false, inputId } = props;

  const onChangeWeekStart = useCallback(
    (selectable: SelectableValue<string>) => {
      if (selectable.value !== undefined) {
        onChange(selectable.value);
      }
    },
    [onChange]
  );

  return (
    <Select
      inputId={inputId}
      value={weekStarts.find((item) => item.value === value)?.value}
      placeholder="Choose starting day of the week"
      autoFocus={autoFocus}
      openMenuOnFocus={true}
      width={width}
      options={weekStarts}
      onChange={onChangeWeekStart}
      onBlur={onBlur}
      disabled={disabled}
      aria-label={selectors.components.WeekStartPicker.container}
      menuShouldPortal={true}
    />
  );
};
