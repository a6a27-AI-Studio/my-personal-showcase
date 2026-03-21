import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/seo/Seo";
import { Sparkles, Orbit, List, Pause, Play } from "lucide-react";
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

type DisplayMode = "galaxy" | "traditional";

type SpherePoint = { x: number; y: number; z: number };

function fibonacciSphere(index: number, total: number): SpherePoint {
  const safeTotal = Math.max(total, 1);
  const offset = 2 / safeTotal;
  const increment = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (index * offset + offset / 2);
  const radius = Math.sqrt(1 - y * y);
  const phi = index * increment;

  return {
    x: Math.cos(phi) * radius,
    y,
    z: Math.sin(phi) * radius,
  };
}

function rotatePoint(
  point: SpherePoint,
  rotX: number,
  rotY: number,
): SpherePoint {
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const x1 = point.x * cosY - point.z * sinY;
  const z1 = point.x * sinY + point.z * cosY;

  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);

  return {
    x: x1,
    y: point.y * cosX - z1 * sinX,
    z: point.y * sinX + z1 * cosX,
  };
}

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

interface GalaxySphereProps {
  skills: Skill[];
  activeSkill: Skill | null;
  onActiveSkill: (skill: Skill | null) => void;
}

function GalaxySphere({
  skills,
  activeSkill,
  onActiveSkill,
}: GalaxySphereProps) {
  const reducedMotion = useReducedMotion();
  const [rotation, setRotation] = useState({ x: -0.4, y: 0 });
  const [manualPause, setManualPause] = useState(false);
  const isPaused = reducedMotion || manualPause || !!activeSkill;
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;

      if (!isPaused) {
        setRotation((prev) => ({
          x: prev.x + dt * 0.00008,
          y: prev.y + dt * 0.00023,
        }));
      }

      rafRef.current = window.requestAnimationFrame(animate);
    };

    rafRef.current = window.requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [isPaused]);

  const points = useMemo(
    () => skills.map((_, index) => fibonacciSphere(index, skills.length)),
    [skills],
  );

  const renderedNodes = useMemo(() => {
    const perspective = 2.5;
    return skills
      .map((skill, index) => {
        const point = rotatePoint(points[index], rotation.x, rotation.y);
        const scale = perspective / (perspective - point.z);
        const opacity = Math.max(0.35, Math.min(1, (point.z + 1.4) / 2.2));
        const size = 0.72 + skill.level * 0.12 + point.z * 0.1;
        return {
          skill,
          x: point.x * 42 * scale,
          y: point.y * 42 * scale,
          z: point.z,
          scale,
          opacity,
          size,
        };
      })
      .sort((a, b) => a.z - b.z);
  }, [points, rotation.x, rotation.y, skills]);

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between gap-3 text-sm text-slate-300">
        <div className="flex items-center gap-2">
          <Orbit className="h-4 w-4 text-cyan-300" />
          <span>銀河技能球體</span>
          <span className="text-slate-500">·</span>
          <span>{skills.length} 顆技能星點</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900"
          onClick={() => setManualPause((prev) => !prev)}
        >
          {isPaused ? (
            <Play className="mr-2 h-4 w-4" />
          ) : (
            <Pause className="mr-2 h-4 w-4" />
          )}
          {isPaused ? "恢復旋轉" : "暫停旋轉"}
        </Button>
      </div>

      <div
        className="relative mx-auto aspect-square w-full max-w-[760px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#020617] shadow-[0_0_60px_rgba(56,189,248,0.12)]"
        onMouseLeave={() => onActiveSkill(null)}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.15),transparent_30%),radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.18),transparent_25%),radial-gradient(circle_at_80%_30%,rgba(244,114,182,0.16),transparent_20%),linear-gradient(180deg,#020617_0%,#030712_100%)]" />
        <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle,rgba(255,255,255,0.9)_0.7px,transparent_0.8px)] [background-size:28px_28px]" />
        <div className="absolute inset-[13%] rounded-full border border-cyan-400/20 bg-[radial-gradient(circle_at_50%_45%,rgba(56,189,248,0.18),rgba(14,165,233,0.08)_35%,rgba(15,23,42,0.8)_70%,rgba(2,6,23,0.95)_100%)] shadow-[inset_0_0_80px_rgba(56,189,248,0.18),0_0_80px_rgba(56,189,248,0.06)]" />
        <div className="absolute inset-[18%] rounded-full border border-white/10 shadow-[inset_0_0_60px_rgba(255,255,255,0.04)]" />

        {renderedNodes.map(({ skill, x, y, opacity, size }) => {
          const isActive = activeSkill?.id === skill.id;
          return (
            <button
              key={skill.id}
              type="button"
              onMouseEnter={() => onActiveSkill(skill)}
              onFocus={() => onActiveSkill(skill)}
              className="group absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-left outline-none transition-transform duration-200 hover:scale-110 focus:scale-110"
              style={{
                transform: `translate(${x.toFixed(2)}%, ${y.toFixed(2)}%) scale(${size.toFixed(2)})`,
                opacity,
                zIndex: isActive ? 30 : Math.round(opacity * 10),
              }}
              aria-label={`${skill.name}，熟練度 ${skill.level} / 5`}
            >
              <span className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/55 px-3 py-1.5 shadow-[0_0_24px_rgba(255,255,255,0.08)] backdrop-blur-sm transition-colors group-hover:border-cyan-300/50 group-hover:bg-slate-950/80">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.95)]" : "bg-white shadow-[0_0_14px_rgba(255,255,255,0.8)]"}`}
                />
                <span className="whitespace-nowrap text-xs font-medium tracking-[0.18em] text-slate-100/95 uppercase">
                  {skill.name}
                </span>
              </span>
            </button>
          );
        })}

        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-xs text-slate-300 backdrop-blur-md">
          <Sparkles className="h-4 w-4 text-cyan-300" />
          <span>預設為華麗星體模式，滑鼠停在技能上會停止旋轉並顯示細節。</span>
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
  const [displayMode, setDisplayMode] = useState<DisplayMode>("galaxy");
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);

  useEffect(() => {
    setPageError(null);
    dataClient
      .listSkills()
      .then((data) => {
        setSkills(data);
      })
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
        description="以銀河球體與傳統卡片兩種模式，瀏覽 a6a27 的技術技能、熟練度與專長說明。"
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
            <div className="section-header mb-8 text-white">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
                <Sparkles className="h-4 w-4" />
                Galaxy Skills Experience
              </div>
              <h1 className="mb-4 text-white">技能星圖</h1>
              <p className="mx-auto max-w-3xl text-base text-slate-300 md:text-xl">
                用黑色銀河球體瀏覽我的技能宇宙。星點會持續旋轉，滑鼠停留時會定格，方便你聚焦每一項能力的細節。
              </p>
            </div>

            <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-slate-200">
                  顯示模式
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={displayMode === "galaxy" ? "default" : "outline"}
                    onClick={() => setDisplayMode("galaxy")}
                    className={
                      displayMode === "galaxy"
                        ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                        : "border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900"
                    }
                  >
                    <Orbit className="mr-2 h-4 w-4" /> Galaxy
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
                  {displayMode === "galaxy" ? (
                    <GalaxySphere
                      skills={filteredSkills}
                      activeSkill={activeSkill}
                      onActiveSkill={setActiveSkill}
                    />
                  ) : (
                    <TraditionalSkillsView skills={filteredSkills} />
                  )}
                </div>

                <aside className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-slate-100 shadow-[0_20px_60px_rgba(15,23,42,0.45)] backdrop-blur-md xl:sticky xl:top-24">
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
                      <p className="leading-7">
                        把滑鼠移到球體中的任一技能星點上，銀河會停下來，右側就會顯示該技能的細節說明。
                      </p>
                      <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/45 p-4 text-sm text-slate-400">
                        目前顯示{" "}
                        <span className="font-semibold text-slate-100">
                          {filteredSkills.length}
                        </span>{" "}
                        個技能；你也可以用上方分類或標籤把星圖收斂。
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
