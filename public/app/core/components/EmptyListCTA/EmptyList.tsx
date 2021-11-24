import React from 'react';
import { CallToActionCard, Icon } from '@grafana/ui';
import { css } from '@emotion/css';

export interface Props {
  title: string;
  proTip?: string;
  proTipLink?: string;
  proTipLinkTitle?: string;
  proTipTarget?: string;
  infoBox?: { __html: string };
  infoBoxTitle?: string;
}

const ctaStyle = css`
  text-align: center;
`;

const infoBoxStyles = css`
  max-width: 700px;
  margin: 0 auto;
`;

const EmptyList: React.FunctionComponent<Props> = ({
  title,
  proTip,
  proTipLink,
  proTipLinkTitle,
  proTipTarget,
  infoBox,
  infoBoxTitle,
}) => {
  const footer = () => {
    return (
      <>
        {proTip ? (
          <span key="proTipFooter">
            <Icon name="rocket" />
            <> ProTip: {proTip} </>
            <a href={proTipLink} target={proTipTarget} className="text-link">
              {proTipLinkTitle}
            </a>
          </span>
        ) : (
          ''
        )}
        {infoBox ? (
          <div key="infoBoxHtml" className={`grafana-info-box ${infoBoxStyles}`}>
            {infoBoxTitle && <h5>{infoBoxTitle}</h5>}
            <div dangerouslySetInnerHTML={infoBox} />
          </div>
        ) : (
          ''
        )}
      </>
    );
  };

  const ctaElement = <></>;

  return <CallToActionCard className={ctaStyle} message={title} footer={footer()} callToActionElement={ctaElement} />;
};

export default EmptyList;
