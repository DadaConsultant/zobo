"use client";

import { Player } from "@remotion/player";
import {
  MARKETING_DURATION_FRAMES,
  MARKETING_FPS,
  MARKETING_HEIGHT,
  MARKETING_WIDTH,
} from "../../../remotion/constants";
import { ZoboMarketingVideo } from "../../../remotion/compositions/ZoboMarketingVideo";

export function MarketingVideoPlayer() {
  return (
    <div className="w-full bg-[#020b18]">
      <Player
        component={ZoboMarketingVideo}
        durationInFrames={MARKETING_DURATION_FRAMES}
        fps={MARKETING_FPS}
        compositionWidth={MARKETING_WIDTH}
        compositionHeight={MARKETING_HEIGHT}
        controls
        showVolumeControls
        acknowledgeRemotionLicense
        className="w-full [&_video]:!rounded-none"
        style={{
          width: "100%",
          aspectRatio: `${MARKETING_WIDTH} / ${MARKETING_HEIGHT}`,
        }}
      />
    </div>
  );
}
