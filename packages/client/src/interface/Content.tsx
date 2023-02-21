import { Component } from "solid-js";
import { Route, Routes } from "@revolt/routing";

import { ServerHome } from "./ServerHome";
import { DevelopmentPage } from "./Development";
import { HomePage } from "./Home";
import { ChannelPage } from "./channels/ChannelPage";

/**
 * Render content without sidebars
 */
export const Content: Component = () => {
  return (
    <Routes>
      <Route
        path="/server/:server/*"
        element={
          <Routes>
            <Route path="/channel/:channel" component={ChannelPage} />
            <Route path="/*" component={ServerHome} />
          </Routes>
        }
      />
      <Route path="/channel/:channel" component={ChannelPage} />
      <Route path="/dev" element={<DevelopmentPage />} />
      <Route path="/*" element={<HomePage />} />
    </Routes>
  );
};
