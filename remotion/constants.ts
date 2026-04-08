/** Shared with Root + homepage <Player /> — keep in sync. */
export const MARKETING_COMPOSITION_ID = "ZoboMarketing" as const;

export const MARKETING_FPS = 30;

/** Segment lengths for `ZoboMarketingVideo` — edit here only. */
export const MARKETING_SEQUENCE = {
  INTRO_FRAMES: 90,
  TITLE_FRAMES: 55,
  STAT_FRAMES: 100,
  OUTRO_FRAMES: 50,
} as const;

export const MARKETING_DURATION_FRAMES =
  MARKETING_SEQUENCE.INTRO_FRAMES +
  MARKETING_SEQUENCE.TITLE_FRAMES +
  MARKETING_SEQUENCE.STAT_FRAMES * 3 +
  MARKETING_SEQUENCE.OUTRO_FRAMES;

export const MARKETING_WIDTH = 1280;
export const MARKETING_HEIGHT = 720;
