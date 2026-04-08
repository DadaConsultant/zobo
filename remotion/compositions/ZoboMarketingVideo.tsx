import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MARKETING_SEQUENCE } from "../constants";
import { WHY_TEAMS_CHOOSE_STATS } from "../../src/lib/why-teams-choose";

const BG = "linear-gradient(135deg,#020b18 0%,#041428 55%,#061935 100%)";

/** ── Intro (Sequence-local frames) ───────────────────────────────────────── */
function IntroSequence() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = spring({ frame, fps, config: { damping: 18, mass: 0.4 }, from: 0, to: 1 });
  const subtitleY = spring({
    frame: Math.max(0, frame - 18),
    fps,
    config: { damping: 20 },
    from: 36,
    to: 0,
  });
  const subtitleOpacity = interpolate(frame, [14, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ctaScale = spring({
    frame: Math.max(0, frame - 55),
    fps,
    config: { damping: 14 },
    from: 0.9,
    to: 1,
  });
  const ctaOpacity = interpolate(frame, [50, 72], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const imageReveal = interpolate(frame, [28, 72], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const imageY = interpolate(frame, [28, 62], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: "system-ui, sans-serif" }}>
      <AbsoluteFill
        style={{
          flexDirection: "column",
          display: "flex",
        }}
      >
        <div
          style={{
            flex: "0 0 52%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px 56px 16px",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 16,
              background: "rgba(34,211,238,0.15)",
              border: "1px solid rgba(34,211,238,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 26,
              color: "#22d3ee",
              opacity: titleOpacity,
            }}
          >
            Z
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 42,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#f9fafb",
              opacity: titleOpacity,
              textShadow: "0 0 40px rgba(34,211,238,0.25)",
            }}
          >
            Zobo Jobs
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 500,
              lineHeight: 1.4,
              maxWidth: 720,
              textAlign: "center",
              color: "rgba(207,250,254,0.9)",
              opacity: subtitleOpacity,
              transform: `translateY(${subtitleY}px)`,
            }}
          >
            Automate every first-round interview — ranked shortlists, scores, and recordings.
          </p>
          <div
            style={{
              marginTop: 6,
              padding: "10px 24px",
              borderRadius: 11,
              background: "rgba(79,209,199,0.12)",
              border: "1px solid rgba(79,209,199,0.35)",
              color: "#4fd1c7",
              fontSize: 16,
              fontWeight: 700,
              opacity: ctaOpacity,
              transform: `scale(${ctaScale})`,
            }}
          >
            See it in action at zobojobs.com
          </div>
        </div>
        <div
          style={{
            flex: "1 1 48%",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            paddingBottom: 20,
          }}
        >
          <Img
            src={staticFile("ai_interviewer_zobo.webp")}
            style={{
              width: "min(70%, 480px)",
              height: "auto",
              borderRadius: 11,
              boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
              opacity: imageReveal,
              transform: `translateY(${imageY}px)`,
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/** ── Section title ───────────────────────────────────────────────────────── */
function WhyTeamsTitleSequence() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = spring({
    frame,
    fps,
    config: { damping: 17 },
    from: 0,
    to: 1,
  });
  const scale = spring({
    frame: Math.max(0, frame - 4),
    fps,
    config: { damping: 16, mass: 0.35 },
    from: 0.94,
    to: 1,
  });
  const y = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { damping: 18 },
    from: 28,
    to: 0,
  });
  const lineWidth = interpolate(frame, [18, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: BG,
        fontFamily: "system-ui, sans-serif",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: 1000,
          padding: 48,
          opacity,
          transform: `translateY(${y}px) scale(${scale})`,
        }}
      >
        <p
          style={{
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(79,209,199,0.85)",
            marginBottom: 16,
          }}
        >
          Proof points
        </p>
        <h2
          style={{
            margin: 0,
            fontSize: 48,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#ffffff",
            textShadow: "0 0 48px rgba(79,209,199,0.2)",
          }}
        >
          Why Teams Choose Zobo Jobs
        </h2>
        <div
          style={{
            margin: "20px auto 0",
            height: 3,
            width: `${Math.round(lineWidth * 280)}px`,
            maxWidth: "100%",
            borderRadius: 2,
            background: "linear-gradient(90deg, transparent, #4fd1c7, transparent)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
}

/** ── Single stat card, fully animated ─────────────────────────────────────── */
function StatSequence({
  value,
  label,
  detail,
}: {
  value: string;
  label: string;
  detail: string;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const valueScale = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.45 },
    from: 0.35,
    to: 1,
  });
  const valueOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glow = interpolate(frame, [8, 28], [0.25, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const labelOpacity = interpolate(frame, [22, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const labelY = spring({
    frame: Math.max(0, frame - 24),
    fps,
    config: { damping: 20 },
    from: 22,
    to: 0,
  });

  const detailOpacity = interpolate(frame, [38, 58], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const detailChars = detail.length;
  const typeWindow = Math.min(52, 16 + detailChars * 0.28);
  const revealLen = Math.round(
    interpolate(frame, [50, 50 + typeWindow], [0, detailChars], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const detailShown = detail.slice(0, revealLen);

  const cardOpacity = spring({
    frame: Math.max(0, frame - 3),
    fps,
    config: { damping: 22 },
    from: 0,
    to: 1,
  });

  return (
    <AbsoluteFill
      style={{
        background: BG,
        fontFamily: "system-ui, sans-serif",
        justifyContent: "center",
        alignItems: "center",
        padding: 56,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 920,
          borderRadius: 20,
          padding: "44px 48px",
          background: "rgba(15,23,42,0.55)",
          border: "1px solid rgba(79,209,199,0.25)",
          boxShadow: `0 0 ${40 + glow * 40}px rgba(79,209,199,${0.08 + glow * 0.1})`,
          opacity: cardOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 88,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-0.06em",
            color: "#4fd1c7",
            opacity: valueOpacity,
            transform: `scale(${valueScale})`,
            textShadow: `0 0 ${24 + glow * 32}px rgba(79,209,199,${0.35 + glow * 0.35})`,
          }}
        >
          {value}
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 26,
            fontWeight: 700,
            color: "#f9fafb",
            opacity: labelOpacity,
            transform: `translateY(${labelY}px)`,
          }}
        >
          {label}
        </div>
        <p
          style={{
            marginTop: 18,
            fontSize: 18,
            lineHeight: 1.55,
            color: "rgba(226,232,240,0.88)",
            opacity: detailOpacity,
            maxWidth: 720,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {detailShown}
          {revealLen < detailChars ? (
            <span style={{ opacity: 0.4 }}>▍</span>
          ) : null}
        </p>
      </div>
    </AbsoluteFill>
  );
}

/** ── Outro ───────────────────────────────────────────────────────────────── */
function OutroSequence() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = spring({ frame, fps, config: { damping: 16 }, from: 0, to: 1 });
  return (
    <AbsoluteFill
      style={{
        background: BG,
        fontFamily: "system-ui, sans-serif",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center", opacity }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            margin: "0 auto 20px",
            background: "rgba(34,211,238,0.15)",
            border: "1px solid rgba(34,211,238,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 32,
            color: "#22d3ee",
            transform: `scale(${1 + Math.sin(frame * 0.22) * 0.04})`,
          }}
        >
          Z
        </div>
        <p style={{ fontSize: 28, fontWeight: 700, color: "#fff", margin: 0 }}>zobojobs.com</p>
        <p style={{ fontSize: 17, color: "rgba(207,250,254,0.65)", marginTop: 12 }}>
          Automate screening. Hire faster.
        </p>
      </div>
    </AbsoluteFill>
  );
}

export function ZoboMarketingVideo() {
  let from = 0;
  const seq = (duration: number) => {
    const start = from;
    from += duration;
    return { from: start, durationInFrames: duration };
  };

  const intro = seq(MARKETING_SEQUENCE.INTRO_FRAMES);
  const title = seq(MARKETING_SEQUENCE.TITLE_FRAMES);
  const s0 = seq(MARKETING_SEQUENCE.STAT_FRAMES);
  const s1 = seq(MARKETING_SEQUENCE.STAT_FRAMES);
  const s2 = seq(MARKETING_SEQUENCE.STAT_FRAMES);
  const out = seq(MARKETING_SEQUENCE.OUTRO_FRAMES);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence from={intro.from} durationInFrames={intro.durationInFrames}>
        <IntroSequence />
      </Sequence>
      <Sequence from={title.from} durationInFrames={title.durationInFrames}>
        <WhyTeamsTitleSequence />
      </Sequence>
      <Sequence from={s0.from} durationInFrames={s0.durationInFrames}>
        <StatSequence {...WHY_TEAMS_CHOOSE_STATS[0]} />
      </Sequence>
      <Sequence from={s1.from} durationInFrames={s1.durationInFrames}>
        <StatSequence {...WHY_TEAMS_CHOOSE_STATS[1]} />
      </Sequence>
      <Sequence from={s2.from} durationInFrames={s2.durationInFrames}>
        <StatSequence {...WHY_TEAMS_CHOOSE_STATS[2]} />
      </Sequence>
      <Sequence from={out.from} durationInFrames={out.durationInFrames}>
        <OutroSequence />
      </Sequence>
    </AbsoluteFill>
  );
}
