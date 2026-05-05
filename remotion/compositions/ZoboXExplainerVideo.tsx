import type { CSSProperties, ReactNode } from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  X_POST_SCENE_FRAMES,
  X_POST_TRANSITION_FRAMES,
} from "../constants";

const COLORS = {
  parchment: "#f8f8f7",
  white: "#ffffff",
  onyx: "#140700",
  pewter: "#cccccc",
  slate: "#5e5855",
  steel: "#514c49",
};

const FONT = {
  display: '"Portrait Text", Times, "Times New Roman", serif',
  serif: 'Times, "Times New Roman", serif',
  sans: 'Graphik, Arial, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const SCENE_STARTS = X_POST_SCENE_FRAMES.map((_, index) => {
  const priorFrames = X_POST_SCENE_FRAMES.slice(0, index).reduce(
    (total, frames) => total + frames,
    0,
  );

  return priorFrames - X_POST_TRANSITION_FRAMES * index;
});

const clamp = (value: number, input: [number, number], output: [number, number]) =>
  interpolate(value, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

function sceneStyle(frame: number, duration: number, dark = false): CSSProperties {
  const opacityIn = clamp(frame, [0, 16], [0, 1]);
  const opacityOut = clamp(frame, [duration - X_POST_TRANSITION_FRAMES, duration], [1, 0]);
  const yIn = clamp(frame, [0, 24], [42, 0]);
  const yOut = clamp(frame, [duration - X_POST_TRANSITION_FRAMES, duration], [0, -32]);
  const blurIn = clamp(frame, [0, 18], [16, 0]);
  const blurOut = clamp(frame, [duration - X_POST_TRANSITION_FRAMES, duration], [0, 18]);

  return {
    overflow: "hidden",
    opacity: Math.min(opacityIn, opacityOut),
    transform: `translateY(${yIn + yOut}px)`,
    filter: `blur(${Math.max(blurIn, blurOut)}px)`,
    background: dark ? COLORS.onyx : COLORS.parchment,
    color: dark ? COLORS.parchment : COLORS.onyx,
    fontFamily: FONT.sans,
  };
}

function Scene({
  frame,
  duration,
  dark = false,
  children,
}: {
  frame: number;
  duration: number;
  dark?: boolean;
  children: ReactNode;
}) {
  return (
    <AbsoluteFill style={sceneStyle(frame, duration, dark)}>
      <AbsoluteFill
        style={{
          opacity: dark ? 0.12 : 0.24,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(20,7,0,0.055) 0px, rgba(20,7,0,0.055) 1px, transparent 1px, transparent 8px)",
        }}
      />
      {children}
    </AbsoluteFill>
  );
}

function Label({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        border: `3px solid ${dark ? COLORS.parchment : COLORS.onyx}`,
        borderRadius: 0,
        padding: "14px 20px",
        fontSize: 29,
        lineHeight: 1,
        letterSpacing: "-0.6px",
        textTransform: "uppercase",
        color: dark ? COLORS.parchment : COLORS.onyx,
      }}
    >
      {children}
    </div>
  );
}

function CornerFrame({ dark = false }: { dark?: boolean }) {
  const color = dark ? COLORS.parchment : COLORS.onyx;
  return (
    <div
      style={{
        position: "absolute",
        inset: 58,
        border: `3px solid ${color}`,
        borderRadius: 18,
        opacity: 0.95,
      }}
    />
  );
}

function HookScene({ frame, duration }: { frame: number; duration: number }) {
  const titleOpacity = clamp(frame, [8, 28], [0, 1]);
  const titleY = spring({
    frame: Math.max(0, frame - 6),
    fps: 30,
    from: 60,
    to: 0,
    config: { damping: 18 },
  });
  const scanX = clamp(frame, [36, 132], [-120, 1120]);

  return (
    <Scene frame={frame} duration={duration}>
      <div
        style={{
          position: "absolute",
          left: -24,
          bottom: 80,
          fontFamily: FONT.display,
          fontSize: 184,
          lineHeight: 0.9,
          letterSpacing: "-4px",
          color: "rgba(20,7,0,0.08)",
        }}
      >
        MARGIN
      </div>
      <div style={{ position: "absolute", top: 72, left: 72, right: 72, display: "flex", justifyContent: "space-between" }}>
        <Label>X explainer</Label>
        <Label>Zobo Jobs</Label>
      </div>
      <div
        style={{
          position: "absolute",
          left: 72,
          right: 72,
          top: 166,
          height: 3,
          background: COLORS.onyx,
          transform: `scaleX(${clamp(frame, [14, 40], [0, 1])})`,
          transformOrigin: "left center",
        }}
      />
      <h1
        style={{
          position: "absolute",
          left: 78,
          top: 250,
          width: 872,
          margin: 0,
          fontFamily: FONT.display,
          fontSize: 108,
          lineHeight: 0.94,
          fontWeight: 400,
          letterSpacing: "-2.5px",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        Your first-round interviews are eating your margin.
      </h1>
      <div
        style={{
          position: "absolute",
          left: 80,
          bottom: 136,
          width: 690,
          borderTop: `3px solid ${COLORS.onyx}`,
          paddingTop: 24,
          color: COLORS.slate,
          fontSize: 40,
          lineHeight: 1.12,
          letterSpacing: "-0.7px",
          opacity: clamp(frame, [54, 82], [0, 1]),
        }}
      >
        Agencies cannot scale searches by repeating the same screening call.
      </div>
      <div
        style={{
          position: "absolute",
          top: 178,
          bottom: 90,
          left: scanX,
          width: 3,
          background: COLORS.onyx,
          opacity: 0.62,
        }}
      />
    </Scene>
  );
}

function ProblemScene({ frame, duration }: { frame: number; duration: number }) {
  return (
    <Scene frame={frame} duration={duration}>
      <CornerFrame />
      <div style={{ position: "absolute", left: 86, top: 86 }}>
        <Label>the old way</Label>
      </div>
      <h2
        style={{
          position: "absolute",
          left: 88,
          top: 178,
          width: 800,
          margin: 0,
          fontFamily: FONT.display,
          fontSize: 86,
          lineHeight: 0.98,
          fontWeight: 400,
          letterSpacing: "-2px",
          opacity: clamp(frame, [8, 28], [0, 1]),
          transform: `translateX(${clamp(frame, [8, 32], [-48, 0])}px)`,
        }}
      >
        More calls. Slower clients. Messier evidence.
      </h2>
      <div
        style={{
          position: "absolute",
          left: 92,
          right: 92,
          bottom: 104,
          display: "grid",
          gap: 20,
        }}
      >
        {["Calendar chasing", "Phone-screen notes", "Inconsistent comparisons", "Late shortlist updates"].map((item, index) => {
          const opacity = clamp(frame, [42 + index * 8, 62 + index * 8], [0, 1]);
          return (
            <div
              key={item}
              style={{
                height: 82,
                borderTop: `3px solid ${COLORS.onyx}`,
                display: "grid",
                gridTemplateColumns: "100px 1fr",
                alignItems: "center",
                opacity,
                transform: `translateX(${clamp(frame, [42 + index * 8, 66 + index * 8], [70, 0])}px)`,
              }}
            >
              <div style={{ fontFamily: FONT.serif, fontSize: 43 }}>{`0${index + 1}`}</div>
              <div style={{ fontSize: 43, letterSpacing: "-0.8px" }}>{item}</div>
            </div>
          );
        })}
      </div>
    </Scene>
  );
}

function AiLayerScene({ frame, duration }: { frame: number; duration: number }) {
  return (
    <Scene frame={frame} duration={duration}>
      <div style={{ position: "absolute", left: 72, top: 72 }}>
        <Label>the shift</Label>
      </div>
      <h2
        style={{
          position: "absolute",
          left: 76,
          top: 158,
          width: 788,
          margin: 0,
          fontFamily: FONT.display,
          fontSize: 88,
          lineHeight: 0.96,
          fontWeight: 400,
          letterSpacing: "-2px",
          opacity: clamp(frame, [8, 30], [0, 1]),
        }}
      >
        Let AI interview every candidate first.
      </h2>
      <div
        style={{
          position: "absolute",
          left: 80,
          bottom: 96,
          width: 440,
          height: 408,
          border: `3px solid ${COLORS.onyx}`,
          borderRadius: 18,
          overflow: "hidden",
          background: COLORS.white,
          opacity: clamp(frame, [36, 60], [0, 1]),
          transform: `translateY(${clamp(frame, [36, 68], [54, 0])}px)`,
        }}
      >
        <Img
          src={staticFile("ai_interviewer_zobo.webp")}
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.08)" }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          right: 82,
          bottom: 108,
          width: 390,
          display: "grid",
          gap: 22,
        }}
      >
        {["Same questions", "Recorded answers", "Scored evidence"].map((item, index) => (
          <div
            key={item}
            style={{
              borderLeft: `7px solid ${COLORS.onyx}`,
              paddingLeft: 20,
              fontSize: 42,
              lineHeight: 1.05,
              letterSpacing: "-0.85px",
              opacity: clamp(frame, [64 + index * 10, 84 + index * 10], [0, 1]),
              transform: `translateY(${clamp(frame, [64 + index * 10, 88 + index * 10], [36, 0])}px)`,
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </Scene>
  );
}

function WorkflowScene({ frame, duration }: { frame: number; duration: number }) {
  const steps = [
    ["Invite", "Send the interview link"],
    ["Interview", "AI runs the first round"],
    ["Review", "Ranked evidence appears"],
  ];

  return (
    <Scene frame={frame} duration={duration}>
      <div
        style={{
          position: "absolute",
          right: -20,
          top: 72,
          fontFamily: FONT.display,
          fontSize: 170,
          color: "rgba(20,7,0,0.075)",
          letterSpacing: "-3px",
        }}
      >
        FLOW
      </div>
      <div style={{ position: "absolute", left: 72, top: 72 }}>
        <Label>how it works</Label>
      </div>
      <h2
        style={{
          position: "absolute",
          left: 76,
          top: 170,
          width: 840,
          margin: 0,
          fontFamily: FONT.display,
          fontSize: 78,
          lineHeight: 0.98,
          fontWeight: 400,
          letterSpacing: "-1.7px",
          opacity: clamp(frame, [6, 26], [0, 1]),
        }}
      >
        From applicant pool to client-ready shortlist.
      </h2>
      <div
        style={{
          position: "absolute",
          left: 82,
          right: 82,
          bottom: 122,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 24,
        }}
      >
        {steps.map(([title, text], index) => {
          const opacity = clamp(frame, [40 + index * 14, 66 + index * 14], [0, 1]);
          return (
            <div
              key={title}
              style={{
                minHeight: 310,
                background: COLORS.white,
                border: `3px solid ${COLORS.onyx}`,
                borderRadius: index === 1 ? 18 : 0,
                padding: 28,
                opacity,
                transform: `translateY(${clamp(frame, [40 + index * 14, 70 + index * 14], [52, 0])}px)`,
              }}
            >
              <div style={{ fontFamily: FONT.serif, fontSize: 58 }}>{`0${index + 1}`}</div>
              <div style={{ marginTop: 48, fontSize: 43, lineHeight: 1, letterSpacing: "-0.9px" }}>{title}</div>
              <div style={{ marginTop: 18, color: COLORS.slate, fontSize: 29, lineHeight: 1.12, letterSpacing: "-0.45px" }}>{text}</div>
            </div>
          );
        })}
      </div>
    </Scene>
  );
}

function OutcomeScene({ frame, duration }: { frame: number; duration: number }) {
  return (
    <Scene frame={frame} duration={duration}>
      <div style={{ position: "absolute", left: 72, top: 72 }}>
        <Label>the payoff</Label>
      </div>
      <h2
        style={{
          position: "absolute",
          left: 74,
          top: 154,
          width: 840,
          margin: 0,
          fontFamily: FONT.display,
          fontSize: 86,
          lineHeight: 0.95,
          fontWeight: 400,
          letterSpacing: "-2px",
          opacity: clamp(frame, [8, 30], [0, 1]),
        }}
      >
        Save cost. Save time. Recommend better candidates.
      </h2>
      <div
        style={{
          position: "absolute",
          left: 76,
          right: 76,
          bottom: 104,
          display: "grid",
          gap: 22,
        }}
      >
        {[
          ["10x", "faster first-round screening"],
          ["24/7", "candidate interviews"],
          ["1", "stronger client shortlist"],
        ].map(([value, label], index) => {
          const opacity = clamp(frame, [48 + index * 9, 70 + index * 9], [0, 1]);
          return (
            <div
              key={value}
              style={{
                background: COLORS.white,
                border: `3px solid ${COLORS.onyx}`,
                borderRadius: index === 1 ? 18 : 0,
                padding: "24px 30px",
                display: "grid",
                gridTemplateColumns: "210px 1fr",
                alignItems: "center",
                gap: 24,
                opacity,
                transform: `scale(${spring({
                  frame: Math.max(0, frame - 48 - index * 9),
                  fps: 30,
                  from: 0.94,
                  to: 1,
                  config: { damping: 16, mass: 0.45 },
                })})`,
              }}
            >
              <div style={{ fontFamily: FONT.display, fontSize: 82, lineHeight: 0.9, letterSpacing: "-1.5px" }}>{value}</div>
              <div>
                <div style={{ fontSize: 41, letterSpacing: "-0.9px" }}>{label}</div>
                <div style={{ marginTop: 16, height: 12, border: `3px solid ${COLORS.onyx}`, borderRadius: 96, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${clamp(frame, [72 + index * 10, 104 + index * 10], [0, [86, 70, 92][index]])}%`,
                      height: "100%",
                      background: COLORS.onyx,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Scene>
  );
}

function CtaScene({ frame, duration }: { frame: number; duration: number }) {
  const zScale = spring({
    frame: Math.max(0, frame - 24),
    fps: 30,
    from: 0.86,
    to: 1,
    config: { damping: 16 },
  });

  return (
    <Scene frame={frame} duration={duration} dark>
      <CornerFrame dark />
      <div style={{ position: "absolute", left: 86, top: 86 }}>
        <Label dark>for recruitment agencies</Label>
      </div>
      <h2
        style={{
          position: "absolute",
          left: 88,
          top: 192,
          width: 820,
          margin: 0,
          fontFamily: FONT.display,
          fontSize: 104,
          lineHeight: 0.92,
          fontWeight: 400,
          letterSpacing: "-2.2px",
          opacity: clamp(frame, [8, 32], [0, 1]),
          transform: `translateY(${clamp(frame, [8, 32], [46, 0])}px)`,
        }}
      >
        Move first-round interviews to AI.
      </h2>
      <p
        style={{
          position: "absolute",
          left: 90,
          top: 520,
          width: 710,
          margin: 0,
          color: COLORS.pewter,
          fontSize: 42,
          lineHeight: 1.12,
          letterSpacing: "-0.85px",
          opacity: clamp(frame, [50, 76], [0, 1]),
        }}
      >
        Give clients better evidence without burning recruiter hours.
      </p>
      <div
        style={{
          position: "absolute",
          right: 96,
          top: 102,
          width: 186,
          height: 186,
          borderRadius: 96,
          background: COLORS.parchment,
          color: COLORS.onyx,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT.display,
          fontSize: 106,
          transform: `scale(${zScale})`,
          opacity: clamp(frame, [22, 48], [0, 1]),
        }}
      >
        Z
      </div>
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          bottom: 98,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: clamp(frame, [88, 118], [0, 1]),
        }}
      >
        <div
          style={{
            border: `3px solid ${COLORS.parchment}`,
            borderRadius: 96,
            padding: "22px 34px",
            fontSize: 37,
            lineHeight: 1,
            letterSpacing: "-0.7px",
          }}
        >
          Book a demo
        </div>
        <div style={{ fontFamily: FONT.serif, fontSize: 43, letterSpacing: "-0.5px" }}>zobojobs.com</div>
      </div>
      <AbsoluteFill style={{ background: COLORS.onyx, opacity: clamp(frame, [duration - 24, duration], [0, 1]) }} />
    </Scene>
  );
}

export function ZoboXExplainerVideo() {
  const globalFrame = useCurrentFrame();
  const scenes = [
    HookScene,
    ProblemScene,
    AiLayerScene,
    WorkflowScene,
    OutcomeScene,
    CtaScene,
  ];

  return (
    <AbsoluteFill style={{ background: COLORS.parchment }}>
      {scenes.map((SceneComponent, index) => {
        const start = SCENE_STARTS[index];
        const duration = X_POST_SCENE_FRAMES[index];
        return (
          <Sequence key={start} from={start} durationInFrames={duration}>
            <SceneComponent frame={globalFrame - start} duration={duration} />
          </Sequence>
        );
      })}
      <div
        style={{
          position: "absolute",
          right: 40,
          bottom: 32,
          color: globalFrame > SCENE_STARTS[5] ? COLORS.parchment : COLORS.steel,
          fontSize: 22,
          letterSpacing: "-0.25px",
          opacity: clamp(globalFrame, [24, 44], [0, 0.58]),
          fontFamily: FONT.sans,
        }}
      >
        Zobo Jobs / AI interviews for recruitment agencies
      </div>
    </AbsoluteFill>
  );
}
