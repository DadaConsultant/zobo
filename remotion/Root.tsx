import { Composition } from "remotion";
import {
  MARKETING_COMPOSITION_ID,
  MARKETING_DURATION_FRAMES,
  MARKETING_FPS,
  MARKETING_HEIGHT,
  MARKETING_WIDTH,
} from "./constants";
import { ZoboMarketingVideo } from "./compositions/ZoboMarketingVideo";

export function RemotionRoot() {
  return (
    <>
      <Composition
        id={MARKETING_COMPOSITION_ID}
        component={ZoboMarketingVideo}
        durationInFrames={MARKETING_DURATION_FRAMES}
        fps={MARKETING_FPS}
        width={MARKETING_WIDTH}
        height={MARKETING_HEIGHT}
      />
    </>
  );
}
