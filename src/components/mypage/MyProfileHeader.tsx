import { UserRound } from "lucide-react";

type MyProfileHeaderProps = {
  nickname: string;
};

export function MyProfileHeader({ nickname }: MyProfileHeaderProps) {
  return (
    <header className="border-border/60 flex items-center gap-3 border-b bg-white px-5 py-5">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#d9d9d9] text-white">
        <UserRound className="size-6" aria-hidden />
      </span>
      <p className="text-[1rem] font-semibold text-[#111111]">{nickname}님</p>
    </header>
  );
}
