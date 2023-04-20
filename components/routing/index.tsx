import { Accessor } from "solid-js";

import { useLocation } from "@solidjs/router";

/**
 * We re-export everything to prevent us importing @solidjs/router
 * more than once in the project, this can cause some weird behaviour
 * where it can't find the context. This is a side-effect of working
 * in a monorepo. Ideally, this should be done any time we import
 * a new library that is used in multiple components.
 */
export {
  Link,
  Navigate,
  Router,
  Routes,
  Route,
  useNavigate,
  useParams,
  useLocation,
  hashIntegration,
} from "@solidjs/router";

const RE_SERVER = /\/server\/([A-Z0-9]{26})/;
const RE_CHANNEL = /\/channel\/([A-Z0-9]{26})/;

/**
 * Route parameters available globally
 */
type GlobalParams = {
  /**
   * Server ID
   */
  serverId?: string;

  /**
   * Channel ID
   */
  channelId?: string;
};

/**
 * Try to resolve route parameters regardless of the current position within component tree
 */
export function useSmartParams(): Accessor<GlobalParams> {
  const location = useLocation();

  return () => {
    const params: GlobalParams = {};

    // Check for server ID
    const server = location.pathname.match(RE_SERVER);
    if (server) {
      params.serverId = server[1];
    }

    // Check for channel ID
    const channel = location.pathname.match(RE_CHANNEL);
    if (channel) {
      params.channelId = channel[1];
    }

    return params;
  };
}
