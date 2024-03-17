import { Accessor, Match, Show, Switch, createSignal, onMount } from "solid-js";

import { MFA } from "revolt.js/src/classes/MFA";

import { useClient } from "@revolt/client";
import { getController } from "@revolt/common";
import { useTranslation } from "@revolt/i18n";
import {
  Avatar,
  CategoryButton,
  CategoryButtonGroup,
  CategoryCollapse,
  Column,
  Row,
  Typography,
  iconSize,
  styled,
  useTheme,
} from "@revolt/ui";

import MdCakeFill from "@material-design-icons/svg/filled/cake.svg?component-solid";
import MdAlternateEmail from "@material-design-icons/svg/outlined/alternate_email.svg?component-solid";
import MdBlock from "@material-design-icons/svg/outlined/block.svg?component-solid";
import MdDelete from "@material-design-icons/svg/outlined/delete.svg?component-solid";
import MdDraw from "@material-design-icons/svg/outlined/draw.svg?component-solid";
import MdEdit from "@material-design-icons/svg/outlined/edit.svg?component-solid";
import MdLock from "@material-design-icons/svg/outlined/lock.svg?component-solid";
import MdMail from "@material-design-icons/svg/outlined/mail.svg?component-solid";
import MdPassword from "@material-design-icons/svg/outlined/password.svg?component-solid";
import MdVerifiedUser from "@material-design-icons/svg/outlined/verified_user.svg?component-solid";

/**
 * Account Page
 */
export default function MyAccount() {
  const client = useClient();

  const [mfa, setMfa] = createSignal<MFA>();
  onMount(() => client().account.mfa().then(setMfa));

  return (
    <Column gap="lg">
      <UserInformation />
      <EditAccount />
      <MultiFactorAuth mfa={mfa} />
      <ManageAccount mfa={mfa} />
    </Column>
  );
}

/**
 * User Information
 */
function UserInformation() {
  const client = useClient();

  return (
    <CategoryButtonGroup>
      <AccountBox align gap="lg">
        <div class="column">
          <div class="row">
            <ProfileDetails>
              <Avatar src={client().user!.animatedAvatarURL} size={58} />
              <div class="usernameDetails">
                {client().user!.displayName}
                <div class="username">
                  {client().user!.username}#{client().user!.discriminator}
                </div>
              </div>
            </ProfileDetails>
            <div class="button">
              <MdEdit {...iconSize(22)} />
            </div>
          </div>
          <BadgeContainer>
            <ProfileBadges>
              <MdDraw {...iconSize(20)} />
              <MdDraw {...iconSize(20)} />
              <MdDraw {...iconSize(20)} />
            </ProfileBadges>
            <ProfileBadges>
              <MdCakeFill {...iconSize(18)} />
            </ProfileBadges>
          </BadgeContainer>
        </div>
      </AccountBox>
    </CategoryButtonGroup>
  );
}

const ProfileDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  flex-grow: 1;

  .usernameDetails {
    font-size: 18px;
    font-weight: 600;

    .username {
      font-size: 14px;
      font-weight: 400;
    }
  }
`;

const BadgeContainer = styled.div`
  display: flex;
  margin-inline-start: 73px;
  gap: 8px;
`;

const ProfileBadges = styled.div`
  border-radius: 8px;
  width: fit-content;
  padding: 4px 5px;
  gap: 5px;
  display: flex;

  background: ${(props) => props.theme!.colours["settings-background"]};
`;

/**
 * Styles for the account box
 * TODO: classes need to be refactored out
 */
const AccountBox = styled(Row)`
  padding: 13px;
  /* TODO: fetch profile for account page? or load profile eagerly */
  background-image: linear-gradient(
      rgba(255, 255, 255, 0.7),
      rgba(255, 255, 255, 0.7)
    ),
    url("https://autumn.revolt.chat/backgrounds/PA-U1R3u-iw72V-WH0C9aDN1rBTbnm-sKNR8YN4RL8?width=1000");
  color: ${(props) => props.theme!.colours["foreground"]};

  .column {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .row {
    display: flex;
    align-items: center;
  }

  /** this should be its own thing */
  .button {
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    background: ${(props) => props.theme!.colours["component-fab-background"]};
    fill: ${(props) => props.theme!.colours["component-fab-foreground"]};
  }
`;

/**
 * Edit account details
 */
function EditAccount() {
  const t = useTranslation();
  const client = useClient();
  const [email, setEmail] = createSignal("•••••••••••@•••••••••••");

  return (
    <CategoryButtonGroup>
      <CategoryButton
        action="chevron"
        onClick={() =>
          getController("modal").push({
            type: "edit_username",
            client: client(),
          })
        }
        icon={<MdAlternateEmail {...iconSize(22)} />}
        description={client().user?.username}
      >
        <Typography variant="label">{t("login.username")}</Typography>
      </CategoryButton>
      <CategoryButton
        action="chevron"
        onClick={() =>
          getController("modal").push({
            type: "edit_email",
            client: client(),
          })
        }
        icon={<MdMail {...iconSize(22)} />}
        description={
          <Row>
            {email()}{" "}
            <Show when={email().startsWith("•")}>
              <a
                onClick={(event) => {
                  event.stopPropagation();
                  client().account.fetchEmail().then(setEmail);
                }}
              >
                Reveal
              </a>
            </Show>
          </Row>
        }
      >
        <Typography variant="label">{t("login.email")}</Typography>
      </CategoryButton>
      <CategoryButton
        action="chevron"
        onClick={() =>
          getController("modal").push({
            type: "edit_password",
            client: client(),
          })
        }
        icon={<MdPassword {...iconSize(22)} />}
        description={"•••••••••"}
      >
        <Typography variant="label">{t("login.password")}</Typography>
      </CategoryButton>
    </CategoryButtonGroup>
  );
}

/**
 * Multi-factor authentication
 */
function MultiFactorAuth(props: { mfa: Accessor<MFA | undefined> }) {
  const client = useClient();

  /**
   * Show recovery codes
   */
  async function showRecoveryCodes() {
    const mfa = props.mfa()!;
    const modals = getController("modal");
    const ticket = await modals.mfaFlow(mfa);

    ticket!.fetchRecoveryCodes().then((codes) =>
      getController("modal").push({
        type: "mfa_recovery",
        mfa,
        codes,
      })
    );
  }

  /**
   * Generate recovery codes
   */
  async function generateRecoveryCodes() {
    const mfa = props.mfa()!;
    const modals = getController("modal");
    const ticket = await modals.mfaFlow(mfa);

    ticket!.generateRecoveryCodes().then((codes) =>
      getController("modal").push({
        type: "mfa_recovery",
        mfa,
        codes,
      })
    );
  }

  /**
   * Configure authenticator app
   */
  async function setupAuthenticatorApp() {
    const mfa = props.mfa()!;
    const modals = getController("modal");
    const ticket = await modals.mfaFlow(mfa);
    const secret = await ticket!.generateAuthenticatorSecret();

    let success;
    while (!success) {
      try {
        const code = await modals.mfaEnableTOTP(
          secret,
          client().user!.username
        );

        if (code) {
          await mfa.enableAuthenticator(code);
          success = true;
        }
      } catch (err) {
        /* no-op */
      }
    }
  }

  /**
   * Disable authenticator app
   */
  function disableAuthenticatorApp() {
    getController("modal")
      .mfaFlow(props.mfa()!)
      .then((ticket) => ticket!.disableAuthenticator());
  }

  return (
    <CategoryButtonGroup>
      <CategoryCollapse
        icon={<MdVerifiedUser {...iconSize(22)} />}
        title="Recovery Codes"
        description="Configure a way to get back into your account in case your 2FA is lost"
      >
        <Switch
          fallback={
            <CategoryButton
              icon="blank"
              disabled={!props.mfa()}
              onClick={generateRecoveryCodes}
              description="Setup recovery codes"
            >
              Generate Recovery Codes
            </CategoryButton>
          }
        >
          <Match when={props.mfa()?.recoveryEnabled}>
            <CategoryButton
              icon="blank"
              description="Get active recovery codes"
              onClick={showRecoveryCodes}
            >
              View Recovery Codes
            </CategoryButton>
            <CategoryButton
              icon="blank"
              description="Get a new set of recovery codes"
              onClick={generateRecoveryCodes}
            >
              Reset Recovery Codes
            </CategoryButton>
          </Match>
        </Switch>
      </CategoryCollapse>
      <CategoryCollapse
        icon={<MdLock {...iconSize(22)} />}
        title="Authenticator App"
        description="Configure one-time password authentication"
      >
        <Switch
          fallback={
            <CategoryButton
              icon="blank"
              disabled={!props.mfa()}
              onClick={setupAuthenticatorApp}
              description="Setup one-time password authenticator"
            >
              Enable Authenticator
            </CategoryButton>
          }
        >
          <Match when={props.mfa()?.authenticatorEnabled}>
            <CategoryButton
              icon="blank"
              description="Disable one-time password authenticator"
              onClick={disableAuthenticatorApp}
            >
              Remove Authenticator
            </CategoryButton>
          </Match>
        </Switch>
      </CategoryCollapse>
    </CategoryButtonGroup>
  );
}

/**
 * Manage account
 */
function ManageAccount(props: { mfa: Accessor<MFA | undefined> }) {
  const theme = useTheme();
  const t = useTranslation();

  /**
   * Disable account
   */
  function disableAccount() {
    const mfa = props.mfa()!;
    getController("modal")
      .mfaFlow(mfa)
      .then((ticket) =>
        ticket!.disableAccount().then(() => {
          /** TODO: log out logic */
        })
      );
  }

  /**
   * Delete account
   */
  function deleteAccount() {
    const mfa = props.mfa()!;
    getController("modal")
      .mfaFlow(mfa)
      .then((ticket) =>
        ticket!.deleteAccount().then(() => {
          /** TODO: log out logic */
        })
      );
  }

  return (
    <CategoryButtonGroup>
      <CategoryButton
        action="chevron"
        disabled={!props.mfa()}
        onClick={disableAccount}
        icon={
          <MdBlock {...iconSize(22)} fill={theme!.customColours.error.color} />
        }
        description="Disable your account. You won't be able to access it unless you contact support."
      >
        {t("app.settings.pages.account.manage.disable")}
      </CategoryButton>
      <CategoryButton
        action="chevron"
        disabled={!props.mfa()}
        onClick={deleteAccount}
        icon={
          <MdDelete {...iconSize(22)} fill={theme!.customColours.error.color} />
        }
        description="Your account will be queued for deletion, a confirmation email will be sent."
      >
        {t("app.settings.pages.account.manage.delete")}
      </CategoryButton>
    </CategoryButtonGroup>
  );
}
