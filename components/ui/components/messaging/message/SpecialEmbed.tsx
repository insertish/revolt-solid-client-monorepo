import type { WebsiteEmbed } from "revolt.js";

import { SizedContent } from "../../design";

/**
 * Special Embed
 */
export function SpecialEmbed(props: { embed: WebsiteEmbed }) {
  /**
   * Determine the media size
   */
  function getSize() {
    const special = props.embed.specialContent!;

    let width = 0,
      height = 0;
    switch (special.type) {
      case "YouTube": {
        width = props.embed.video?.width ?? 1280;
        height = props.embed.video?.height ?? 720;
        break;
      }
      case "Twitch": {
        (width = 1280), (height = 720);
        break;
      }
      case "Lightspeed": {
        (width = 1280), (height = 720);
        break;
      }
      case "Spotify": {
        (width = 420), (height = 355);
        break;
      }
      case "Soundcloud": {
        (width = 480), (height = 460);
        break;
      }
      case "Bandcamp": {
        width = props.embed.video?.width ?? 1280;
        height = props.embed.video?.height ?? 720;
        break;
      }
    }

    return { width, height };
  }

  return (
    <SizedContent width={getSize()?.width} height={getSize()?.height}>
      <iframe
        // @ts-expect-error attributes are not recognised
        loading="lazy"
        scrolling="no"
        allowFullScreen
        allowTransparency
        frameBorder={0}
        style={{ width: getSize()?.width + "px" }}
        src={props.embed.embedURL}
      />
    </SizedContent>
  );
}
