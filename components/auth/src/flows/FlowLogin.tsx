import { For, Match, Show, Switch } from "solid-js";

import { useTranslation } from "@revolt/i18n";
import { Link, Navigate, useNavigate } from "@revolt/routing";
import { state } from "@revolt/state";
import {
  Avatar,
  Button,
  CategoryButton,
  Column,
  Typography,
  styled,
} from "@revolt/ui";

import { clientController } from "../../../client";

import { FlowTitle } from "./Flow";
import { Fields, Form } from "./Form";

/**
 * Account switcher UI
 */
const AccountSwitcher = styled(Column)`
  margin-top: 8px;
`;

/**
 * Flow for logging into an account
 */
export default function FlowLogin() {
  const t = useTranslation();
  const navigate = useNavigate();

  async function login(data: FormData) {
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    // TODO: reimplement login

    /*await clientController.login({
      email,
      password,
    });*/

    navigate("/app", { replace: true });
  }

  return (
    <>
      <FlowTitle subtitle={t("login.subtitle")} emoji="wave">
        {t("login.welcome")}
      </FlowTitle>
      <Form onSubmit={login}>
        <Fields fields={["email", "password"]} />
        <Button type="submit">{t("login.title")}</Button>
      </Form>
      <Typography variant="legacy-settings-description">
        {t("login.new")} <Link href="create">{t("login.create")}</Link>
      </Typography>
      <Typography variant="legacy-settings-description">
        {t("login.forgot")} <Link href="reset">{t("login.reset")}</Link>
      </Typography>
      <Typography variant="legacy-settings-description">
        {t("login.missing_verification")}{" "}
        <Link href="resend">{t("login.resend")}</Link>
      </Typography>

      {/*<Show when={clientController.getReadyClients().length > 0}>
        <Switch fallback={<Navigate href="/" />}>
          <Match when={state.experiments.isEnabled("account_switcher")}>
            <AccountSwitcher>
              <FlowTitle>Use existing account</FlowTitle>
              <For each={clientController.getReadyClients()}>
                {(client) => (
                  <CategoryButton
                    icon={<Avatar src={client.user!.avatarURL} size={32} />}
                    action="chevron"
                    onClick={() => {
                      clientController.switchAccount(client.user!._id);
                      navigate("/app");
                    }}
                  >
                    {client.user!.username}
                  </CategoryButton>
                )}
              </For>
            </AccountSwitcher>
          </Match>
        </Switch>
                  </Show>*/}
    </>
  );
}
