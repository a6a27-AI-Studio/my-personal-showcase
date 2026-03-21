import { useEffect, useMemo, useState } from "react";
import { List, Sparkles, Stars } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/seo/Seo";
import { useDataClient } from "@/contexts/DataClientContext";
import type { Skill } from "@/types";

const CATEGORY_LABELS: Record<Skill["category"], string> = {
  frontend: "Frontend Systems",
  backend: "Backend Systems",
  database: "Data Layer",
  devops: "Platform Ops",
  tools: "Delivery Tools",
  other: "Other Signals",
};

const CATEGORY_ORDER: Skill["category"][] = [
  "frontend",
  "backend",
  "database",
  "devops",
  "tools",
  "other",
];

const FEATURED_SKILLS = [
  "React",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "Docker",
  "AWS",
];

const PROFICIENCY_LABELS = [
  "Emerging",
  "Working",
  "Strong",
  "Advanced",
  "Expert",
];

const PAGE_ANIMATIONS = `
  @keyframes cosmic-breathe {
    0%, 100% { opacity: 0.72; transform: translate(-50%, -50%) scale(0.98); }
    50% { opacity: 1; transform: translate(-50%, -50%) scale(1.02); }
  }

  @keyframes halo-wave {
    0%, 100% { opacity: 0.18; transform: translate(-50%, -50%) scale(0.92); }
    50% { opacity: 0.42; transform: translate(-50%, -50%) scale(1.04); }
  }

  @keyframes nebula-drift-a {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
    50% { transform: translate3d(2.5%, -2%, 0) scale(1.04); }
  }

  @keyframes nebula-drift-b {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
    50% { transform: translate3d(-2.5%, 1.5%, 0) scale(1.06); }
  }

  @keyframes scan-sweep {
    0% { transform: translate3d(-18%, 0, 0) rotate(12deg); opacity: 0; }
    15% { opacity: 0.22; }
    60% { opacity: 0.08; }
    100% { transform: translate3d(140%, 0, 0) rotate(12deg); opacity: 0; }
  }
`;

type DisplayMode = "starfield" | "traditional";

type CategoryStyle = {
  badge: string;
  chip: string;
  meter: string;
  glow: string;
  halo: string;
  line: string;
  dot: string;
};

const CATEGORY_STYLES: Record<Skill["category"], CategoryStyle> = {
  frontend: {
    badge: "border-cyan-400/25 bg-cyan-400/12 text-cyan-100",
    chip: "border-cyan-400/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/18",
    meter: "from-cyan-200 via-sky-300 to-cyan-500",
    glow: "rgba(103, 232, 249, 0.88)",
    halo: "rgba(34, 211, 238, 0.28)",
    line: "rgba(103, 232, 249, 0.42)",
    dot: "bg-cyan-300",
  },
  backend: {
    badge: "border-emerald-400/25 bg-emerald-400/12 text-emerald-100",
    chip: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/18",
    meter: "from-emerald-200 via-teal-300 to-emerald-500",
    glow: "rgba(110, 231, 183, 0.86)",
    halo: "rgba(16, 185, 129, 0.24)",
    line: "rgba(110, 231, 183, 0.38)",
    dot: "bg-emerald-300",
  },
  database: {
    badge: "border-amber-400/25 bg-amber-400/12 text-amber-100",
    chip: "border-amber-400/20 bg-amber-400/10 text-amber-100 hover:bg-amber-400/18",
    meter: "from-amber-200 via-yellow-300 to-orange-500",
    glow: "rgba(251, 191, 36, 0.86)",
    halo: "rgba(245, 158, 11, 0.22)",
    line: "rgba(251, 191, 36, 0.34)",
    dot: "bg-amber-300",
  },
  devops: {
    badge: "border-violet-400/25 bg-violet-400/12 text-violet-100",
    chip: "border-violet-400/20 bg-violet-400/10 text-violet-100 hover:bg-violet-400/18",
    meter: "from-violet-200 via-fuchsia-300 to-violet-500",
    glow: "rgba(196, 181, 253, 0.9)",
    halo: "rgba(139, 92, 246, 0.24)",
    line: "rgba(196, 181, 253, 0.36)",
    dot: "bg-violet-300",
  },
  tools: {
    badge: "border-rose-400/25 bg-rose-400/12 text-rose-100",
    chip: "border-rose-400/20 bg-rose-400/10 text-rose-100 hover:bg-rose-400/18",
    meter: "from-rose-200 via-pink-300 to-rose-500",
    glow: "rgba(251, 113, 133, 0.84)",
    halo: "rgba(244, 63, 94, 0.22)",
    line: "rgba(251, 113, 133, 0.34)",
    dot: "bg-rose-300",
  },
  other: {
    badge: "border-slate-300/20 bg-slate-200/10 text-slate-100",
    chip: "border-slate-300/20 bg-slate-200/10 text-slate-100 hover:bg-slate-200/16",
    meter: "from-slate-200 via-slate-300 to-slate-500",
    glow: "rgba(226, 232, 240, 0.84)",
    halo: "rgba(148, 163, 184, 0.2)",
    line: "rgba(226, 232, 240, 0.28)",
    dot: "bg-slate-200",
  },
};

type StarPlacement = {
  skill: Skill;
  left: number;
  top: number;
  scale: number;
  pulseDuration: number;
  pulseDelay: number;
  orbitIndex: number;
  labelSide: "left" | "right";
  featured: boolean;
};

function fallbackSkillDescription(skill: Skill) {
  const tags = skill.tags.slice(0, 3).join(", ");
  const category = CATEGORY_LABELS[skill.category];
  return `${category} capability with a ${skill.level}/5 proficiency rating${tags ? ` across ${tags}` : ""}.`;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();

    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

function hashString(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function prioritizeSkills(skills: Skill[]) {
  return [...skills].sort((a, b) => {
    const aFeatured = FEATURED_SKILLS.includes(a.name) ? 1 : 0;
    const bFeatured = FEATURED_SKILLS.includes(b.name) ? 1 : 0;

    if (aFeatured !== bFeatured) return bFeatured - aFeatured;
    if (a.level !== b.level) return b.level - a.level;
    return a.sortOrder - b.sortOrder;
  });
}

function sortTagsByFrequency(skills: Skill[]) {
  const counts = new Map<string, number>();

  skills.forEach((skill) => {
    skill.tags.forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });

  return [...counts.entries()]
    .sort((a, b) => {
      if (a[1] !== b[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    })
    .map(([tag]) => tag);
}

function buildPlacements(skills: Skill[]) {
  const ordered = prioritizeSkills(skills);
  const random = seededRandom(hashString(ordered.map((skill) => skill.id).join("|")));
  const ringCapacities = [3, 6, 10, 14];
  const ringRadii = [
    { x: 18, y: 14 },
    { x: 29, y: 22 },
    { x: 39, y: 30 },
    { x: 46, y: 35 },
  ];
  const placements: StarPlacement[] = [];

  let skillIndex = 0;
  let ringIndex = 0;

  while (skillIndex < ordered.length) {
    const capacity =
      ringCapacities[ringIndex] ??
      ringCapacities[ringCapacities.length - 1] + (ringIndex - ringCapacities.length + 1) * 4;
    const radius =
      ringRadii[ringIndex] ??
      ringRadii[ringRadii.length - 1];
    const count = Math.min(capacity, ordered.length - skillIndex);
    const angleOffset = random() * Math.PI * 2;

    for (let slot = 0; slot < count; slot += 1) {
      const skill = ordered[skillIndex];
      const angle = angleOffset + (slot / count) * Math.PI * 2;
      const jitterX = (random() - 0.5) * 4.2;
      const jitterY = (random() - 0.5) * 3.4;
      const left = Math.min(
        90,
        Math.max(10, 50 + Math.cos(angle) * radius.x + jitterX),
      );
      const top = Math.min(
        88,
        Math.max(12, 50 + Math.sin(angle) * radius.y + jitterY),
      );
      const featured = FEATURED_SKILLS.includes(skill.name);

      placements.push({
        skill,
        left,
        top,
        scale: featured ? 1.05 + skill.level * 0.06 : 0.82 + skill.level * 0.07,
        pulseDuration: featured ? 5 + random() * 2.4 : 6.8 + random() * 3.2,
        pulseDelay: random() * 2.8,
        orbitIndex: ringIndex,
        labelSide: left < 50 ? "right" : "left",
        featured,
      });

      skillIndex += 1;
    }

    ringIndex += 1;
  }

  return placements;
}

function buildConnections(placements: StarPlacement[]) {
  return placements
    .map((placement, index) => {
      if (index === 0) return null;

      const previous = placements.slice(0, index);
      const anchor = previous.reduce((closest, candidate) => {
        const closestDistance = Math.hypot(
          closest.left - placement.left,
          closest.top - placement.top,
        );
        const candidateDistance = Math.hypot(
          candidate.left - placement.left,
          candidate.top - placement.top,
        );

        return candidateDistance < closestDistance ? candidate : closest;
      }, previous[0]);

      return {
        from: anchor,
        to: placement,
      };
    })
    .filter(
      (
        connection,
      ): connection is { from: StarPlacement; to: StarPlacement } =>
        connection !== null,
    );
}

function getLevelLabel(level: number) {
  return PROFICIENCY_LABELS[Math.max(0, Math.min(PROFICIENCY_LABELS.length - 1, level - 1))];
}

function MetricCard({
  label,
  value,
  accent = "text-cyan-100",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4 shadow-[0_12px_40px_rgba(2,6,23,0.18)] backdrop-blur-xl">
      <div className="text-[0.65rem] uppercase tracking-[0.28em] text-slate-400">
        {label}
      </div>
      <div className={`mt-3 text-2xl font-semibold ${accent}`}>{value}</div>
    </div>
  );
}

function SkillLevelMeter({
  skill,
  compact = false,
}: {
  skill: Skill;
  compact?: boolean;
}) {
  const theme = CATEGORY_STYLES[skill.category];
  const width = `${Math.max(20, Math.min(100, skill.level * 20))}%`;

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="flex items-center justify-between text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">
        <span>Proficiency</span>
        <span className="text-slate-200">{getLevelLabel(skill.level)}</span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${theme.meter}`}
          style={{ width }}
        />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={`h-2.5 flex-1 rounded-full ${
              index < skill.level ? theme.dot : "bg-white/8"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

interface CosmicStarfieldProps {
  skills: Skill[];
  activeSkillId: string | null;
  selectedSkillId: string | null;
  reducedMotion: boolean;
  onPreviewSkill: (skillId: string | null) => void;
  onSelectSkill: (skillId: string) => void;
}

function CosmicStarfield({
  skills,
  activeSkillId,
  selectedSkillId,
  reducedMotion,
  onPreviewSkill,
  onSelectSkill,
}: CosmicStarfieldProps) {
  const placements = useMemo(() => buildPlacements(skills), [skills]);
  const connections = useMemo(() => buildConnections(placements), [placements]);
  const featuredCount = skills.filter((skill) => FEATURED_SKILLS.includes(skill.name)).length;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#020617] shadow-[0_32px_120px_rgba(2,6,23,0.6)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(56,189,248,0.14),transparent_26%),radial-gradient(circle_at_78%_14%,rgba(129,140,248,0.18),transparent_22%),radial-gradient(circle_at_56%_74%,rgba(244,114,182,0.12),transparent_18%),linear-gradient(180deg,#020617_0%,#040816_44%,#020617_100%)]" />
      <div
        className="absolute inset-[-8%] opacity-80 blur-3xl"
        style={{
          animation: reducedMotion
            ? undefined
            : "nebula-drift-a 30s ease-in-out infinite",
        }}
      >
        <div className="absolute left-[8%] top-[14%] h-56 w-56 rounded-full bg-cyan-400/10" />
        <div className="absolute right-[10%] top-[8%] h-72 w-72 rounded-full bg-violet-400/12" />
        <div className="absolute bottom-[12%] left-[38%] h-80 w-80 rounded-full bg-fuchsia-500/10" />
      </div>
      <div
        className="absolute inset-[-10%] opacity-60 blur-[120px]"
        style={{
          animation: reducedMotion
            ? undefined
            : "nebula-drift-b 34s ease-in-out infinite",
        }}
      >
        <div className="absolute left-[28%] top-[18%] h-[22rem] w-[22rem] rounded-full bg-sky-300/10" />
        <div className="absolute right-[18%] bottom-[12%] h-[18rem] w-[18rem] rounded-full bg-indigo-400/10" />
      </div>
      <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(circle,rgba(255,255,255,0.9)_0.65px,transparent_0.75px)] [background-size:32px_32px]" />
      <div className="absolute inset-0 opacity-12 [background-image:radial-gradient(circle,rgba(165,243,252,0.9)_0.8px,transparent_0.9px)] [background-size:72px_72px]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_24%,transparent_68%,rgba(0,0,0,0.2))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_18%),radial-gradient(circle_at_center,rgba(56,189,248,0.1),transparent_42%)]" />

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <ellipse
          cx="50"
          cy="50"
          rx="18"
          ry="14"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="0.18"
        />
        <ellipse
          cx="50"
          cy="50"
          rx="29"
          ry="22"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.16"
        />
        <ellipse
          cx="50"
          cy="50"
          rx="39"
          ry="30"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="0.16"
        />
        <ellipse
          cx="50"
          cy="50"
          rx="46"
          ry="35"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="0.15"
        />
        {connections.map((connection) => {
          const theme = CATEGORY_STYLES[connection.to.skill.category];

          return (
            <line
              key={`${connection.from.skill.id}-${connection.to.skill.id}`}
              x1={connection.from.left}
              y1={connection.from.top}
              x2={connection.to.left}
              y2={connection.to.top}
              stroke={theme.line}
              strokeWidth="0.18"
              strokeDasharray="1.4 1.8"
            />
          );
        })}
      </svg>

      <div className="relative min-h-[430px] px-4 py-5 sm:min-h-[520px] sm:px-6 sm:py-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[0.68rem] uppercase tracking-[0.34em] text-cyan-200/70">
              Constellation viewport
            </div>
            <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
              Product-grade skill atlas
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/55 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-300 backdrop-blur-xl">
            <span>{skills.length} mapped</span>
            <span className="text-slate-600">/</span>
            <span>{featuredCount} anchor stars</span>
          </div>
        </div>

        <div
          className="absolute left-[-18%] top-[8%] h-[1px] w-[38%] bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent blur-[1px]"
          style={{
            animation: reducedMotion ? undefined : "scan-sweep 18s linear infinite",
          }}
        />

        <div className="absolute inset-x-0 top-0 h-full">
          {placements.map((placement) => {
            const theme = CATEGORY_STYLES[placement.skill.category];
            const isActive = activeSkillId === placement.skill.id;
            const isPinned = selectedSkillId === placement.skill.id;
            const labelClasses =
              isActive || isPinned
                ? "inline-flex opacity-100"
                : placement.featured
                  ? "hidden lg:inline-flex opacity-80"
                  : "hidden";
            const coreSize = (6 + placement.skill.level * 2.4) * placement.scale;
            const haloSize =
              (38 + placement.skill.level * 7 + placement.orbitIndex * 4) *
              placement.scale;
            const flareSize = (24 + placement.skill.level * 7) * placement.scale;

            return (
              <button
                key={placement.skill.id}
                type="button"
                className="group absolute h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full outline-none transition-transform duration-300 hover:scale-[1.03] focus-visible:scale-[1.03]"
                style={{
                  left: `${placement.left}%`,
                  top: `${placement.top}%`,
                  zIndex: isActive || isPinned ? 30 : 10 + placement.orbitIndex,
                }}
                onMouseEnter={() => onPreviewSkill(placement.skill.id)}
                onMouseLeave={() => onPreviewSkill(null)}
                onFocus={() => onPreviewSkill(placement.skill.id)}
                onBlur={() => onPreviewSkill(null)}
                onClick={() => onSelectSkill(placement.skill.id)}
                aria-label={`${placement.skill.name}, proficiency ${placement.skill.level} out of 5`}
              >
                <span
                  className="pointer-events-none absolute left-1/2 top-1/2 rounded-full blur-2xl"
                  style={{
                    width: `${haloSize}px`,
                    height: `${haloSize}px`,
                    transform: "translate(-50%, -50%)",
                    background: `radial-gradient(circle, ${theme.halo} 0%, transparent 72%)`,
                  }}
                />
                <span
                  className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border"
                  style={{
                    width: `${haloSize}px`,
                    height: `${haloSize}px`,
                    transform: "translate(-50%, -50%)",
                    borderColor:
                      isActive || isPinned ? theme.line : "rgba(255,255,255,0.1)",
                    boxShadow:
                      isActive || isPinned
                        ? `0 0 28px ${theme.halo}`
                        : undefined,
                    animation: reducedMotion
                      ? undefined
                      : `halo-wave ${placement.pulseDuration + 2}s ease-in-out ${placement.pulseDelay}s infinite`,
                  }}
                />
                <span
                  className="pointer-events-none absolute left-1/2 top-1/2 h-px rounded-full bg-white/35 blur-[1px]"
                  style={{
                    width: `${flareSize}px`,
                    transform: "translate(-50%, -50%)",
                    opacity: placement.featured ? 0.62 : 0.32,
                  }}
                />
                <span
                  className="pointer-events-none absolute left-1/2 top-1/2 w-px rounded-full bg-white/35 blur-[1px]"
                  style={{
                    height: `${flareSize}px`,
                    transform: "translate(-50%, -50%)",
                    opacity: placement.featured ? 0.58 : 0.28,
                  }}
                />
                <span
                  className="pointer-events-none absolute left-1/2 top-1/2 rounded-full"
                  style={{
                    width: `${coreSize}px`,
                    height: `${coreSize}px`,
                    transform: "translate(-50%, -50%)",
                    background: "#f8fcff",
                    boxShadow: `0 0 18px ${theme.glow}, 0 0 46px ${theme.halo}`,
                    opacity: placement.featured ? 1 : 0.92,
                    animation: reducedMotion
                      ? undefined
                      : `cosmic-breathe ${placement.pulseDuration}s ease-in-out ${placement.pulseDelay}s infinite`,
                  }}
                />
                <span
                  className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border border-white/20"
                  style={{
                    width: `${(14 + placement.skill.level * 3) * placement.scale}px`,
                    height: `${(14 + placement.skill.level * 3) * placement.scale}px`,
                    transform: "translate(-50%, -50%)",
                    opacity: 0.22,
                  }}
                />
                <span
                  className={`pointer-events-none absolute top-1/2 rounded-full border border-white/10 bg-slate-950/78 px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-slate-100 shadow-[0_18px_40px_rgba(2,6,23,0.45)] backdrop-blur-xl transition-all duration-300 ${labelClasses}`}
                  style={
                    placement.labelSide === "right"
                      ? { left: "calc(100% + 0.8rem)", transform: "translateY(-50%)" }
                      : { right: "calc(100% + 0.8rem)", transform: "translateY(-50%)" }
                  }
                >
                  {placement.skill.name}
                </span>
                {isPinned && (
                  <span className="pointer-events-none absolute -right-1 top-0 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/15 px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.2em] text-cyan-100">
                    pinned
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="absolute inset-x-4 bottom-4 rounded-[1.5rem] border border-white/10 bg-slate-950/55 px-4 py-4 text-sm text-slate-300 shadow-[0_20px_50px_rgba(2,6,23,0.4)] backdrop-blur-2xl sm:inset-x-6">
          <div className="flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">
            <span>Signal guidance</span>
            <span className="text-slate-600">/</span>
            <span>Hover to preview</span>
            <span className="text-slate-600">/</span>
            <span>Click to pin</span>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            The atlas is intentionally calmer now: fewer always-on labels,
            softer breathing motion, and clearer orbital structure so the page
            feels like a real product surface instead of a demo animation.
          </p>
        </div>
      </div>
    </div>
  );
}

function QuickAccessStrip({
  skills,
  activeSkillId,
  onSelectSkill,
}: {
  skills: Skill[];
  activeSkillId: string | null;
  onSelectSkill: (skillId: string) => void;
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4 shadow-[0_18px_50px_rgba(2,6,23,0.22)] backdrop-blur-xl lg:hidden">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[0.68rem] uppercase tracking-[0.3em] text-cyan-200/70">
            Quick access
          </div>
          <h3 className="mt-2 text-lg font-semibold text-white">
            Mobile-friendly signal strip
          </h3>
        </div>
        <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs text-slate-300">
          Tap a card
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {skills.map((skill) => {
          const theme = CATEGORY_STYLES[skill.category];
          const isActive = activeSkillId === skill.id;

          return (
            <button
              key={skill.id}
              type="button"
              onClick={() => onSelectSkill(skill.id)}
              className={`w-[220px] flex-none rounded-[1.4rem] border px-4 py-4 text-left transition-all duration-300 ${
                isActive
                  ? "border-cyan-300/35 bg-cyan-300/10 shadow-[0_20px_50px_rgba(34,211,238,0.16)]"
                  : "border-white/10 bg-slate-950/55"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">{skill.name}</div>
                  <div className="mt-1 text-xs text-slate-400">
                    {CATEGORY_LABELS[skill.category]}
                  </div>
                </div>
                <Badge className={theme.badge}>{skill.level}/5</Badge>
              </div>

              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-300">
                {skill.description || fallbackSkillDescription(skill)}
              </p>

              <div className="mt-4">
                <SkillLevelMeter skill={skill} compact />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TraditionalSkillsView({
  skills,
  activeSkillId,
  selectedSkillId,
  onPreviewSkill,
  onSelectSkill,
}: {
  skills: Skill[];
  activeSkillId: string | null;
  selectedSkillId: string | null;
  onPreviewSkill: (skillId: string | null) => void;
  onSelectSkill: (skillId: string) => void;
}) {
  const groupedSkills = CATEGORY_ORDER.reduce(
    (result, category) => {
      const categorySkills = skills.filter((skill) => skill.category === category);

      if (categorySkills.length > 0) {
        result[category] = prioritizeSkills(categorySkills);
      }

      return result;
    },
    {} as Record<Skill["category"], Skill[]>,
  );

  return (
    <div className="space-y-8">
      {Object.entries(groupedSkills).map(([category, categorySkills]) => {
        const typedCategory = category as Skill["category"];
        const theme = CATEGORY_STYLES[typedCategory];

        return (
          <section
            key={category}
            className="rounded-[1.8rem] border border-white/10 bg-white/5 p-4 shadow-[0_18px_50px_rgba(2,6,23,0.22)] backdrop-blur-xl sm:p-5"
          >
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <div className="text-[0.68rem] uppercase tracking-[0.3em] text-cyan-200/70">
                  Structured matrix
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {CATEGORY_LABELS[typedCategory]}
                </h2>
              </div>
              <Badge className={theme.badge}>{categorySkills.length} signals</Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {categorySkills.map((skill) => {
                const isActive = activeSkillId === skill.id;
                const isPinned = selectedSkillId === skill.id;
                const skillTheme = CATEGORY_STYLES[skill.category];

                return (
                  <button
                    key={skill.id}
                    type="button"
                    className={`relative overflow-hidden rounded-[1.45rem] border px-5 py-5 text-left transition-all duration-300 ${
                      isActive
                        ? "border-cyan-300/30 bg-slate-950/72 shadow-[0_24px_60px_rgba(34,211,238,0.12)]"
                        : "border-white/10 bg-slate-950/55 hover:border-white/20 hover:bg-slate-950/72"
                    }`}
                    onMouseEnter={() => onPreviewSkill(skill.id)}
                    onMouseLeave={() => onPreviewSkill(null)}
                    onFocus={() => onPreviewSkill(skill.id)}
                    onBlur={() => onPreviewSkill(null)}
                    onClick={() => onSelectSkill(skill.id)}
                  >
                    <div
                      className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${skillTheme.meter}`}
                    />
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-lg font-semibold text-white">
                          {skill.name}
                        </div>
                        <div className="mt-1 text-sm text-slate-400">
                          {CATEGORY_LABELS[skill.category]}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={skillTheme.badge}>{skill.level}/5</Badge>
                        {isPinned && (
                          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/12 px-2 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-cyan-100">
                            pinned
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-slate-300">
                      {skill.description || fallbackSkillDescription(skill)}
                    </p>

                    <div className="mt-5">
                      <SkillLevelMeter skill={skill} compact />
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {skill.tags.map((tag) => (
                        <Badge key={tag} className={skillTheme.chip}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function SkillInsightPanel({
  activeSkill,
  selectedSkillId,
  filteredSkills,
  displayMode,
}: {
  activeSkill: Skill | null;
  selectedSkillId: string | null;
  filteredSkills: Skill[];
  displayMode: DisplayMode;
}) {
  if (!activeSkill) {
    return null;
  }

  const theme = CATEGORY_STYLES[activeSkill.category];
  const stateLabel =
    selectedSkillId === activeSkill.id
      ? "Pinned signal"
      : FEATURED_SKILLS.includes(activeSkill.name)
        ? "Featured signal"
        : "Live signal";

  return (
    <aside className="rounded-[1.9rem] border border-white/10 bg-slate-950/55 p-5 text-slate-100 shadow-[0_28px_80px_rgba(2,6,23,0.45)] backdrop-blur-2xl lg:sticky lg:top-24 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[0.68rem] uppercase tracking-[0.3em] text-cyan-200/70">
            Mission control
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            {activeSkill.name}
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            {activeSkill.description || fallbackSkillDescription(activeSkill)}
          </p>
        </div>
        <Badge className={theme.badge}>{stateLabel}</Badge>
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
        <SkillLevelMeter skill={activeSkill} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
          <div className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">
            Domain
          </div>
          <div className="mt-3 text-sm font-medium text-white">
            {CATEGORY_LABELS[activeSkill.category]}
          </div>
        </div>
        <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
          <div className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">
            View mode
          </div>
          <div className="mt-3 text-sm font-medium text-white">
            {displayMode === "starfield" ? "Constellation" : "Matrix"}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">
            Stack markers
          </div>
          <span className="text-xs text-slate-400">{activeSkill.tags.length} tags</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {activeSkill.tags.map((tag) => (
            <Badge key={tag} className={theme.chip}>
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/8 to-white/[0.03] p-4">
        <div className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">
          Atlas summary
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <div className="text-2xl font-semibold text-cyan-100">
              {filteredSkills.length}
            </div>
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Signals in view
            </div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-violet-100">
              {new Set(filteredSkills.map((skill) => skill.category)).size}
            </div>
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Active domains
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function SkillsPage() {
  const dataClient = useDataClient();
  const reducedMotion = useReducedMotion();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    Skill["category"] | null
  >(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("starfield");
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [previewSkillId, setPreviewSkillId] = useState<string | null>(null);

  useEffect(() => {
    setPageError(null);
    setIsLoading(true);

    dataClient
      .listSkills()
      .then((data) => setSkills(data))
      .catch((error) => {
        console.error("Failed to load skills:", error);
        setPageError("Unable to load the skill atlas right now.");
      })
      .finally(() => setIsLoading(false));
  }, [dataClient]);

  const allTags = useMemo(() => sortTagsByFrequency(skills), [skills]);

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      const matchesCategory = selectedCategory
        ? skill.category === selectedCategory
        : true;
      const matchesTag = selectedTag ? skill.tags.includes(selectedTag) : true;
      return matchesCategory && matchesTag;
    });
  }, [selectedCategory, selectedTag, skills]);

  const orderedFilteredSkills = useMemo(
    () => prioritizeSkills(filteredSkills),
    [filteredSkills],
  );

  useEffect(() => {
    if (
      selectedSkillId &&
      !orderedFilteredSkills.some((skill) => skill.id === selectedSkillId)
    ) {
      setSelectedSkillId(null);
    }

    if (
      previewSkillId &&
      !orderedFilteredSkills.some((skill) => skill.id === previewSkillId)
    ) {
      setPreviewSkillId(null);
    }
  }, [orderedFilteredSkills, previewSkillId, selectedSkillId]);

  const activeSkill = useMemo(() => {
    return (
      orderedFilteredSkills.find((skill) => skill.id === selectedSkillId) ||
      orderedFilteredSkills.find((skill) => skill.id === previewSkillId) ||
      orderedFilteredSkills[0] ||
      null
    );
  }, [orderedFilteredSkills, previewSkillId, selectedSkillId]);

  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Skill Atlas",
      itemListElement: orderedFilteredSkills.map((skill, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: skill.name,
        description: skill.description || fallbackSkillDescription(skill),
      })),
    }),
    [orderedFilteredSkills],
  );

  const activeFilterCount =
    Number(Boolean(selectedCategory)) + Number(Boolean(selectedTag));
  const featuredCount = orderedFilteredSkills.filter((skill) =>
    FEATURED_SKILLS.includes(skill.name),
  ).length;
  const domainCount = new Set(orderedFilteredSkills.map((skill) => skill.category))
    .size;

  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedTag(null);
    setSelectedSkillId(null);
    setPreviewSkillId(null);
  };

  const handleSelectSkill = (skillId: string) => {
    setSelectedSkillId((current) => (current === skillId ? null : skillId));
    setPreviewSkillId(skillId);
  };

  if (isLoading) {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading skill atlas...
        </div>
      </div>
    );
  }

  return (
    <>
      <Seo
        title="Skills | a6a27 showcase"
        description="Explore a commercial-grade constellation view of engineering capabilities, from frontend systems to infrastructure."
        path="/skills"
        structuredData={structuredData}
      />

      <div className="container-page">
        <style>{PAGE_ANIMATIONS}</style>

        {pageError && (
          <div className="mb-6 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {pageError}
          </div>
        )}

        <section className="relative overflow-hidden rounded-[2.35rem] border border-white/10 bg-[#020617] px-4 py-5 shadow-[0_40px_140px_rgba(2,6,23,0.65)] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_24%),radial-gradient(circle_at_82%_14%,rgba(168,85,247,0.18),transparent_20%),radial-gradient(circle_at_26%_78%,rgba(251,191,36,0.08),transparent_18%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_18%,transparent_76%,rgba(0,0,0,0.2))]" />

          <div className="relative space-y-6 lg:space-y-8">
            <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
              <div className="max-w-3xl">
                <div className="mb-3 text-[0.68rem] uppercase tracking-[0.36em] text-cyan-200/75">
                  Skill atlas
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
                  <Sparkles className="h-4 w-4" />
                  Immersive constellation interface
                </div>
                <h1 className="mt-5 text-white">
                  Engineering capability, mapped like a night sky.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                  This page now behaves like a polished product surface: calmer
                  motion, clearer orbital composition, stronger information
                  hierarchy, and a mobile flow that stays elegant instead of
                  collapsing into stacked chips.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MetricCard label="Signals in view" value={String(filteredSkills.length)} />
                <MetricCard
                  label="Featured stars"
                  value={String(featuredCount)}
                  accent="text-violet-100"
                />
                <MetricCard
                  label="Active domains"
                  value={String(domainCount)}
                  accent="text-emerald-100"
                />
                <MetricCard
                  label="Live filters"
                  value={String(activeFilterCount)}
                  accent="text-amber-100"
                />
              </div>
            </header>

            <section className="rounded-[1.85rem] border border-white/10 bg-white/5 p-4 shadow-[0_18px_50px_rgba(2,6,23,0.22)] backdrop-blur-xl sm:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.3em] text-cyan-200/70">
                    Command deck
                  </div>
                  <h2 className="mt-2 text-xl font-semibold text-white">
                    Filter the constellation without losing the atmosphere
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-full border border-white/10 bg-slate-950/65 p-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setDisplayMode("starfield")}
                      className={
                        displayMode === "starfield"
                          ? "rounded-full bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                          : "rounded-full text-slate-200 hover:bg-white/10"
                      }
                    >
                      <Stars className="h-4 w-4" />
                      Constellation
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setDisplayMode("traditional")}
                      className={
                        displayMode === "traditional"
                          ? "rounded-full bg-violet-300 text-slate-950 hover:bg-violet-200"
                          : "rounded-full text-slate-200 hover:bg-white/10"
                      }
                    >
                      <List className="h-4 w-4" />
                      Matrix
                    </Button>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={resetFilters}
                    className="rounded-full border-white/10 bg-slate-950/55 text-slate-100 hover:bg-white/10"
                  >
                    Reset view
                  </Button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">
                      Domains
                    </span>
                    <span className="text-xs text-slate-400">
                      {selectedCategory
                        ? CATEGORY_LABELS[selectedCategory]
                        : "All domains"}
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedCategory(null)}
                      className={`flex-none rounded-full ${
                        selectedCategory === null
                          ? "bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                          : "border border-white/10 bg-slate-950/55 text-slate-200 hover:bg-white/10"
                      }`}
                    >
                      All
                    </Button>
                    {CATEGORY_ORDER.map((category) => (
                      <Button
                        key={category}
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedCategory(category)}
                        className={`flex-none rounded-full ${
                          selectedCategory === category
                            ? "bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                            : "border border-white/10 bg-slate-950/55 text-slate-200 hover:bg-white/10"
                        }`}
                      >
                        {CATEGORY_LABELS[category]}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">
                      Tags
                    </span>
                    <span className="text-xs text-slate-400">
                      {selectedTag || "All tags"}
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedTag(null)}
                      className={`flex-none rounded-full ${
                        selectedTag === null
                          ? "bg-violet-300 text-slate-950 hover:bg-violet-200"
                          : "border border-white/10 bg-slate-950/55 text-slate-200 hover:bg-white/10"
                      }`}
                    >
                      All
                    </Button>
                    {allTags.map((tag) => (
                      <Button
                        key={tag}
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedTag(tag)}
                        className={`flex-none rounded-full ${
                          selectedTag === tag
                            ? "bg-violet-300 text-slate-950 hover:bg-violet-200"
                            : "border border-white/10 bg-slate-950/55 text-slate-200 hover:bg-white/10"
                        }`}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {selectedCategory && (
                  <Badge className={CATEGORY_STYLES[selectedCategory].badge}>
                    {CATEGORY_LABELS[selectedCategory]}
                  </Badge>
                )}
                {selectedTag && (
                  <Badge className="border-violet-400/25 bg-violet-400/12 text-violet-100">
                    {selectedTag}
                  </Badge>
                )}
                {!selectedCategory && !selectedTag && (
                  <Badge className="border-white/10 bg-white/5 text-slate-300">
                    No filters applied
                  </Badge>
                )}
              </div>
            </section>

            {filteredSkills.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/5 px-6 py-14 text-center shadow-[0_18px_50px_rgba(2,6,23,0.18)]">
                <h2 className="text-2xl font-semibold text-white">
                  No signals match the current filters.
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">
                  Reset the current category and tag filters to reopen the full
                  constellation and restore the complete mobile and desktop
                  experience.
                </p>
                <div className="mt-6">
                  <Button
                    type="button"
                    onClick={resetFilters}
                    className="bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                  >
                    Reset view
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_360px] lg:items-start">
                <div className="space-y-5">
                  {displayMode === "starfield" ? (
                    <CosmicStarfield
                      skills={orderedFilteredSkills}
                      activeSkillId={activeSkill?.id || null}
                      selectedSkillId={selectedSkillId}
                      reducedMotion={reducedMotion}
                      onPreviewSkill={setPreviewSkillId}
                      onSelectSkill={handleSelectSkill}
                    />
                  ) : (
                    <TraditionalSkillsView
                      skills={orderedFilteredSkills}
                      activeSkillId={activeSkill?.id || null}
                      selectedSkillId={selectedSkillId}
                      onPreviewSkill={setPreviewSkillId}
                      onSelectSkill={handleSelectSkill}
                    />
                  )}

                  {displayMode === "starfield" && (
                    <QuickAccessStrip
                      skills={orderedFilteredSkills}
                      activeSkillId={activeSkill?.id || null}
                      onSelectSkill={handleSelectSkill}
                    />
                  )}
                </div>

                <SkillInsightPanel
                  activeSkill={activeSkill}
                  selectedSkillId={selectedSkillId}
                  filteredSkills={orderedFilteredSkills}
                  displayMode={displayMode}
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
