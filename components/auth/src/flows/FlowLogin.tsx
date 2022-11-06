import { FlowTitle } from "./Flow";
import { Button, Typography } from "@revolt/ui";
import { Fields, Form } from "./Form";
import { Link, useNavigate } from "@revolt/routing";
import { useTranslation } from "@revolt/i18n";
import { clientController } from "../../../client";

/**
 * Flow for logging into an account
 */
export default function FlowLogin() {
  const t = useTranslation();
  const navigate = useNavigate();

  async function login(data: FormData) {
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    await clientController.login({
      email,
      password,
    });

    navigate("/", { replace: true });
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
      <Typography variant="subtitle">
        {t("login.new")} <Link href="create">{t("login.create")}</Link>
      </Typography>
      <Typography variant="subtitle">
        {t("login.forgot")} <Link href="reset">{t("login.reset")}</Link>
      </Typography>
      <Typography variant="subtitle">
        {t("login.missing_verification")}{" "}
        <Link href="resend">{t("login.resend")}</Link>
      </Typography>
    </>
  );
}
