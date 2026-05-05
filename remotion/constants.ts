/** Shared with Root + homepage <Player /> — keep in sync. */
export const MARKETING_COMPOSITION_ID = "ZoboMarketing" as const;

export const MARKETING_FPS = 30;

/** Scene lengths for `ZoboMarketingVideo` — edit here only. */
export const MARKETING_TRANSITION_FRAMES = 14;

export const MARKETING_SCENE_FRAMES = [150, 165, 160, 170, 165] as const;

export const MARKETING_DURATION_FRAMES =
  MARKETING_SCENE_FRAMES.reduce((total, frames) => total + frames, 0) -
  MARKETING_TRANSITION_FRAMES * (MARKETING_SCENE_FRAMES.length - 1);

export const MARKETING_WIDTH = 1280;
export const MARKETING_HEIGHT = 720;

export const X_POST_COMPOSITION_ID = "ZoboXExplainer" as const;
export const X_POST_FPS = 30;
export const X_POST_WIDTH = 1080;
export const X_POST_HEIGHT = 1080;
export const X_POST_TRANSITION_FRAMES = 12;
export const X_POST_SCENE_FRAMES = [160, 160, 160, 160, 160, 160] as const;
export const X_POST_DURATION_FRAMES =
  X_POST_SCENE_FRAMES.reduce((total, frames) => total + frames, 0) -
  X_POST_TRANSITION_FRAMES * (X_POST_SCENE_FRAMES.length - 1);
