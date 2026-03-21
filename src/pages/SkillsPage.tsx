import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/seo/Seo";
import { Sparkles, Stars, List } from "lucide-react";
import { useDataClient } from "@/contexts/DataClientContext";
import type { Skill } from "@/types";

const CATEGORY_LABELS: Record<Skill["category"], string> = {
  frontend: "Frontend",
  backend: "Backend",
  database: "Database",
  devops: "DevOps",
  tools: "Tools",
  other: "Other",
};

const CATEGORY_ORDER: Skill["category"][] = [
  "frontend",
  "backend",
  "database",
  "devops",
  "tools",
  "other",
];

type DisplayMode = "starfield" | "traditional";

const FEATURED_SKILLS = [
  "React",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "Docker",
  "AWS",
];

type StarPlacement = {
  skill: Skill;
  left: number;
  top: number;
  scale: number;
  twinkleDuration: number;
  twinkleDelay: number;
  glow: string;
  depth: number;
};

function fallbackSkillDescription(skill: Skill) {
  const tags = skill.tags.slice(0, 3).join(" · ");
  return `${CATEGORY_LABELS[skill.category]} 領域技能，熟練度 ${skill.level}/5${tags ? `，重點包含 ${tags}` : ""}。`;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
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
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
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

function chunkSkills(skills: Skill[], size: number) {
  const ordered = prioritizeSkills(skills);
  const chunks: Skill[][] = [];
  for (let i = 0; i < ordered.length; i += size) {
    chunks.push(ordered.slice(i, i + size));
  }
  return chunks;
}

function buildPlacements(skills: Skill[], batchIndex: number) {
  const rand = seededRandom(
    hashString(`${skills.map((s) => s.id).join("|")}-${batchIndex}`),
  );
  const placed: Array<{ left: number; top: number }> = [];
  const glows = [
    "rgba(255,255,255,0.95)",
    "rgba(125,211,252,0.95)",
    "rgba(196,181,253,0.95)",
    "rgba(253,224,71,0.92)",
  ];

  return skills.map((skill, index) => {
    let left = 18 + rand() * 64;
    let top = 18 + rand() * 56;

    for (let attempt = 0; attempt < 60; attempt += 1) {
      const overlaps = placed.some(
        (p) => Math.hypot((p.left - left) * 1.1, p.top - top) < 16,
      );
      if (!overlaps) break;
      left = 14 + rand() * 72;
      top = 16 + rand() * 60;
    }

    placed.push({ left, top });

    return {
      skill,
      left,
      top,
      scale: 0.85 + skill.level * 0.08 + rand() * 0.18,
      twinkleDuration: 2.6 + rand() * 2.8,
      twinkleDelay: rand() * 2.4,
      glow: glows[(index + Math.floor(rand() * 8)) % glows.length],
      depth: 0.6 + rand() * 0.8,
    } satisfies StarPlacement;
  });
}

interface StarfieldBatchViewProps {
  skills: Skill[];
  activeSkill: Skill | null;
  onActiveSkill: (skill: Skill | null) => void;
}

function StarfieldBatchView({
  skills,
  activeSkill,
  onActiveSkill,
}: StarfieldBatchViewProps) {
  const reducedMotion = useReducedMotion();
  const batches = useMemo(() => chunkSkills(skills, 6), [skills]);
  const [batchIndex, setBatchIndex] = useState(0);
  const [phase, setPhase] = useState<"visible" | "transitioning">("visible");
  const [lockedSkillId, setLockedSkillId] = useState<string | null>(null);

  useEffect(() => {
    setBatchIndex(0);
    setPhase("visible");
  }, [skills]);

  useEffect(() => {
    if (batches.length <= 1 || reducedMotion || activeSkill || lockedSkillId)
      return;

    const visibleTimer = window.setTimeout(() => {
      setPhase("transitioning");
    }, 8200);

    const rotateTimer = window.setTimeout(() => {
      setBatchIndex((prev) => (prev + 1) % batches.length);
      setPhase("visible");
      onActiveSkill(null);
    }, 10000);

    return () => {
      window.clearTimeout(visibleTimer);
      window.clearTimeout(rotateTimer);
    };
  }, [
    activeSkill,
    batches.length,
    batchIndex,
    lockedSkillId,
    onActiveSkill,
    reducedMotion,
  ]);

  const currentBatch = batches[batchIndex] || skills;
  const placements = useMemo(
    () => buildPlacements(currentBatch, batchIndex),
    [batchIndex, currentBatch],
  );

  return (
    <div className="relative">
      <style>{`
        @keyframes star-twinkle {
          0%, 100% { opacity: .45; transform: scale(.96); }
          35% { opacity: 1; transform: scale(1.06); }
          70% { opacity: .72; transform: scale(1); }
        }
        @keyframes drift-nebula-a {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(2%, -2%, 0) scale(1.04); }
        }
        @keyframes drift-nebula-b {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-2%, 2%, 0) scale(1.06); }
        }
      `}</style>

      <div className="mb-5 flex items-center justify-between gap-3 text-sm text-slate-300">
        <div className="flex items-center gap-2">
          <Stars className="h-4 w-4 text-cyan-300" />
          <span>精選技能星空</span>
          <span className="text-slate-500">·</span>
          <span>每批 {currentBatch.length} 個技能</span>
        </div>
        <div className="text-xs text-slate-400">
          {batches.length > 1
            ? "約 10 秒切換下一批"
            : "目前符合條件的技能少於一批"}
        </div>
      </div>

      <div
        className="relative mx-auto aspect-[16/10] w-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#030712] shadow-[0_0_120px_rgba(76,29,149,0.16),0_0_60px_rgba(56,189,248,0.12)]"
        onMouseLeave={() => {
          if (!lockedSkillId) onActiveSkill(null);
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#020617_0%,#030712_40%,#020617_100%)]" />
        <div
          className="absolute inset-[-10%] opacity-80 blur-3xl"
          style={{ animation: "drift-nebula-a 24s ease-in-out infinite" }}
        >
          <div className="absolute left-[8%] top-[12%] h-72 w-72 rounded-full bg-violet-500/14" />
          <div className="absolute right-[8%] top-[20%] h-80 w-80 rounded-full bg-sky-400/12" />
          <div className="absolute bottom-[10%] left-[24%] h-96 w-96 rounded-full bg-fuchsia-500/10" />
        </div>
        <div
          className="absolute inset-[-8%] opacity-65 blur-[110px]"
          style={{ animation: "drift-nebula-b 28s ease-in-out infinite" }}
        >
          <div className="absolute left-[35%] top-[16%] h-[26rem] w-[26rem] rounded-full bg-cyan-300/10" />
          <div className="absolute right-[20%] bottom-[8%] h-[24rem] w-[24rem] rounded-full bg-indigo-400/10" />
        </div>
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle,rgba(255,255,255,0.9)_0.7px,transparent_0.8px)] [background-size:30px_30px]" />
        <div className="absolute inset-0 opacity-18 [background-image:radial-gradient(circle,rgba(165,243,252,0.9)_0.8px,transparent_0.9px)] [background-size:72px_72px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.08),transparent_18%),radial-gradient(circle_at_50%_52%,rgba(56,189,248,0.12),transparent_38%),radial-gradient(circle_at_50%_55%,rgba(76,29,149,0.14),transparent_62%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_25%,transparent_70%,rgba(0,0,0,0.12))]" />

        <div
          className={`absolute inset-0 transition-all duration-1000 ${phase === "transitioning" ? "opacity-0 blur-sm scale-[1.015]" : "opacity-100 blur-0 scale-100"}`}
        >
          {placements.map((star) => {
            const isActive = activeSkill?.id === star.skill.id;
            return (
              <button
                key={`${batchIndex}-${star.skill.id}`}
                type="button"
                onMouseEnter={() => onActiveSkill(star.skill)}
                onFocus={() => onActiveSkill(star.skill)}
                onClick={() => {
                  const next =
                    lockedSkillId === star.skill.id ? null : star.skill.id;
                  setLockedSkillId(next);
                  onActiveSkill(next ? star.skill : null);
                }}
                className="group absolute -translate-x-1/2 -translate-y-1/2 text-left outline-none transition-transform duration-500 hover:scale-105 focus:scale-105"
                style={{
                  left: `${star.left}%`,
                  top: `${star.top}%`,
                  zIndex: isActive ? 40 : Math.round(star.depth * 10),
                }}
                aria-label={`${star.skill.name}，熟練度 ${star.skill.level} / 5`}
              >
                <span
                  className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
                  style={{
                    background: `radial-gradient(circle, ${star.glow.replace("0.95", "0.18")} 0%, transparent 72%)`,
                  }}
                />
                <span
                  className="pointer-events-none absolute left-1/2 top-1/2 rounded-full bg-gradient-to-r from-white/0 via-white/35 to-white/0 blur-md"
                  style={{
                    width: `${56 + star.skill.level * 8}px`,
                    height: `${12 + star.skill.level * 1.5}px`,
                    transform: `translate(-50%, -50%) rotate(${(star.left - 50) * 0.6}deg)`,
                    opacity: 0.45,
                  }}
                />
                <span
                  className={`absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border ${isActive ? "border-cyan-200/35" : "border-white/10"}`}
                  style={
                    isActive
                      ? { boxShadow: "0 0 24px rgba(165,243,252,0.35)" }
                      : undefined
                  }
                />
                <span className="relative flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/35 px-3 py-2 shadow-[0_0_28px_rgba(255,255,255,0.05)] backdrop-blur-md transition-all duration-300 group-hover:border-cyan-300/35 group-hover:bg-slate-950/55">
                  <span
                    className="relative flex h-3 w-3 items-center justify-center"
                    style={{
                      animation: reducedMotion
                        ? undefined
                        : `star-twinkle ${star.twinkleDuration}s ease-in-out ${star.twinkleDelay}s infinite`,
                    }}
                  >
                    <span className="absolute h-3 w-3 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.95)]" />
                    <span
                      className="absolute h-6 w-6 rounded-full opacity-60 blur-md"
                      style={{ backgroundColor: star.glow }}
                    />
                  </span>
                  <span className="whitespace-nowrap text-xs font-medium tracking-[0.18em] text-slate-100 uppercase">
                    {star.skill.name}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-xs text-slate-300 backdrop-blur-xl shadow-[0_12px_30px_rgba(2,6,23,0.45)]">
          <Sparkles className="h-4 w-4 text-cyan-300" />
          <span>
            技能像星光一樣在星空中閃爍。滑鼠停留時會暫停批次切換，方便閱讀細節。
          </span>
        </div>
      </div>
    </div>
  );
}

function TraditionalSkillsView({ skills }: { skills: Skill[] }) {
  const groupedSkills = CATEGORY_ORDER.reduce(
    (acc, category) => {
      const categorySkills = skills.filter((s) => s.category === category);
      if (categorySkills.length > 0) {
        acc[category] = categorySkills;
      }
      return acc;
    },
    {} as Record<Skill["category"], Skill[]>,
  );

  return (
    <div className="space-y-12">
      {Object.entries(groupedSkills).map(([category, categorySkills]) => (
        <section key={category} className="animate-fade-in">
          <h2 className="mb-6 text-2xl font-semibold text-primary">
            {CATEGORY_LABELS[category as Skill["category"]]}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categorySkills.map((skill) => (
              <div
                key={skill.id}
                className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-sm"
              >
                <div className="mb-3 flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-card-foreground">
                    {skill.name}
                  </h3>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-2 rounded-full ${i < skill.level ? "bg-accent" : "bg-muted"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="mb-4 text-sm leading-6 text-muted-foreground">
                  {skill.description || fallbackSkillDescription(skill)}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {skill.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function SkillsPage() {
  const dataClient = useDataClient();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    Skill["category"] | null
  >(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("starfield");
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);

  useEffect(() => {
    setPageError(null);
    dataClient
      .listSkills()
      .then((data) => setSkills(data))
      .catch((error) => {
        console.error("Failed to load skills:", error);
        setPageError("技能資料載入失敗，請稍後再試。");
      })
      .finally(() => setIsLoading(false));
  }, [dataClient]);

  const allTags = useMemo(
    () => Array.from(new Set(skills.flatMap((s) => s.tags))),
    [skills],
  );

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      const matchesCategory = selectedCategory
        ? skill.category === selectedCategory
        : true;
      const matchesTag = selectedTag ? skill.tags.includes(selectedTag) : true;
      return matchesCategory && matchesTag;
    });
  }, [selectedCategory, selectedTag, skills]);

  useEffect(() => {
    if (
      activeSkill &&
      !filteredSkills.some((skill) => skill.id === activeSkill.id)
    ) {
      setActiveSkill(null);
    }
  }, [activeSkill, filteredSkills]);

  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "技能與專長",
      itemListElement: filteredSkills.map((skill, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: skill.name,
        description: skill.description || fallbackSkillDescription(skill),
      })),
    }),
    [filteredSkills],
  );

  if (isLoading) {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">載入中...</div>
      </div>
    );
  }

  return (
    <>
      <Seo
        title="技能｜a6a27 個人作品集"
        description="以批次星空與傳統卡片兩種模式，瀏覽 a6a27 的技術技能、熟練度與專長說明。"
        path="/skills"
        structuredData={structuredData}
      />
      <div className="container-page">
        {pageError && (
          <div className="mb-6 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {pageError}
          </div>
        )}

        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 px-6 py-8 shadow-[0_30px_80px_rgba(2,6,23,0.65)] md:px-8 md:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.16),transparent_22%),radial-gradient(circle_at_20%_80%,rgba(251,191,36,0.10),transparent_18%)]" />
          <div className="relative">
            <div className="mb-8 text-white">
              <div className="mb-3 text-xs uppercase tracking-[0.32em] text-cyan-200/80">
                Capabilities
              </div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
                <Sparkles className="h-4 w-4" />
                Starfield Skills Experience
              </div>
              <h1 className="mb-4 text-white">技能星圖</h1>
              <p className="max-w-3xl text-base text-slate-300 md:text-xl">
                不再是旋轉球體，而是一片會呼吸的深空技能牆。每一批技能像星星一樣閃爍登場，十秒後再換下一組。
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  {filteredSkills.length} skills in view
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  starfield preview active
                </span>
              </div>
            </div>

            <div className="mb-8 flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-slate-950/35 p-4 backdrop-blur-xl shadow-[0_12px_30px_rgba(2,6,23,0.25)]">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-slate-200">
                  顯示模式
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      displayMode === "starfield" ? "default" : "outline"
                    }
                    onClick={() => setDisplayMode("starfield")}
                    className={
                      displayMode === "starfield"
                        ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                        : "border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900"
                    }
                  >
                    <Stars className="mr-2 h-4 w-4" /> Starfield
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      displayMode === "traditional" ? "default" : "outline"
                    }
                    onClick={() => setDisplayMode("traditional")}
                    className={
                      displayMode === "traditional"
                        ? "bg-violet-400 text-slate-950 hover:bg-violet-300"
                        : "border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900"
                    }
                  >
                    <List className="mr-2 h-4 w-4" /> Traditional
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedTag(null);
                      setActiveSkill(null);
                      setLockedSkillId(null);
                    }}
                    className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                  >
                    Reset filters
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="min-w-16 text-sm font-medium text-slate-300">
                    分類
                  </span>
                  <Button
                    size="sm"
                    variant={selectedCategory === null ? "default" : "outline"}
                    onClick={() => setSelectedCategory(null)}
                    className={
                      selectedCategory === null
                        ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                        : "border-slate-700 bg-slate-950/50 text-slate-100 hover:bg-slate-900"
                    }
                  >
                    全部
                  </Button>
                  {CATEGORY_ORDER.map((category) => (
                    <Button
                      key={category}
                      size="sm"
                      variant={
                        selectedCategory === category ? "default" : "outline"
                      }
                      onClick={() => setSelectedCategory(category)}
                      className={
                        selectedCategory === category
                          ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                          : "border-slate-700 bg-slate-950/50 text-slate-100 hover:bg-slate-900"
                      }
                    >
                      {CATEGORY_LABELS[category]}
                    </Button>
                  ))}
                </div>

                {allTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="min-w-16 text-sm font-medium text-slate-300">
                      標籤
                    </span>
                    <Button
                      size="sm"
                      variant={selectedTag === null ? "default" : "outline"}
                      onClick={() => setSelectedTag(null)}
                      className={
                        selectedTag === null
                          ? "bg-violet-400 text-slate-950 hover:bg-violet-300"
                          : "border-slate-700 bg-slate-950/50 text-slate-100 hover:bg-slate-900"
                      }
                    >
                      全部
                    </Button>
                    {allTags.map((tag) => (
                      <Button
                        key={tag}
                        size="sm"
                        variant={selectedTag === tag ? "default" : "outline"}
                        onClick={() => setSelectedTag(tag)}
                        className={
                          selectedTag === tag
                            ? "bg-violet-400 text-slate-950 hover:bg-violet-300"
                            : "border-slate-700 bg-slate-950/50 text-slate-100 hover:bg-slate-900"
                        }
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {filteredSkills.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-6 py-12 text-center text-slate-300">
                目前沒有符合篩選條件的技能星點。
              </div>
            ) : (
              <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
                <div>
                  {displayMode === "starfield" ? (
                    <StarfieldBatchView
                      skills={filteredSkills}
                      activeSkill={activeSkill}
                      onActiveSkill={setActiveSkill}
                    />
                  ) : (
                    <TraditionalSkillsView skills={filteredSkills} />
                  )}
                </div>

                <aside className="rounded-[1.9rem] border border-white/10 bg-slate-950/45 p-6 text-slate-100 shadow-[0_24px_70px_rgba(15,23,42,0.45)] backdrop-blur-xl xl:sticky xl:top-24">
                  <div className="mb-3 text-xs uppercase tracking-[0.24em] text-cyan-300">
                    Skill Insight
                  </div>
                  {activeSkill ? (
                    <div className="space-y-4">
                      <div>
                        <div className="mb-2 flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.95)]" />
                          <h2 className="text-2xl font-semibold">
                            {activeSkill.name}
                          </h2>
                        </div>
                        <p className="text-sm leading-7 text-slate-300">
                          {activeSkill.description ||
                            fallbackSkillDescription(activeSkill)}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                        <div>
                          <div className="mb-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                            Category
                          </div>
                          <div className="font-medium text-slate-100">
                            {CATEGORY_LABELS[activeSkill.category]}
                          </div>
                        </div>
                        <div>
                          <div className="mb-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                            Level
                          </div>
                          <div className="font-medium text-slate-100">
                            {activeSkill.level} / 5
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                          Tags
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {activeSkill.tags.map((tag) => (
                            <Badge
                              key={tag}
                              className="border border-cyan-400/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/20"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 text-slate-300">
                      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.24em] text-slate-400">
                        Hover a star to preview · click to pin
                      </div>
                      <p className="leading-7">
                        把滑鼠移到任一技能星點上，右側就會顯示技能細節；在
                        Starfield 模式下，畫面會每約十秒柔和切到下一批技能。
                      </p>
                      <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/45 p-4 text-sm text-slate-400">
                        目前技能池共有{" "}
                        <span className="font-semibold text-slate-100">
                          {filteredSkills.length}
                        </span>{" "}
                        個項目，系統會依篩選結果分批顯示。
                      </div>
                    </div>
                  )}
                </aside>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
