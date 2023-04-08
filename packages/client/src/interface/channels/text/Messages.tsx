import {
  For,
  Match,
  Show,
  Switch,
  createEffect,
  createMemo,
  createSignal,
  on,
  onCleanup,
  onMount,
  splitProps,
} from "solid-js";

import isEqual from "lodash.isequal";
import { Channel, Message as MessageInterface } from "revolt.js";

import { useClient } from "@revolt/client";
import { dayjs } from "@revolt/i18n";
import { ConversationStart, ListView, MessageDivider } from "@revolt/ui";

import { Message } from "./Message";

/**
 * Default fetch limit
 */
const DEFAULT_FETCH_LIMIT = 50;

interface Props {
  /**
   * Channel to fetch messages from
   */
  channel: Channel;

  /**
   * Limit to number of messages to fetch at a time
   */
  fetchLimit?: number;

  /**
   * Limit to number of messages to display at one time
   */
  limit?: number;
}

/**
 * Render messages in a Channel
 */
export function Messages(props: Props) {
  const client = useClient();

  // Keep track of messages and whether we are at the start or end (or both) of the conversation
  const [messages, setMessages] = createSignal<MessageInterface[]>([]);
  const [atStart, setStart] = createSignal(false);
  const [atEnd, setEnd] = createSignal(true);

  /**
   * Fetch messages on channel mount
   */
  createEffect(
    on(
      () => props.channel,
      (channel) => {
        setMessages([]);
        setStart(false);
        setEnd(true);

        /**
         * Handle result from request
         */
        function handleResult({ messages }: { messages: MessageInterface[] }) {
          // If it's less than we expected, we are at the start already
          if (messages.length < (props.fetchLimit ?? DEFAULT_FETCH_LIMIT)) {
            setStart(true);
          }

          setMessages(messages);
        }

        channel
          .fetchMessagesWithUsers({ limit: props.fetchLimit })
          .then(handleResult);
      }
    )
  );

  /**
   * Handle incoming messages
   * @param message Message object
   */
  function onMessage(message: MessageInterface) {
    if (message.channelId === props.channel.id && atEnd()) {
      setMessages([message, ...messages()]);
    }
  }

  // Add listener for messages
  onMount(() => client().addListener("messageCreate", onMessage));
  onCleanup(() => client().removeListener("messageCreate", onMessage));

  // We need to cache created objects to prevent needless re-rendering
  const objectCache = new Map();

  // Determine which messages have a tail and add message dividers
  const messagesWithTail = createMemo<ListEntry[]>(() => {
    const messagesWithTail: ListEntry[] = [];

    const arr = messages();
    arr.forEach((message, index) => {
      const next = arr[index + 1];
      let tail = true;

      // If there is a next message, compare it to the current message
      let date = null;
      if (next) {
        // Compare dates between messages
        const adate = message.createdAt,
          bdate = next.createdAt,
          atime = +adate,
          btime = +bdate;

        if (
          adate.getFullYear() !== bdate.getFullYear() ||
          adate.getMonth() !== bdate.getMonth() ||
          adate.getDate() !== bdate.getDate()
        ) {
          date = adate;
        }

        // Compare time and properties of messages
        if (
          message.authorId !== next.authorId ||
          Math.abs(btime - atime) >= 420000 ||
          !isEqual(message.masquerade, next.masquerade) ||
          message.systemMessage ||
          next.systemMessage ||
          message.replyIds?.length
        ) {
          tail = false;
        }
      } else {
        tail = false;
      }

      // Add message to list, retrieve if it exists in the cache
      messagesWithTail.push(
        objectCache.get(`${message.id}:${tail}`) ?? {
          t: 0,
          message,
          tail,
        }
      );

      // Add date to list, retrieve if it exists in the cache
      if (date) {
        messagesWithTail.push(
          objectCache.get(date) ?? {
            t: 1,
            date: dayjs(date).format("LL"),
            unread: false,
          }
        );
      }
    });

    // Flush cache
    objectCache.clear();

    // Populate cache with current objects
    for (const object of messagesWithTail) {
      if (object.t === 0) {
        objectCache.set(`${object.message.id}:${object.tail}`, object);
      } else {
        objectCache.set(object.date, object);
      }
    }

    return messagesWithTail.reverse();
  });

  /**
   * Fetch messages in past
   * @param reposition Scroll guard callback
   */
  async function fetchTop(reposition: (cb: () => void) => void) {
    if (atStart()) return;

    // Fetch messages before the oldest message we have
    const result = await props.channel.fetchMessagesWithUsers({
      limit: props.fetchLimit,
      before: messages().slice(-1)[0].id,
    });

    // If it's less than we expected, we are at the start
    if (result.messages.length < (props.fetchLimit ?? DEFAULT_FETCH_LIMIT)) {
      setStart(true);
    }

    // If we received any messages at all, append them to the top
    if (result.messages.length) {
      // Calculate how much we need to cut off the other end
      const tooManyBy = Math.max(
        0,
        result.messages.length + messages().length - (props.limit ?? 0)
      );

      // If it's at least one element, we are no longer at the end
      if (tooManyBy > 0) {
        setEnd(false);
      }

      // Append messages to the top
      setMessages((prev) => [...prev, ...result.messages]);

      // If we removed any messages, guard the scroll position as we remove them
      if (tooManyBy) {
        reposition(() => {
          setMessages((prev) => {
            return prev.slice(tooManyBy);
          });
        });
      }
    }
  }

  /**
   * Fetch messages in future
   * @param reposition Scroll guard callback
   */
  async function fetchBottom(reposition: (cb: () => void) => void) {
    if (atEnd()) return;

    // Fetch messages after the newest message we have
    const result = await props.channel.fetchMessagesWithUsers({
      limit: props.fetchLimit,
      after: messages()[0].id,
      sort: "Oldest",
    });

    // If it's less than we expected, we are at the end
    if (result.messages.length < (props.fetchLimit ?? DEFAULT_FETCH_LIMIT)) {
      setEnd(true);
    }

    // If we received any messages at all, append them to the bottom
    if (result.messages.length) {
      // Calculate how much we need to cut off the other end
      const tooManyBy = Math.max(
        0,
        result.messages.length + messages().length - (props.limit ?? 0)
      );

      // If it's at least one element, we are no longer at the start
      if (tooManyBy > 0) {
        setStart(false);
      }

      // Append messages to the bottom
      setMessages((prev) => {
        return [...result.messages.reverse(), ...prev];
      });

      // If we removed any messages, guard the scroll position as we remove them
      if (tooManyBy) {
        reposition(() => setMessages((prev) => prev.slice(0, -tooManyBy)));
      }
    }
  }

  return (
    <>
      <ListView offsetTop={48} fetchTop={fetchTop} fetchBottom={fetchBottom}>
        <div>
          <div>
            <Show when={atStart()}>
              <ConversationStart channel={props.channel} />
            </Show>
            <For each={messagesWithTail()}>
              {(props) => <Entry {...props} />}
            </For>
          </div>
        </div>
      </ListView>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute" }}>
          <Show when={!atEnd()}>in past</Show>
        </div>
      </div>
    </>
  );
}

/**
 * List entries
 */
type ListEntry =
  | {
      // Message
      t: 0;
      message: MessageInterface;
      tail: boolean;
    }
  | {
      // Message Divider
      t: 1;
      date: string;
      unread: boolean;
    };

/**
 * Render individual list entry
 */
function Entry(props: ListEntry) {
  const [local, other] = splitProps(props, ["t"]);

  return (
    <Switch>
      <Match when={local.t === 0}>
        <Message {...(other as ListEntry & { t: 0 })} />
      </Match>
      <Match when={local.t === 1}>
        <MessageDivider {...(other as ListEntry & { t: 1 })} />
      </Match>
    </Switch>
  );
}
