import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, User } from "lucide-react";
import { useCallback, useState } from "react";

import { ListTopBar } from "@/components/common/ListTopBar";
import {
  NICKNAME_MAX_LENGTH,
  NicknameInputSection,
  normalizeNickname,
  OnboardingButton,
  OnboardingContent,
  onboardingContentClassName,
  OnboardingFooter,
  OnboardingLayout,
  OnboardingTitle,
} from "@/features/onboarding";
import { isApiError } from "@/shared/api/axios";
import { SHELL_CONTENT_FADE_SECONDS } from "@/shared/config/ui-timing";

type MyProfileInfoPageProps = {
  nickname: string;
  email: string | null;
  profileImageUrl?: string | null;
  isUpdatingNickname?: boolean;
  onBack: () => void;
  onUpdateNickname: (nickname: string) => Promise<void>;
};

const PROFILE_PAGE_CONTENT_PADDING_CLASS = "px-4 pb-[max(1rem,env(safe-area-inset-bottom))]";
const PROFILE_PAGE_FADE_VARIANT = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
} as const;
const PROFILE_PAGE_FADE_TRANSITION = {
  duration: SHELL_CONTENT_FADE_SECONDS,
  ease: "easeOut" as const,
};

export function MyProfileInfoPage({
  nickname,
  email,
  profileImageUrl,
  isUpdatingNickname = false,
  onBack,
  onUpdateNickname,
}: MyProfileInfoPageProps) {
  const url = profileImageUrl?.trim() ?? "";
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [view, setView] = useState<"info" | "edit-name">("info");
  const [draftNickname, setDraftNickname] = useState(nickname);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const showImage = Boolean(url) && failedUrl !== url;
  const trimmedDraftNickname = normalizeNickname(draftNickname);
  const canSubmitNickname =
    trimmedDraftNickname.length > 0 &&
    trimmedDraftNickname.length <= NICKNAME_MAX_LENGTH &&
    draftNickname.length <= NICKNAME_MAX_LENGTH;

  const handleImageError = useCallback(() => {
    setFailedUrl(url);
  }, [url]);

  const handleStartEdit = () => {
    setDraftNickname(nickname);
    setNicknameError(null);
    setView("edit-name");
  };

  const handleBackToInfo = () => {
    setDraftNickname(nickname);
    setNicknameError(null);
    setView("info");
  };

  const handleSubmitNickname = async () => {
    const nextNickname = normalizeNickname(draftNickname);

    if (nextNickname.length === 0) {
      setNicknameError("닉네임을 입력해 주세요");
      return;
    }

    if (nextNickname.length > NICKNAME_MAX_LENGTH) {
      setNicknameError(`닉네임은 최대 ${NICKNAME_MAX_LENGTH}자까지 가능합니다.`);
      return;
    }

    if (nextNickname === normalizeNickname(nickname)) {
      setView("info");
      return;
    }

    try {
      setNicknameError(null);
      await onUpdateNickname(nextNickname);
      setView("info");
    } catch (error) {
      setNicknameError(isApiError(error) ? error.message : "닉네임 변경에 실패했습니다.");
    }
  };

  const editNameView = (
    <OnboardingLayout className={`relative ${PROFILE_PAGE_CONTENT_PADDING_CLASS}`}>
      <ListTopBar
        variant="plain"
        title={null}
        trailing={null}
        backLabel="내 정보로 돌아가기"
        onBack={handleBackToInfo}
        className="pointer-events-none absolute inset-x-0 top-0 z-10"
        backButtonClassName="pointer-events-auto"
      />

      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmitNickname || isUpdatingNickname) return;
          void handleSubmitNickname();
        }}
      >
        <OnboardingContent className={onboardingContentClassName.nickname}>
          <OnboardingTitle firstLineRest="에서 사용할" secondLine="닉네임을 변경해 주세요" />
          <NicknameInputSection
            label="닉네임"
            value={draftNickname}
            onChange={(nextValue) => {
              setDraftNickname(nextValue);
              if (nicknameError) setNicknameError(null);
            }}
            onClear={() => {
              setDraftNickname("");
              if (nicknameError) setNicknameError(null);
            }}
            maxLength={NICKNAME_MAX_LENGTH}
            autoFocus
          />

          <div className="min-h-5">
            {nicknameError ? <p className="text-destructive text-sm">{nicknameError}</p> : null}
          </div>

          <OnboardingFooter>
            <OnboardingButton
              type="submit"
              active={canSubmitNickname && !isUpdatingNickname}
              disabled={!canSubmitNickname || isUpdatingNickname}
            />
          </OnboardingFooter>
        </OnboardingContent>
      </form>
    </OnboardingLayout>
  );

  const infoView = (
    <main className="scrollbar-hide bg-background min-h-0 flex-1 overflow-y-auto">
      <ListTopBar
        title={`${nickname}님의 정보`}
        trailing={null}
        variant="sticky"
        backLabel="마이페이지로 돌아가기"
        onBack={onBack}
      />

      <div className="flex justify-center px-4 pt-10 pb-7">
        {showImage ? (
          <img
            src={url}
            alt=""
            className="size-20 rounded-full object-cover"
            referrerPolicy="no-referrer"
            onError={handleImageError}
          />
        ) : (
          <span
            className="bg-muted text-muted-foreground flex size-20 items-center justify-center rounded-full"
            aria-hidden
          >
            <User className="size-8" strokeWidth={2} />
          </span>
        )}
      </div>

      <div className="space-y-1 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={handleStartEdit}
          className="active:bg-muted/60 flex min-h-12 w-full items-center gap-3 rounded-xl py-1.5 text-left transition-colors"
        >
          <span className="text-foreground w-16 text-[0.95rem] font-semibold">이름</span>
          <span className="text-muted-foreground min-w-0 flex-1 truncate text-right text-[0.95rem] font-medium">
            {nickname}
          </span>
          <ChevronRight className="text-muted-foreground/55 size-4 shrink-0" aria-hidden />
        </button>

        <div className="flex min-h-12 items-center gap-3 py-1.5">
          <span className="text-foreground w-16 text-[0.95rem] font-semibold">이메일</span>
          <span className="text-muted-foreground min-w-0 flex-1 truncate text-right text-[0.95rem] font-medium">
            {email?.trim() ? email : "없음"}
          </span>
        </div>
      </div>
    </main>
  );

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={view}
        className="flex min-h-0 flex-1 flex-col"
        {...PROFILE_PAGE_FADE_VARIANT}
        transition={PROFILE_PAGE_FADE_TRANSITION}
      >
        {view === "edit-name" ? editNameView : infoView}
      </motion.div>
    </AnimatePresence>
  );
}
