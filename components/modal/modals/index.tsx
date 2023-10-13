import { JSX } from "solid-js";

import { Modal } from "@revolt/ui";

import { ActiveModal, modalController } from "..";
import type { Modals as AllModals, PropGenerator } from "../types";

import add_friend from "./AddFriend";
import ban_member from "./BanMember";
import changelog from "./Changelog";
import channel_info from "./ChannelInfo";
import clipboard from "./Clipboard";
import create_bot from "./CreateBot";
import create_category from "./CreateCategory";
import create_channel from "./CreateChannel";
import create_group from "./CreateGroup";
import create_invite from "./CreateInvite";
import create_role from "./CreateRole";
import create_server from "./CreateServer";
import custom_status from "./CustomStatus";
import delete_message from "./DeleteMessage";
import edit_email from "./EditEmail";
import edit_keybind from "./EditKeybind";
import edit_password from "./EditPassword";
import edit_username from "./EditUsername";
import error from "./Error";
import kick_member from "./KickMember";
import mfa_enable_totp from "./MFAEnableTOTP";
import mfa_flow from "./MFAFlow";
import mfa_recovery from "./MFARecovery";
import onboarding from "./Onboarding";
import rename_session from "./RenameSession";
import server_info from "./ServerInfo";
import settings from "./Settings";
import sign_out_sessions from "./SignOutSessions";
import signed_out from "./SignedOut";

const Modals: Record<AllModals["type"], PropGenerator<any>> = {
  add_friend,
  ban_member,
  changelog,
  channel_info,
  clipboard,
  create_bot,
  create_category,
  create_channel,
  create_group,
  create_invite,
  create_role,
  create_server,
  custom_status,
  delete_message,
  edit_email,
  edit_password,
  edit_username,
  error,
  edit_keybind,
  kick_member,
  mfa_enable_totp,
  mfa_flow,
  mfa_recovery,
  onboarding,
  rename_session,
  server_info,
  settings,
  signed_out,
  sign_out_sessions,
  ...({} as any),
};

/**
 * Render the modal
 */
export function RenderModal(props: ActiveModal) {
  /**
   * Handle modal close
   */
  const onClose = () => modalController.remove(props.id);

  if (import.meta.env.DEV) {
    // eslint-disable-next-line solid/reactivity
    console.info("modal:", props.props.type);
  }

  // eslint-disable-next-line solid/reactivity
  const modalProps = Modals[props.props.type](props.props, onClose);
  const Component = (
    modalProps as {
      _children: (props: { show: boolean; onClose: () => void }) => JSX.Element;
    }
  )._children;
  const element = Component ? (
    <Component show={props.show} onClose={onClose} />
  ) : (
    <Modal show={props.show} onClose={onClose} {...modalProps} />
  );

  return element;
}
