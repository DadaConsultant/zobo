import { Composition } from "remotion";
import {
  MARKETING_COMPOSITION_ID,
  MARKETING_DURATION_FRAMES,
  MARKETING_FPS,
  MARKETING_HEIGHT,
  MARKETING_WIDTH,
  X_POST_COMPOSITION_ID,
  X_POST_DURATION_FRAMES,
  X_POST_FPS,
  X_POST_HEIGHT,
  X_POST_WIDTH,
} from "./constants";
import { ZoboMarketingVideo } from "./compositions/ZoboMarketingVideo";
import { ZoboXExplainerVideo } from "./compositions/ZoboXExplainerVideo";

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
      <Composition
        id={X_POST_COMPOSITION_ID}
        component={ZoboXExplainerVideo}
        durationInFrames={X_POST_DURATION_FRAMES}
        fps={X_POST_FPS}
        width={X_POST_WIDTH}
        height={X_POST_HEIGHT}
      />
    </>
  );
}
