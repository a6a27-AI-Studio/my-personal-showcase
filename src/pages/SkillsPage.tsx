import { useEffect, useMemo, useState } from "react";
import { List, Stars } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Seo } from "@/components/seo/Seo";
import { useDataClient } from "@/contexts/DataClientContext";
import type { Skill } from "@/types";

const CATEGORY_LABELS: Record<Skill["category"], string> = {
  frontend: "前端系統",
  backend: "後端系統",
  database: "資料庫",
  devops: "平台維運",
  tools: "工具與流程",
  other: "其他能力",
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
  "入門",
  "實務中",
  "熟練",
  "進階",
  "專家",
];

const STARFIELD_BATCH_SIZE = 10;
const STARFIELD_ROTATION_MS = 10000;

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
type LabelPlacement = "left" | "right" | "top" | "bottom";

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
  labelPlacement: LabelPlacement;
  featured: boolean;
};

function fallbackSkillDescription(skill: Skill) {
  const tags = skill.tags.slice(0, 3).join(", ");
  const category = CATEGORY_LABELS[skill.category];
  return `${category}相關能力，熟練度 ${skill.level}/5${tags ? `，涵蓋 ${tags}` : ""}。`;
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

function useHoverCapablePointer() {
  const [hoverCapable, setHoverCapable] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setHoverCapable(media.matches);
    update();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  return hoverCapable;
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

function buildPlacements(skills: Skill[], randomKey: number) {
  const ordered = prioritizeSkills(skills);
  const random = seededRandom(
    hashString(`${ordered.map((skill) => skill.id).join("|")}|${randomKey}`),
  );
  const ringCapacities = [3, 6, 10, 14];
  const ringRadii = [
    { x: 16, y: 12 },
    { x: 26, y: 18 },
    { x: 35, y: 24 },
    { x: 42, y: 28 },
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
      const jitterX = (random() - 0.5) * 3.2;
      const jitterY = (random() - 0.5) * 2.6;
      const left = Math.min(
        85,
        Math.max(15, 50 + Math.cos(angle) * radius.x + jitterX),
      );
      const top = Math.min(
        71,
        Math.max(18, 44 + Math.sin(angle) * radius.y + jitterY),
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
        labelPlacement: getLabelPlacement(left, top, ringIndex),
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

function getSignalStateLabel(skill: Skill, selectedSkillId: string | null) {
  if (selectedSkillId === skill.id) {
    return "已固定";
  }

  return FEATURED_SKILLS.includes(skill.name) ? "重點技能" : "目前焦點";
}

function truncateSkillName(name: string, maxChars = 5) {
  const characters = Array.from(name);
  if (characters.length <= maxChars) return name;
  return `${characters.slice(0, maxChars).join("")}...`;
}

function getLabelPlacement(left: number, top: number, orbitIndex: number): LabelPlacement {
  if (top <= 23) return "bottom";
  if (top >= 67) return "top";
  if (left <= 20) return "right";
  if (left >= 80) return "left";
  if (orbitIndex % 3 === 0) return top < 50 ? "bottom" : "top";
  return left < 50 ? "right" : "left";
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
        <span>熟練度</span>
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
  previewSkillId: string | null;
  selectedSkillId: string | null;
  reducedMotion: boolean;
  placementSeed: number;
  onPreviewSkill: (skillId: string | null) => void;
  onSelectSkill: (skillId: string) => void;
}

function CosmicStarfield({
  skills,
  activeSkillId,
  previewSkillId,
  selectedSkillId,
  reducedMotion,
  placementSeed,
  onPreviewSkill,
  onSelectSkill,
}: CosmicStarfieldProps) {
  const placements = useMemo(() => buildPlacements(skills, placementSeed), [placementSeed, skills]);
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

      <div className="relative min-h-[500px] px-5 py-6 lg:min-h-[560px] lg:px-6 lg:py-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[0.68rem] uppercase tracking-[0.34em] text-cyan-200/70">
              技能星圖
            </div>
            <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
              技能星圖
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/55 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-300 backdrop-blur-xl">
            <span>{skills.length} 項技能</span>
            <span className="text-slate-600">/</span>
            <span>{featuredCount} 項重點技能</span>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-28 top-24 sm:bottom-32 sm:top-28">
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

          <div
            className="absolute left-[-18%] top-[10%] h-[1px] w-[38%] bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent blur-[1px]"
            style={{
              animation: reducedMotion ? undefined : "scan-sweep 18s linear infinite",
            }}
          />

          <TooltipProvider delayDuration={90}>
            <div className="absolute inset-0">
              {placements.map((placement) => {
                const theme = CATEGORY_STYLES[placement.skill.category];
                const isPreviewed = previewSkillId === placement.skill.id;
                const isPinned = selectedSkillId === placement.skill.id;
                const isHighlighted = activeSkillId === placement.skill.id || isPinned;
                const labelText = truncateSkillName(placement.skill.name);
                const coreSize = (6 + placement.skill.level * 2.4) * placement.scale;
                const haloSize =
                  (38 + placement.skill.level * 7 + placement.orbitIndex * 4) *
                  placement.scale;
                const flareSize = (24 + placement.skill.level * 7) * placement.scale;

                return (
                  <Tooltip key={placement.skill.id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="group absolute h-[5.6rem] w-[5.9rem] -translate-x-1/2 -translate-y-1/2 rounded-[1.65rem] outline-none transition-transform duration-300 hover:scale-[1.04] focus-visible:scale-[1.04]"
                        style={{
                          left: `${placement.left}%`,
                          top: `${placement.top}%`,
                          zIndex: isPreviewed || isPinned ? 32 : 12 + placement.orbitIndex,
                        }}
                        onMouseEnter={() => onPreviewSkill(placement.skill.id)}
                        onMouseLeave={() => onPreviewSkill(null)}
                        onFocus={() => onPreviewSkill(placement.skill.id)}
                        onBlur={() => onPreviewSkill(null)}
                        onClick={() => onSelectSkill(placement.skill.id)}
                        aria-label={`${placement.skill.name}，熟練度 ${placement.skill.level} / 5`}
                        aria-pressed={isPinned}
                        title={placement.skill.name}
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
                              isHighlighted || isPreviewed
                                ? theme.line
                                : "rgba(255,255,255,0.1)",
                            boxShadow:
                              isHighlighted || isPreviewed
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
                          className={`pointer-events-none absolute bottom-0 left-1/2 inline-flex max-w-[4.8rem] -translate-x-1/2 items-center gap-1.5 overflow-hidden rounded-full border px-2.5 py-1 text-[0.64rem] font-semibold tracking-[0.08em] shadow-[0_18px_40px_rgba(2,6,23,0.45)] backdrop-blur-xl transition-all duration-300 ${
                            isHighlighted || isPreviewed
                              ? "border-cyan-300/32 bg-slate-950/95 text-white"
                              : placement.featured
                                ? "border-white/18 bg-slate-950/84 text-slate-100"
                                : "border-white/10 bg-slate-950/78 text-slate-200"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
                          <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                            {labelText}
                          </span>
                        </span>
                        {isPinned && (
                          <span className="pointer-events-none absolute left-1/2 top-0 inline-flex -translate-x-1/2 -translate-y-[75%] rounded-full border border-cyan-300/30 bg-cyan-300/15 px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.2em] text-cyan-100">
                            已固定
                          </span>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side={placement.labelPlacement}
                      className="border-white/10 bg-slate-950/95 px-3 py-2 text-xs text-slate-100 shadow-[0_18px_40px_rgba(2,6,23,0.45)]"
                    >
                      <div className="font-medium text-white">{placement.skill.name}</div>
                      <div className="mt-1 text-[0.68rem] uppercase tracking-[0.18em] text-slate-400">
                        {CATEGORY_LABELS[placement.skill.category]} / {getLevelLabel(placement.skill.level)}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        </div>

        <div className="absolute inset-x-4 bottom-4 rounded-[1.5rem] border border-white/10 bg-slate-950/55 px-4 py-4 text-sm text-slate-300 shadow-[0_20px_50px_rgba(2,6,23,0.4)] backdrop-blur-2xl sm:inset-x-6">
          <div className="flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">
            <span>查看方式</span>
            <span className="text-slate-600">/</span>
            <span>名稱常駐顯示</span>
            <span className="text-slate-600">/</span>
            <span>滑入顯示全名</span>
            <span className="text-slate-600">/</span>
            <span>10 秒切換下一批</span>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            每次顯示 10 項技能，10 秒切換下一批；滑入或點擊後會暫停輪播。
          </p>
        </div>
      </div>
    </div>
  );
}

function QuickAccessStrip({
  skills,
  activeSkillId,
  selectedSkillId,
  onSelectSkill,
  className = "",
}: {
  skills: Skill[];
  activeSkillId: string | null;
  selectedSkillId: string | null;
  onSelectSkill: (skillId: string) => void;
  className?: string;
}) {
  const activeSkill = skills.find((skill) => skill.id === activeSkillId) || null;
  const activeTheme = activeSkill ? CATEGORY_STYLES[activeSkill.category] : null;
  const stateLabel = activeSkill ? getSignalStateLabel(activeSkill, selectedSkillId) : null;

  return (
    <div
      className={`relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.9))] p-4 shadow-[0_18px_50px_rgba(2,6,23,0.22)] backdrop-blur-xl ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(129,140,248,0.18),transparent_24%)]" />

      <div className="relative mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-[0.68rem] uppercase tracking-[0.3em] text-cyan-200/70">
            手機版
          </div>
          <h3 className="mt-2 text-lg font-semibold text-white">
            滑動查看技能
          </h3>
          <p className="mt-2 max-w-[17rem] text-sm leading-6 text-slate-300">
            左右滑動切換技能，點擊後立即查看完整資訊。
          </p>
        </div>
        <div className="w-full rounded-[1.15rem] border border-white/10 bg-slate-950/65 px-3 py-2 text-left text-xs text-slate-300 sm:w-auto sm:text-right">
          <div className="uppercase tracking-[0.18em] text-slate-500">目前查看</div>
          <div className="mt-1 text-sm font-medium text-white">
            {activeSkill ? activeSkill.name : "請先選擇技能"}
          </div>
        </div>
      </div>

      <div className="relative mb-3 flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.22em] text-slate-400">
        <span>左右滑動查看更多</span>
        <span className="text-slate-600">/</span>
        <span>點擊更新詳情</span>
      </div>

      <div className="relative -mx-1 px-1">
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-6 bg-gradient-to-r from-[#020617] to-transparent" />
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-10 bg-gradient-to-l from-[#020617] via-[#020617]/90 to-transparent" />
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 pr-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {skills.map((skill) => {
            const theme = CATEGORY_STYLES[skill.category];
            const isActive = activeSkillId === skill.id;

            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => onSelectSkill(skill.id)}
                aria-pressed={isActive}
                className={`relative w-[min(84vw,20rem)] snap-start flex-none overflow-hidden rounded-[1.45rem] border px-4 py-4 text-left transition-all duration-300 ${
                  isActive
                    ? "border-cyan-300/35 bg-cyan-300/10 shadow-[0_20px_50px_rgba(34,211,238,0.16)]"
                    : "border-white/10 bg-slate-950/60 active:border-white/20"
                }`}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${theme.meter}`}
                />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{skill.name}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      {CATEGORY_LABELS[skill.category]}
                    </div>
                  </div>
                  <Badge className={theme.badge}>{skill.level}/5</Badge>
                </div>

                <p className="mt-3 line-clamp-2 min-h-[3rem] text-sm leading-6 text-slate-300">
                  {skill.description || fallbackSkillDescription(skill)}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {skill.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} className={theme.chip}>
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4">
                  <SkillLevelMeter skill={skill} compact />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {activeSkill && activeTheme && (
        <div className="relative mt-4 overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/72 p-4 shadow-[0_22px_70px_rgba(2,6,23,0.28)]">
          <div
            className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${activeTheme.meter}`}
          />
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[0.68rem] uppercase tracking-[0.3em] text-cyan-200/70">
                目前選取
              </div>
              <h4 className="mt-2 text-xl font-semibold text-white">
                {activeSkill.name}
              </h4>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                {activeSkill.description || fallbackSkillDescription(activeSkill)}
              </p>
            </div>
            <Badge className={activeTheme.badge}>{stateLabel}</Badge>
          </div>

          <div className="mt-4 rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
            <SkillLevelMeter skill={activeSkill} compact />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
            <div>
              <div className="text-[0.65rem] uppercase tracking-[0.24em] text-slate-400">
                分類
              </div>
              <div className="mt-2 text-sm font-medium text-white">
                {CATEGORY_LABELS[activeSkill.category]}
              </div>
            </div>
            <Badge className={activeTheme.badge}>{activeSkill.level}/5</Badge>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {activeSkill.tags.map((tag) => (
              <Badge key={tag} className={activeTheme.chip}>
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
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
                  結構化清單
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {CATEGORY_LABELS[typedCategory]}
                </h2>
              </div>
              <Badge className={theme.badge}>{categorySkills.length} 項技能</Badge>
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
                            已固定
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
    return (
      <aside className="rounded-[1.9rem] border border-white/10 bg-slate-950/55 p-5 text-slate-100 shadow-[0_28px_80px_rgba(2,6,23,0.45)] backdrop-blur-2xl lg:sticky lg:top-24 sm:p-6">
        <div className="text-[0.68rem] uppercase tracking-[0.3em] text-cyan-200/70">
          技能面板
        </div>
        <h2 className="mt-3 text-2xl font-semibold text-white">
          尚未選擇技能
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          滑入或點擊星圖中的技能，或切換到矩陣檢視。
        </p>
      </aside>
    );
  }

  const theme = CATEGORY_STYLES[activeSkill.category];
  const stateLabel = getSignalStateLabel(activeSkill, selectedSkillId);

  return (
    <aside className="rounded-[1.9rem] border border-white/10 bg-slate-950/55 p-5 text-slate-100 shadow-[0_28px_80px_rgba(2,6,23,0.45)] backdrop-blur-2xl lg:sticky lg:top-24 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[0.68rem] uppercase tracking-[0.3em] text-cyan-200/70">
            技能面板
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
            分類
          </div>
          <div className="mt-3 text-sm font-medium text-white">
            {CATEGORY_LABELS[activeSkill.category]}
          </div>
        </div>
        <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
          <div className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">
            檢視模式
          </div>
          <div className="mt-3 text-sm font-medium text-white">
            {displayMode === "starfield" ? "星圖" : "矩陣"}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">
            技能標記
          </div>
          <span className="text-xs text-slate-400">{activeSkill.tags.length} 個標籤</span>
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
          總覽
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <div className="text-2xl font-semibold text-cyan-100">
              {filteredSkills.length}
            </div>
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
              目前顯示
            </div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-violet-100">
              {new Set(filteredSkills.map((skill) => skill.category)).size}
            </div>
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
              涵蓋分類
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
  const hoverCapablePointer = useHoverCapablePointer();
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
  const [starfieldBatchIndex, setStarfieldBatchIndex] = useState(0);
  const [starfieldSeed, setStarfieldSeed] = useState(() => Date.now());

  useEffect(() => {
    setPageError(null);
    setIsLoading(true);

    dataClient
      .listSkills()
      .then((data) => setSkills(data))
      .catch((error) => {
        console.error("Failed to load skills:", error);
        setPageError("目前無法載入技能頁面。");
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

  const starfieldBatchCount = Math.max(
    1,
    Math.ceil(orderedFilteredSkills.length / STARFIELD_BATCH_SIZE),
  );

  const visibleStarfieldSkills = useMemo(() => {
    const start = (starfieldBatchIndex % starfieldBatchCount) * STARFIELD_BATCH_SIZE;
    return orderedFilteredSkills.slice(start, start + STARFIELD_BATCH_SIZE);
  }, [orderedFilteredSkills, starfieldBatchCount, starfieldBatchIndex]);

  useEffect(() => {
    setStarfieldBatchIndex(0);
    setStarfieldSeed(Date.now());
  }, [orderedFilteredSkills]);

  useEffect(() => {
    if (!selectedSkillId) return;

    const selectedIndex = orderedFilteredSkills.findIndex(
      (skill) => skill.id === selectedSkillId,
    );

    if (selectedIndex === -1) return;
    setStarfieldBatchIndex(Math.floor(selectedIndex / STARFIELD_BATCH_SIZE));
  }, [orderedFilteredSkills, selectedSkillId]);

  useEffect(() => {
    if (
      displayMode !== "starfield" ||
      orderedFilteredSkills.length <= STARFIELD_BATCH_SIZE ||
      selectedSkillId ||
      previewSkillId
    ) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setStarfieldBatchIndex((current) => (current + 1) % starfieldBatchCount);
      setStarfieldSeed(Date.now() + Math.floor(Math.random() * 100000));
    }, STARFIELD_ROTATION_MS);

    return () => window.clearInterval(timer);
  }, [
    displayMode,
    orderedFilteredSkills.length,
    previewSkillId,
    selectedSkillId,
    starfieldBatchCount,
  ]);

  const activeSkill = useMemo(() => {
    return (
      orderedFilteredSkills.find((skill) => skill.id === selectedSkillId) ||
      orderedFilteredSkills.find((skill) => skill.id === previewSkillId) ||
      null
    );
  }, [orderedFilteredSkills, previewSkillId, selectedSkillId]);

  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "技能一覽",
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

  const handleFocusSkill = (skillId: string) => {
    setSelectedSkillId(skillId);
    setPreviewSkillId(skillId);
  };

  if (isLoading) {
    return (
        <div className="container-page flex min-h-[60vh] items-center justify-center">
          <div className="animate-pulse text-muted-foreground">
            正在載入技能頁面...
          </div>
        </div>
    );
  }

  return (
    <>
      <Seo
        title="技能 | a6a27"
        description="查看技能分布、熟練度與技術標籤。"
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
                  技能概覽
                </div>
                <h1 className="mt-5 text-white">
                  技能一覽
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                  快速查看技能、熟練度與技術分布。
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MetricCard label="目前技能數" value={String(filteredSkills.length)} />
                <MetricCard
                  label="重點技能"
                  value={String(featuredCount)}
                  accent="text-violet-100"
                />
                <MetricCard
                  label="技能分類"
                  value={String(domainCount)}
                  accent="text-emerald-100"
                />
                <MetricCard
                  label="啟用篩選"
                  value={String(activeFilterCount)}
                  accent="text-amber-100"
                />
              </div>
            </header>

            <section className="rounded-[1.85rem] border border-white/10 bg-white/5 p-4 shadow-[0_18px_50px_rgba(2,6,23,0.22)] backdrop-blur-xl sm:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.3em] text-cyan-200/70">
                    篩選條件
                  </div>
                  <h2 className="mt-2 text-xl font-semibold text-white">
                    篩選技能
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
                      星圖
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
                      矩陣
                    </Button>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={resetFilters}
                    className="rounded-full border-white/10 bg-slate-950/55 text-slate-100 hover:bg-white/10"
                  >
                    重設檢視
                  </Button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">
                      分類
                    </span>
                    <span className="text-xs text-slate-400">
                      {selectedCategory
                        ? CATEGORY_LABELS[selectedCategory]
                        : "全部分類"}
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
                      全部
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
                      標籤
                    </span>
                    <span className="text-xs text-slate-400">
                      {selectedTag || "全部標籤"}
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
                      全部
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
                    尚未套用篩選
                  </Badge>
                )}
              </div>
            </section>

            {filteredSkills.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/5 px-6 py-14 text-center shadow-[0_18px_50px_rgba(2,6,23,0.18)]">
                <h2 className="text-2xl font-semibold text-white">
                  目前沒有符合條件的技能。
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">
                  請重設目前的分類與標籤篩選，重新查看完整的技能內容與星圖版面。
                </p>
                <div className="mt-6">
                  <Button
                    type="button"
                    onClick={resetFilters}
                    className="bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                  >
                    重設檢視
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_360px] lg:items-start">
                <div className="space-y-5">
                  {displayMode === "starfield" ? (
                    <>
                      {hoverCapablePointer && (
                        <div className="hidden lg:block">
                          <CosmicStarfield
                            skills={visibleStarfieldSkills}
                            activeSkillId={activeSkill?.id || null}
                            previewSkillId={previewSkillId}
                            selectedSkillId={selectedSkillId}
                            reducedMotion={reducedMotion}
                            placementSeed={starfieldSeed}
                            onPreviewSkill={setPreviewSkillId}
                            onSelectSkill={handleSelectSkill}
                          />
                        </div>
                      )}

                      <QuickAccessStrip
                        skills={orderedFilteredSkills}
                        activeSkillId={activeSkill?.id || null}
                        selectedSkillId={selectedSkillId}
                        onSelectSkill={handleFocusSkill}
                        className={hoverCapablePointer ? "lg:hidden" : ""}
                      />
                    </>
                  ) : (
                    <TraditionalSkillsView
                      skills={orderedFilteredSkills}
                      activeSkillId={activeSkill?.id || null}
                      selectedSkillId={selectedSkillId}
                      onPreviewSkill={setPreviewSkillId}
                      onSelectSkill={handleSelectSkill}
                    />
                  )}
                </div>

                <div className="hidden lg:block">
                  <SkillInsightPanel
                    activeSkill={activeSkill}
                    selectedSkillId={selectedSkillId}
                    filteredSkills={orderedFilteredSkills}
                    displayMode={displayMode}
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
