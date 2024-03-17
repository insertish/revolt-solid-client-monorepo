import {
  Accessor,
  ParentComponent,
  createContext,
  onCleanup,
  onMount,
  useContext,
} from "solid-js";

import {
  KeybindAction,
  KeybindActions,
  KeybindEventHandler,
} from "@revolt/keybinds";

const KeybindsContext = createContext<KeybindEventHandler<KeybindAction>>();

interface Props {
  /**A getter to keybinds */
  keybinds: Accessor<KeybindActions>;
}

/** Provides a context to a keybind event handler */
export const KeybindsProvider: ParentComponent<Props> = (props) => {
  const handler = new KeybindEventHandler<KeybindAction>(props.keybinds);

  onMount(() => {
    document.addEventListener("keydown", handler);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handler);
  });

  return (
    <KeybindsContext.Provider value={handler}>
      {props.children}
    </KeybindsContext.Provider>
  );
};

/**
 * Use the keybinds context
 * @note for getting keybind data you may be looking for {@link @revolt/state}
 **/
export const useKeybindActions = () => useContext(KeybindsContext)!;
