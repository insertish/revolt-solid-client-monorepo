import { Accessor, JSX } from "solid-js";

import { Settings, SettingsProps } from "./Settings";
import channel from "./channel";
import client from "./client";
import server from "./server";

export { Settings } from "./Settings";

export type SettingsConfiguration<T> = {
  /**
   * Generate list of categories and entries
   * @returns List
   */
  list: (context: T) => SettingsList;

  /**
   * Render the title of the current breadcrumb key
   * @param key Key
   */
  title: (key: string) => string;

  /**
   * Render the current settings page
   * @param props State information
   */
  render: (
    props: { page: Accessor<undefined | string> },
    context: T
  ) => JSX.Element;
};

/**
 * List of categories and entries
 */
export type SettingsList = {
  prepend?: JSX.Element;
  append?: JSX.Element;
  entries: {
    hidden?: boolean;
    title?: JSX.Element;
    entries: SettingsEntry[];
  }[];
};

/**
 * Individual settings entry
 */
export type SettingsEntry = {
  id?: string;
  href?: string;
  onClick?: () => void;

  hidden?: boolean;

  icon: JSX.Element;
  title: JSX.Element;
};

export const SettingsConfigurations: Record<
  string,
  SettingsConfiguration<never>
> = {
  client,
  server,
  channel,
};

/**
 * Render using a specific set of configurations
 * @param props
 * @returns
 */
export function SettingsUsingConfiguration(
  props: SettingsProps & { configKey: string }
) {
  // eslint-disable-next-line solid/reactivity
  const config = SettingsConfigurations[props.configKey ?? "client"];

  return (
    <Settings
      {...props}
      render={config.render}
      title={config.title}
      list={config.list}
    />
  );
}
