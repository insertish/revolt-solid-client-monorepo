import { useClient } from "@revolt/client";
import { useParams } from "@revolt/routing";
import { styled } from "@revolt/ui";
import { Channel } from "revolt.js";

import { Accessor, Component, createMemo, Match, Switch } from "solid-js";

import { MessageBox } from "./text/MessageBox";
import { Messages } from "./text/Messages";

const Base = styled("div")`
  flex-grow: 1;
  display: flex;
  flex-direction: column;

  background: ${({ theme }) => theme!.colours["background-200"]};
`;

const ChannelHeader: Component<{
  channel: Accessor<Channel>;
}> = ({ channel }) => {
  return (
    <div
      style={{
        position: "absolute",
        height: "48px",
        width: "100%",
        "flex-shrink": 0,
        // "background-color":
        //  "rgba( var(--primary-header-rgb),max(var(--min-opacity),0.75) )",
        // "backdrop-filter": "blur(20px)",
        //!TODO
        "background-color": "#363636",
        "z-index": 20,
        color: "white",
        padding: "0 16px",
        display: "flex",
        "align-items": "center",
      }}
    >
      {channel().name}
      {/*port Header!!*/}
    </div>
  );
};

export const ChannelPage: Component = () => {
  const params = useParams();
  const client = useClient();
  const channel = createMemo(() => client.channels.get(params.channel)!);

  return (
    <Base>
      <ChannelHeader channel={channel} />
      <Switch fallback="Unknown channel type!">
        <Match when={!channel()}>404</Match>
        <Match when={channel()!.channel_type !== "VoiceChannel"}>
          <Messages channel={channel} />
          <MessageBox channel={channel} />
        </Match>
      </Switch>
    </Base>
  );
};
