import React, { FC, useEffect, useMemo, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { css } from '@emotion/css';
import { FieldConfigSource, GrafanaTheme2, PanelData, ThresholdsConfig } from '@grafana/data';
import { PanelRenderer } from '@grafana/runtime';
import { PanelContext, PanelContextProvider, useStyles2 } from '@grafana/ui';
import { PanelOptions } from 'app/plugins/panel/table/models.gen';
import { useVizHeight } from '../../hooks/useVizHeight';
import { SupportedPanelPlugins, PanelPluginsButtonGroup } from '../PanelPluginsButtonGroup';
import appEvents from 'app/core/app_events';

interface Props {
  data: PanelData;
  currentPanel: SupportedPanelPlugins;
  changePanel: (panel: SupportedPanelPlugins) => void;
  thresholds: ThresholdsConfig;
  onThresholdsChange: (thresholds: ThresholdsConfig) => void;
}

export const VizWrapper: FC<Props> = ({ data, currentPanel, changePanel, onThresholdsChange, thresholds }) => {
  const [options, setOptions] = useState<PanelOptions>({
    frameIndex: 0,
    showHeader: true,
  });
  const vizHeight = useVizHeight(data, currentPanel, options.frameIndex);
  const styles = useStyles2(getStyles(vizHeight));
  const [fieldConfig, setFieldConfig] = useState<FieldConfigSource>(defaultFieldConfig(thresholds));

  useEffect(() => {
    setFieldConfig((fieldConfig) => ({
      ...fieldConfig,
      defaults: {
        ...fieldConfig.defaults,
        thresholds: thresholds,
        custom: {
          ...fieldConfig.defaults.custom,
          thresholdsStyle: {
            mode: 'line',
          },
        },
      },
    }));
  }, [thresholds, setFieldConfig]);

  const context: PanelContext = useMemo(
    () => ({
      eventBus: appEvents,
      canEditThresholds: true,
      onThresholdsChange: onThresholdsChange,
    }),
    [onThresholdsChange]
  );

  if (!options || !data) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.buttonGroup}>
        <PanelPluginsButtonGroup onChange={changePanel} value={currentPanel} />
      </div>
      <AutoSizer>
        {({ width }) => {
          if (width === 0) {
            return null;
          }
          return (
            <div style={{ height: `${vizHeight}px`, width: `${width}px` }}>
              <PanelContextProvider value={context}>
                <PanelRenderer
                  height={vizHeight}
                  width={width}
                  data={data}
                  pluginId={currentPanel}
                  title="title"
                  onOptionsChange={setOptions}
                  options={options}
                  fieldConfig={fieldConfig}
                />
              </PanelContextProvider>
            </div>
          );
        }}
      </AutoSizer>
    </div>
  );
};

const getStyles = (visHeight: number) => (theme: GrafanaTheme2) => ({
  wrapper: css`
    padding: 0 ${theme.spacing(2)};
    height: ${visHeight + theme.spacing.gridSize * 4}px;
  `,
  buttonGroup: css`
    display: flex;
    justify-content: flex-end;
  `,
});

function defaultFieldConfig(thresholds: ThresholdsConfig): FieldConfigSource {
  if (!thresholds) {
    return { defaults: {}, overrides: [] };
  }
  return {
    defaults: {
      thresholds: thresholds,
      custom: {
        thresholdsStyle: {
          mode: 'line',
        },
      },
    },
    overrides: [],
  };
}