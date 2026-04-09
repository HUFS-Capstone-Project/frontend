import { Loader2 } from "lucide-react";

import { PillButton } from "@/components/ui/PillButton";
import { cn } from "@/lib/utils";

import { GoogleBrandLogo } from "./GoogleBrandLogo";

export type GoogleLoginButtonProps = {
  isLoading: boolean;
  onContinue: () => void;
};

export function GoogleLoginButton({
  isLoading,
  onContinue,
}: GoogleLoginButtonProps) {
  return (
    <PillButton
      type="button"
      variant="outline"
      className={cn("relative justify-center")}
      disabled={isLoading}
      aria-busy={isLoading}
      aria-label="Google 계정으로 로그인"
      onClick={onContinue}
    >
      <span
        className="absolute start-4 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center"
        aria-hidden
      >
        {isLoading ? (
          <Loader2
            aria-hidden
            className="size-[1.125rem] animate-spin text-muted-foreground"
          />
        ) : (
          <GoogleBrandLogo className="size-[1.125rem]" />
        )}
      </span>
      <span className="block w-full ps-14 pe-4 text-center text-foreground">
        {isLoading ? "구글로 이동 중…" : "구글 계정으로 시작"}
      </span>
    </PillButton>
  );
}
