import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { useAuthStore } from "@/store/authStore";

type GroupItem = {
  id: string;
  title: string;
  subtitle: string;
  initial: string;
};

const MOCK_GROUPS: GroupItem[] = [
  { id: "1", title: "졸업 프로젝트 팀", subtitle: "멤버 4명", initial: "졸" },
  { id: "2", title: "동네 맛집 탐방", subtitle: "멤버 12명", initial: "동" },
  { id: "3", title: "가족", subtitle: "멤버 5명", initial: "가" },
  { id: "4", title: "스터디 7기", subtitle: "멤버 8명", initial: "스" },
];

export function HomePage() {
  const nickname = useAuthStore((s) => s.nickname);
  const logout = useAuthStore((s) => s.logout);
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_GROUPS[0]?.id ?? null);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-border relative shrink-0 border-b py-3">
        <div className="px-1">
          <h1 className="text-center text-lg font-semibold tracking-tight">
            <span className="text-brand-gradient">어디더라</span>
          </h1>
          {nickname ? (
            <p className="text-muted-foreground mt-0.5 text-center text-sm leading-tight">
              {nickname}님, 환영합니다
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute end-0 top-1/2 -translate-y-1/2 cursor-pointer touch-target-min rounded-md px-2 text-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          로그아웃
        </button>
      </header>

      <ul className="divide-border divide-y" role="list">
        {MOCK_GROUPS.map((g) => {
          const selected = selectedId === g.id;
          return (
            <li key={g.id}>
              <button
                type="button"
                onClick={() => setSelectedId(g.id)}
                className={`cursor-pointer touch-target-min flex w-full min-h-[4.25rem] items-center gap-3 px-1 py-2 text-left transition-colors ${
                  selected ? "bg-accent/80" : "hover:bg-muted/60 active:bg-muted/80"
                }`}
              >
                <span
                  className="bg-muted text-muted-foreground flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-medium"
                  aria-hidden
                >
                  {g.initial}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{g.title}</span>
                  <span className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">{g.subtitle}</span>
                </span>
                <ChevronRight className="text-muted-foreground size-5 shrink-0 opacity-60" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
