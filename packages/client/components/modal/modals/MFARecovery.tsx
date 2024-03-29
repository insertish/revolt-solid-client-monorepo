import { For, createSignal } from "solid-js";

import { useTranslation } from "@revolt/i18n";
import { styled } from "@revolt/ui";

import { modalController } from "..";
import { PropGenerator } from "../types";

/**
 * List of recovery codes
 */
const List = styled.div`
  display: grid;
  text-align: center;
  grid-template-columns: 1fr 1fr;
  font-family: var(--monospace-font), monospace;

  span {
    user-select: text;
  }

  i {
    opacity: 0;
    position: absolute;
  }
`;

/**
 * Modal to display a list of recovery codes
 */
const MFARecovery: PropGenerator<"mfa_recovery"> = (props) => {
  const t = useTranslation();

  // Keep track of changes to recovery codes
  // eslint-disable-next-line solid/reactivity
  const [known, setCodes] = createSignal(props.codes);

  /**
   * Reset recovery codes
   */
  const reset = async () => {
    const ticket = await modalController.mfaFlow(props.mfa);
    if (ticket) {
      const codes = await ticket.generateRecoveryCodes();
      setCodes(codes);
    }

    return false;
  };

  return {
    title: t("app.special.modals.mfa.recovery_codes"),
    description: t("app.special.modals.mfa.save_codes"),
    actions: [
      {
        palette: "primary",
        children: t("app.special.modals.actions.done"),
        onPress: () => true,
        confirmation: true,
      },
      {
        palette: "plain",
        children: t("app.special.modals.actions.reset"),
        onPress: reset,
      },
    ],
    children: (
      <List>
        <For each={known()}>
          {(code, index) => (
            <span>
              {code} {index() !== known.length && <i>{","}</i>}
            </span>
          )}
        </For>
      </List>
    ),
  };
};

export default MFARecovery;
