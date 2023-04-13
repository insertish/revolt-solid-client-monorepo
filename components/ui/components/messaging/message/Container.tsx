import { Component, JSX, Match, Show, Switch } from "solid-js";
import { styled } from "solid-styled-components";

import { Avatar } from "../../design/atoms/display/Avatar";
import { Time } from "../../design/atoms/display/Time";
import {
  Typography,
  generateTypographyCSS,
} from "../../design/atoms/display/Typography";
import { Column, Row } from "../../design/layout";

interface CommonProps {
  /**
   * Whether this is the tail of another message
   */
  tail?: boolean;

  /**
   * Whether to move the username and related to the left
   *
   * If you want to hide it completely, add a <Match when={true} /> to infoMatch
   */
  compact?: boolean;
}

type Props = CommonProps & {
  /**
   * Avatar URL
   */
  avatar?: string;

  /**
   * Username element
   */
  username: JSX.Element;

  /**
   * Message content
   */
  children: JSX.Element;

  /**
   * Message header
   */
  header?: JSX.Element;

  /**
   * Message info line
   */
  info?: JSX.Element;

  /**
   * Timestamp message was sent at
   */
  timestamp: Date;

  /**
   * Date message was edited at
   */
  edited?: Date;

  /**
   * Additional match cases for the inline-start information element
   */
  infoMatch?: JSX.Element;

  /**
   * Reference time to render timestamps from
   */
  _referenceTime?: number;
};

/**
 * Message container layout
 */
const Base = styled(Column as Component, "Message")<CommonProps>`
  ${(props) => generateTypographyCSS(props.theme!, "messages")}

  padding: 2px 0;
  color: ${(props) => props.theme!.colours.foreground};
  margin-top: ${(props) => (props.tail ? 0 : "12px")} !important;

  .hidden {
    display: none;
  }

  &:hover {
    .hidden {
      display: block;
    }

    backdrop-filter: ${(props) => props.theme!.effects.hover};
  }

  a:hover {
    text-decoration: underline;
  }
`;

/**
 * Left-side information or avatar
 */
const Info = styled("div", "Info")<Pick<CommonProps, "tail" | "compact">>`
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding: ${(props) => (props.tail ? 0 : 2)}px 0;
  ${(props) => (props.compact ? "" : "width: 62px;")}
`;

/**
 * Right-side message content
 */
const Content = styled(Column)`
  gap: 3px;
  min-width: 0;
  overflow: hidden;
  max-height: 200vh;
  padding-inline-end: ${(props) => props.theme!.gap.lg};
`;

/**
 * Information text
 */
const InfoText = styled(Row)`
  color: ${(props) => props.theme!.colours["foreground-400"]};
  ${(props) => generateTypographyCSS(props.theme!, "small")}
`;

/**
 * Additional styles for compact mode
 */
const CompactInfo = styled(Row)`
  flex-shrink: 0;
  margin-top: -2px;
  height: fit-content;
  padding-inline: ${(props) => props.theme!.gap.lg} 0;
`;

/**
 * Component to show avatar, username, timestamp and content
 */
export function MessageContainer(props: Props) {
  return (
    <Base tail={props.tail}>
      {props.header}
      <Row gap="none">
        <Info tail={props.tail} compact={props.compact}>
          <Switch fallback={<Avatar size={36} src={props.avatar} />}>
            {props.infoMatch}
            <Match when={props.compact}>
              <CompactInfo gap="sm" align>
                <InfoText gap="sm">
                  <Time
                    format="time"
                    value={props.timestamp}
                    referenceTime={props._referenceTime}
                  />
                </InfoText>
                {props.username}
                {props.info}
              </CompactInfo>
            </Match>
            <Match when={props.tail}>
              <InfoText class={!props.edited ? "hidden" : undefined}>
                <Typography variant="small">
                  <Show when={props.edited}>(edited)</Show>
                  <Show when={!props.edited}>
                    <Time
                      value={props.timestamp}
                      format="time"
                      referenceTime={props._referenceTime}
                    />
                  </Show>
                </Typography>
              </InfoText>
            </Match>
          </Switch>
        </Info>
        <Content>
          <Show when={!props.tail && !props.compact}>
            <Row gap="sm" align>
              {props.username}
              <InfoText gap="sm" align>
                {props.info}
                <Time
                  value={props.timestamp}
                  format="calendar"
                  referenceTime={props._referenceTime}
                />
                <Show when={props.edited}>
                  <span>(edited)</span>
                </Show>
              </InfoText>
            </Row>
          </Show>
          {props.children}
        </Content>
      </Row>
    </Base>
  );
}
