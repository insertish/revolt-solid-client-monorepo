import type { JSX } from "solid-js";
import { render } from "solid-testing-library";

import { ThemeProvider, darkTheme, Masks } from "@revolt/ui";
import { Router, hashIntegration } from "@revolt/routing";
import i18n, { I18nContext } from "@revolt/i18n";

/**
 * Inject Context above children
 */
export default function testMiddleware(children: () => JSX.Element) {
  return (
    <Router source={hashIntegration()}>
      <I18nContext.Provider value={i18n}>
        <ThemeProvider theme={darkTheme}>{children()}</ThemeProvider>
      </I18nContext.Provider>
      <Masks />
    </Router>
  );
}

/**
 * Render with context
 */
export function renderWithContext(children: () => JSX.Element) {
  return render(() => testMiddleware(() => children()));
}
