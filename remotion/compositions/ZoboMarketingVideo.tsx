import type { CSSProperties, ReactNode } from "react";
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
import { MARKETING_SCENE_FRAMES, MARKETING_TRANSITION_FRAMES } from "../constants";

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

const SCENE_STARTS = MARKETING_SCENE_FRAMES.map((_, index) => {
  const priorSceneFrames = MARKETING_SCENE_FRAMES.slice(0, index).reduce(
    (total, frames) => total + frames,
    0,
  );

  return priorSceneFrames - MARKETING_TRANSITION_FRAMES * index;
});

const clamp = (value: number, input: [number, number], output: [number, number]) =>
  interpolate(value, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

function sceneTransitionStyle(frame: number, duration: number): CSSProperties {
  const opacityIn = clamp(frame, [0, 16], [0, 1]);
  const opacityOut = clamp(frame, [duration - MARKETING_TRANSITION_FRAMES, duration], [1, 0]);
  const entryY = clamp(frame, [0, 22], [34, 0]);
  const exitY = clamp(frame, [duration - MARKETING_TRANSITION_FRAMES, duration], [0, -24]);
  const blurIn = clamp(frame, [0, 18], [14, 0]);
  const blurOut = clamp(frame, [duration - MARKETING_TRANSITION_FRAMES, duration], [0, 16]);

  return {
    opacity: Math.min(opacityIn, opacityOut),
    transform: `translateY(${entryY + exitY}px)`,
    filter: `blur(${Math.max(blurIn, blurOut)}px)`,
  };
}

function Scene({
  frame,
  duration,
  children,
  dark = false,
}: {
  frame: number;
  duration: number;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <AbsoluteFill
      style={{
        ...sceneTransitionStyle(frame, duration),
        overflow: "hidden",
        background: dark ? COLORS.onyx : COLORS.parchment,
        color: dark ? COLORS.parchment : COLORS.onyx,
        fontFamily: FONT.sans,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

function Grain({ dark = false }: { dark?: boolean }) {
  return (
    <AbsoluteFill
      style={{
        opacity: dark ? 0.16 : 0.26,
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(20,7,0,0.055) 0px, rgba(20,7,0,0.055) 1px, transparent 1px, transparent 7px)",
      }}
    />
  );
}

function Rule({ style }: { style?: CSSProperties }) {
  return <div style={{ height: 2, background: COLORS.onyx, transformOrigin: "left center", ...style }} />;
}

function Label({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        border: `2px solid ${dark ? COLORS.parchment : COLORS.onyx}`,
        borderRadius: 0,
        padding: "8px 14px",
        fontFamily: FONT.sans,
        fontSize: 20,
        lineHeight: 1,
        letterSpacing: "-0.4px",
        textTransform: "uppercase",
        color: dark ? COLORS.parchment : COLORS.onyx,
      }}
    >
      {children}
    </div>
  );
}

function HookScene({ frame, duration }: { frame: number; duration: number }) {
  const headlineY = spring({ frame: Math.max(0, frame - 4), fps: 30, from: 46, to: 0, config: { damping: 18 } });
  const headlineOpacity = clamp(frame, [6, 25], [0, 1]);
  const ruleScale = clamp(frame, [16, 46], [0, 1]);
  const scanX = clamp(frame, [24, duration - 12], [-260, 1280]);

  return (
    <Scene frame={frame} duration={duration}>
      <Grain />
      <div
        style={{
          position: "absolute",
          left: -34,
          bottom: 28,
          fontFamily: FONT.display,
          fontSize: 176,
          lineHeight: 0.9,
          letterSpacing: "-3px",
          color: "rgba(20,7,0,0.08)",
        }}
      >
        SCREENING
      </div>
      <div style={{ position: "absolute", top: 48, left: 56, right: 56, display: "flex", justifyContent: "space-between" }}>
        <Label>agency ops</Label>
        <Label>zobo jobs</Label>
      </div>
      <div
        style={{
          position: "absolute",
          top: 128,
          left: 56,
          right: 56,
          transform: `scaleX(${ruleScale})`,
        }}
      >
        <Rule />
      </div>
      <div
        style={{
          position: "absolute",
          top: 178,
          left: 72,
          width: 700,
          opacity: headlineOpacity,
          transform: `translateY(${headlineY}px)`,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: FONT.display,
            fontSize: 86,
            lineHeight: 0.96,
            fontWeight: 400,
            letterSpacing: "-1.8px",
          }}
        >
          Stop paying recruiters to repeat first-round calls.
        </h1>
      </div>
      <div
        style={{
          position: "absolute",
          right: 70,
          top: 186,
          width: 380,
          display: "grid",
          gap: 16,
        }}
      >
        {[
          ["Calendar chasing", "days lost before evidence"],
          ["Manual screening", "hours spent per open role"],
          ["Client pressure", "shortlists expected faster"],
        ].map(([title, detail], index) => {
          const opacity = clamp(frame, [28 + index * 8, 46 + index * 8], [0, 1]);
          const x = clamp(frame, [28 + index * 8, 50 + index * 8], [56, 0]);
          return (
            <div
              key={title}
              style={{
                opacity,
                transform: `translateX(${x}px)`,
                borderTop: `2px solid ${COLORS.onyx}`,
                paddingTop: 18,
                display: "grid",
                gridTemplateColumns: "120px 1fr",
                gap: 18,
              }}
            >
              <div style={{ fontFamily: FONT.serif, fontSize: 34, lineHeight: 1 }}>{`0${index + 1}`}</div>
              <div>
                <div style={{ fontSize: 27, letterSpacing: "-0.45px" }}>{title}</div>
                <div style={{ marginTop: 7, color: COLORS.slate, fontSize: 21, lineHeight: 1.15 }}>{detail}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          top: 132,
          bottom: 70,
          left: scanX,
          width: 2,
          background: COLORS.onyx,
          opacity: 0.7,
        }}
      />
    </Scene>
  );
}

function InterviewLayerScene({ frame, duration }: { frame: number; duration: number }) {
  const imageOpacity = clamp(frame, [8, 28], [0, 1]);
  const imageY = clamp(frame, [8, 34], [50, 0]);
  const lineScale = clamp(frame, [34, 70], [0, 1]);

  return (
    <Scene frame={frame} duration={duration}>
      <Grain />
      <div
        style={{
          position: "absolute",
          inset: "44px 56px",
          border: `2px solid ${COLORS.onyx}`,
          borderRadius: 16,
        }}
      />
      <div style={{ position: "absolute", left: 76, top: 76 }}>
        <Label>always-on interview layer</Label>
      </div>
      <div
        style={{
          position: "absolute",
          left: 78,
          top: 142,
          width: 510,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: FONT.display,
            fontSize: 76,
            lineHeight: 0.97,
            fontWeight: 400,
            letterSpacing: "-1.5px",
            opacity: clamp(frame, [12, 36], [0, 1]),
            transform: `translateX(${clamp(frame, [12, 36], [-32, 0])}px)`,
          }}
        >
          Interview every candidate before your team opens their calendar.
        </h2>
      </div>
      <div
        style={{
          position: "absolute",
          right: 78,
          top: 96,
          width: 405,
          height: 462,
          overflow: "hidden",
          borderRadius: 16,
          border: `2px solid ${COLORS.onyx}`,
          background: COLORS.white,
          opacity: imageOpacity,
          transform: `translateY(${imageY}px)`,
        }}
      >
        <Img
          src={staticFile("ai_interviewer_zobo.webp")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "grayscale(1) contrast(1.08)",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 640,
          top: 238,
          width: 190,
          height: 2,
          background: COLORS.onyx,
          transform: `scaleX(${lineScale})`,
          transformOrigin: "left center",
        }}
      />
      {["Structured questions", "Recorded answers", "Consistent scoring"].map((copy, index) => {
        const opacity = clamp(frame, [46 + index * 9, 66 + index * 9], [0, 1]);
        const y = clamp(frame, [46 + index * 9, 66 + index * 9], [28, 0]);
        return (
          <div
            key={copy}
            style={{
              position: "absolute",
              left: 78 + index * 236,
              top: 518,
              width: 198,
              opacity,
              transform: `translateY(${y}px)`,
              borderLeft: `5px solid ${COLORS.onyx}`,
              paddingLeft: 16,
              fontSize: 25,
              lineHeight: 1.1,
              letterSpacing: "-0.35px",
            }}
          >
            {copy}
          </div>
        );
      })}
    </Scene>
  );
}

function SavingsScene({ frame, duration }: { frame: number; duration: number }) {
  const bars = [0.82, 0.64, 0.9];
  return (
    <Scene frame={frame} duration={duration}>
      <Grain />
      <div
        style={{
          position: "absolute",
          right: -6,
          top: 24,
          fontFamily: FONT.display,
          fontSize: 150,
          color: "rgba(20,7,0,0.08)",
          letterSpacing: "-2px",
        }}
      >
        MARGIN
      </div>
      <div style={{ position: "absolute", left: 56, top: 50 }}>
        <Label>cost model</Label>
      </div>
      <h2
        style={{
          position: "absolute",
          left: 66,
          top: 128,
          width: 545,
          margin: 0,
          fontFamily: FONT.display,
          fontSize: 79,
          lineHeight: 0.95,
          fontWeight: 400,
          letterSpacing: "-1.5px",
          opacity: clamp(frame, [6, 24], [0, 1]),
        }}
      >
        Save time and cost before the shortlist exists.
      </h2>
      <div
        style={{
          position: "absolute",
          right: 70,
          top: 144,
          width: 500,
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 18,
        }}
      >
        {[
          ["10x", "faster screening"],
          ["24/7", "candidate interviews"],
          ["1", "client-ready shortlist"],
        ].map(([value, label], index) => {
          const opacity = clamp(frame, [22 + index * 10, 44 + index * 10], [0, 1]);
          const scale = spring({
            frame: Math.max(0, frame - 22 - index * 10),
            fps: 30,
            from: 0.92,
            to: 1,
            config: { damping: 15, mass: 0.45 },
          });
          return (
            <div
              key={value}
              style={{
                opacity,
                transform: `scale(${scale})`,
                background: COLORS.white,
                border: `2px solid ${COLORS.onyx}`,
                borderRadius: index === 1 ? 16 : 0,
                padding: "20px 24px",
                display: "grid",
                gridTemplateColumns: "150px 1fr",
                alignItems: "end",
                gap: 20,
              }}
            >
              <div style={{ fontFamily: FONT.display, fontSize: 78, lineHeight: 0.9, letterSpacing: "-1px" }}>{value}</div>
              <div>
                <div style={{ fontSize: 29, letterSpacing: "-0.5px" }}>{label}</div>
                <div style={{ marginTop: 14, height: 10, border: `2px solid ${COLORS.onyx}`, borderRadius: 96, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${clamp(frame, [44 + index * 8, 78 + index * 8], [0, bars[index] * 100])}%`,
                      background: COLORS.onyx,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 70,
          bottom: 64,
          fontSize: 25,
          color: COLORS.slate,
          letterSpacing: "-0.25px",
          opacity: clamp(frame, [84, 112], [0, 1]),
        }}
      >
        Less coordination overhead. More searches protected. Better margins per client.
      </div>
    </Scene>
  );
}

function EvidenceScene({ frame, duration }: { frame: number; duration: number }) {
  const stackRotation = [-4, 1.5, 4.5];
  return (
    <Scene frame={frame} duration={duration}>
      <Grain />
      <div style={{ position: "absolute", left: -14, top: 40, fontFamily: FONT.display, fontSize: 154, color: "rgba(20,7,0,0.07)" }}>
        EVIDENCE
      </div>
      <div style={{ position: "absolute", right: 58, top: 48 }}>
        <Label>client recommendation file</Label>
      </div>
      <h2
        style={{
          position: "absolute",
          left: 74,
          top: 140,
          width: 520,
          margin: 0,
          fontFamily: FONT.display,
          fontSize: 76,
          lineHeight: 0.98,
          fontWeight: 400,
          letterSpacing: "-1.4px",
          opacity: clamp(frame, [8, 30], [0, 1]),
          transform: `translateX(${clamp(frame, [8, 30], [-38, 0])}px)`,
        }}
      >
        Hire the best candidate, not the fastest calendar slot.
      </h2>
      <div style={{ position: "absolute", right: 96, top: 146, width: 418, height: 430 }}>
        {["Communication", "Role fit", "Client evidence"].map((title, index) => {
          const opacity = clamp(frame, [28 + index * 10, 50 + index * 10], [0, 1]);
          const y = clamp(frame, [28 + index * 10, 52 + index * 10], [64, 0]);
          return (
            <div
              key={title}
              style={{
                position: "absolute",
                inset: `${index * 30}px ${index * 18}px auto ${index * 4}px`,
                height: 300,
                background: COLORS.white,
                border: `2px solid ${COLORS.onyx}`,
                borderRadius: index === 1 ? 16 : 0,
                padding: 26,
                opacity,
                transform: `translateY(${y}px) rotate(${stackRotation[index]}deg)`,
              }}
            >
              <div style={{ fontSize: 20, textTransform: "uppercase", letterSpacing: "-0.2px", color: COLORS.slate }}>scorecard {index + 1}</div>
              <div style={{ marginTop: 16, fontFamily: FONT.serif, fontSize: 37, lineHeight: 1 }}>{title}</div>
              <div style={{ marginTop: 28, display: "grid", gap: 12 }}>
                {[0.9, 0.74, 0.82].map((width, barIndex) => (
                  <div key={barIndex} style={{ height: 9, border: `2px solid ${COLORS.onyx}`, borderRadius: 96, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${clamp(frame, [58 + index * 7, 88 + index * 7], [0, width * 100])}%`,
                        background: COLORS.onyx,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 78,
          bottom: 76,
          width: 510,
          borderTop: `2px solid ${COLORS.onyx}`,
          paddingTop: 22,
          color: COLORS.slate,
          fontSize: 27,
          lineHeight: 1.18,
          opacity: clamp(frame, [88, 114], [0, 1]),
        }}
      >
        Comparable answers, scores, and recordings give clients a recommendation they can trust.
      </div>
    </Scene>
  );
}

function CtaScene({ frame, duration }: { frame: number; duration: number }) {
  const markScale = spring({ frame: Math.max(0, frame - 18), fps: 30, from: 0.88, to: 1, config: { damping: 16 } });
  return (
    <Scene frame={frame} duration={duration} dark>
      <Grain dark />
      <div
        style={{
          position: "absolute",
          inset: 56,
          border: `2px solid ${COLORS.parchment}`,
          borderRadius: 16,
          opacity: clamp(frame, [0, 24], [0, 1]),
        }}
      />
      <div style={{ position: "absolute", top: 82, left: 84 }}>
        <Label dark>for recruitment agencies</Label>
      </div>
      <div
        style={{
          position: "absolute",
          left: 84,
          top: 160,
          width: 780,
          opacity: clamp(frame, [8, 32], [0, 1]),
          transform: `translateY(${clamp(frame, [8, 32], [38, 0])}px)`,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: FONT.display,
            fontSize: 91,
            lineHeight: 0.94,
            fontWeight: 400,
            letterSpacing: "-1.7px",
          }}
        >
          Move first-round interviews to AI.
        </h2>
        <p
          style={{
            width: 690,
            margin: "28px 0 0",
            color: COLORS.pewter,
            fontSize: 31,
            lineHeight: 1.16,
            letterSpacing: "-0.45px",
          }}
        >
          Save cost, protect recruiter time, and shortlist the strongest candidates for every client.
        </p>
      </div>
      <div
        style={{
          position: "absolute",
          right: 88,
          top: 150,
          width: 210,
          height: 210,
          borderRadius: 96,
          background: COLORS.parchment,
          color: COLORS.onyx,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT.display,
          fontSize: 104,
          transform: `scale(${markScale})`,
          opacity: clamp(frame, [20, 42], [0, 1]),
        }}
      >
        Z
      </div>
      <div
        style={{
          position: "absolute",
          left: 84,
          bottom: 88,
          right: 84,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: clamp(frame, [72, 102], [0, 1]),
        }}
      >
        <div
          style={{
            border: `2px solid ${COLORS.parchment}`,
            borderRadius: 96,
            padding: "17px 32px",
            fontSize: 28,
            lineHeight: 1,
            letterSpacing: "-0.35px",
          }}
        >
          Book a Zobo Jobs demo
        </div>
        <div style={{ fontSize: 34, fontFamily: FONT.serif, letterSpacing: "-0.35px" }}>zobojobs.com</div>
      </div>
      <AbsoluteFill
        style={{
          background: COLORS.onyx,
          opacity: clamp(frame, [duration - 20, duration], [0, 1]),
        }}
      />
    </Scene>
  );
}

export function ZoboMarketingVideo() {
  const globalFrame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scenes = [
    HookScene,
    InterviewLayerScene,
    SavingsScene,
    EvidenceScene,
    CtaScene,
  ];

  return (
    <AbsoluteFill style={{ background: COLORS.parchment }}>
      {scenes.map((SceneComponent, index) => {
        const start = SCENE_STARTS[index];
        const duration = MARKETING_SCENE_FRAMES[index];
        const localFrame = globalFrame - start;
        return (
          <Sequence key={start} from={start} durationInFrames={duration}>
            <SceneComponent frame={localFrame} duration={duration} />
          </Sequence>
        );
      })}
      <div
        style={{
          position: "absolute",
          right: 28,
          bottom: 22,
          color: globalFrame > SCENE_STARTS[4] ? COLORS.parchment : COLORS.steel,
          fontFamily: FONT.sans,
          fontSize: 16,
          letterSpacing: "-0.2px",
          opacity: clamp(globalFrame, [fps, fps + 12], [0, 0.62]),
        }}
      >
        Zobo Jobs / AI interviews for recruitment agencies
      </div>
    </AbsoluteFill>
  );
}
