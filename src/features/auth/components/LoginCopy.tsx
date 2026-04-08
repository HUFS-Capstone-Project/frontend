export type LoginCopyVariant = "greeting" | "marketing"

type LoginCopyProps = {
  variant: LoginCopyVariant
}

const greetingLineClass =
  "text-foreground text-2xl font-bold leading-snug tracking-tight sm:text-3xl"

export function LoginCopy({ variant }: LoginCopyProps) {
  if (variant === "greeting") {
    return (
      <div className="mx-auto w-full max-w-sm space-y-3 text-center">
        <p className={greetingLineClass}>안녕하세요</p>
        <p className={greetingLineClass}>
          <span className="text-brand-gradient font-bold">어디더라</span>
          <span> 입니다</span>
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-sm space-y-6 text-left leading-relaxed">
      <p
        id="login-marketing-heading"
        className="text-2xl font-semibold leading-snug sm:text-3xl"
      >
        <span className="text-brand-gradient font-semibold">어디더라</span>
        <span className="text-foreground">,</span>
      </p>
      <div className="space-y-3">
        <p className="text-muted-foreground text-lg leading-relaxed">
          SNS에서 본 장소,
        </p>
        <p className="text-foreground text-xl font-medium leading-snug sm:text-2xl">
          이제는 잊지 마세요
        </p>
      </div>
      <p className="text-muted-foreground text-base leading-relaxed">
        저장부터 데이트까지 한 번에
      </p>
    </div>
  )
}
