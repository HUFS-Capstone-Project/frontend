import { ChevronLeft, X } from "lucide-react";
import type { RefObject } from "react";
import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";

import { TwoButtonFooter } from "@/components/common/TwoButtonFooter";
import { EditPlaceResultCard } from "@/components/link-place/EditPlaceResultCard";
import { PlaceFlowCancelPillButton } from "@/components/place-flow/PlaceFlowCancelPillButton";
import { PlaceFlowHeadlines } from "@/components/place-flow/PlaceFlowHeadlines";
import { PlaceFlowOriginalLinkChipRow } from "@/components/place-flow/PlaceFlowOriginalLinkChipRow";
import { PlaceFlowSearchEmptyRow } from "@/components/place-flow/PlaceFlowSearchEmptyRow";
import { PlaceFlowSearchFieldRow } from "@/components/place-flow/PlaceFlowSearchFieldRow";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { BrandMarkerLoader } from "@/components/ui/BrandMarkerLoader";
import { PillButton } from "@/components/ui/PillButton";
import { PLACE_FLOW_COPY } from "@/features/place-flow/place-flow-copy";
import {
  PROMPT_FLOW_ALERT_IN_SCROLL_CLASS,
  PROMPT_FLOW_LIST_TOP_BORDER_CLASS,
} from "@/features/place-flow/prompt-flow-layout";
import { useInfiniteScrollTrigger } from "@/hooks/use-infinite-scroll-trigger";
import { cn } from "@/lib/utils";
import { MAP_INITIAL_CENTER } from "@/shared/config/map";
import type { LinkSourceType } from "@/shared/lib/link-source-type";
import type { MapCoordinate, SavedPlace } from "@/shared/types/map-home";

const KAKAO_MAP_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
const KakaoMapView = lazy(() =>
  import("@/components/map/KakaoMapView").then((module) => ({ default: module.KakaoMapView })),
);
export type PlaceSearchMapSheetMode = "intro" | "search";

type PlaceSearchMapSheetProps = {
  title: string;
  subtitle: string;
  linkUrl?: string | null;
  linkSourceType?: LinkSourceType | null;
  contentText?: string | null;
  initialMode?: PlaceSearchMapSheetMode;
  keyword: string;
  selectedPlaceId: string | null;
  searchResults: SavedPlace[];
  isSearching?: boolean;
  isFetchingNextSearchPage?: boolean;
  isSearchError?: boolean;
  hasNextSearchPage?: boolean;
  showEmptyResult?: boolean;
  saveError?: string | null;
  confirmLabel?: string;
  confirmPendingLabel?: string;
  collapsedResetLabel?: string;
  collapsedConfirmLabel?: string;
  isConfirmPending?: boolean;
  canConfirm: boolean;
  mapFallbackCenter?: MapCoordinate;
  onKeywordChange: (nextKeyword: string) => void;
  onSubmitSearch: () => void;
  onLoadMoreSearchResults?: () => void;
  onSelectPlace: (placeId: string) => void;
  onClearSelectedPlace?: () => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export function PlaceSearchMapSheet({
  title,
  subtitle,
  linkUrl,
  linkSourceType = null,
  contentText,
  initialMode = "intro",
  keyword,
  selectedPlaceId,
  searchResults,
  isSearching = false,
  isFetchingNextSearchPage = false,
  isSearchError = false,
  hasNextSearchPage = false,
  showEmptyResult = true,
  saveError = null,
  confirmLabel = "확인",
  confirmPendingLabel = PLACE_FLOW_COPY.saving,
  collapsedResetLabel = "다시 검색",
  collapsedConfirmLabel = "이 장소 선택",
  isConfirmPending = false,
  canConfirm,
  mapFallbackCenter = MAP_INITIAL_CENTER,
  onKeywordChange,
  onSubmitSearch,
  onLoadMoreSearchResults,
  onSelectPlace,
  onClearSelectedPlace,
  onCancel,
  onConfirm,
}: PlaceSearchMapSheetProps) {
  const [mode, setMode] = useState<PlaceSearchMapSheetMode>(initialMode);
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const previousSelectedPlaceIdRef = useRef<string | null>(selectedPlaceId);
  const trimmedKeyword = keyword.trim();
  const selectedPlace = searchResults.find((place) => place.id === selectedPlaceId) ?? null;
  const mapCenter = selectedPlace
    ? { latitude: selectedPlace.latitude, longitude: selectedPlace.longitude }
    : mapFallbackCenter;
  const selectedMapPlaces = selectedPlace ? [selectedPlace] : [];
  const content = normalizeContentText(contentText);

  useEffect(() => {
    if (mode !== "search" || isSearchCollapsed) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isSearchCollapsed, mode]);

  useEffect(() => {
    const previousSelectedPlaceId = previousSelectedPlaceIdRef.current;
    previousSelectedPlaceIdRef.current = selectedPlaceId;

    if (selectedPlaceId == null) {
      queueMicrotask(() => {
        setIsSearchCollapsed(false);
      });
      return;
    }

    if (mode === "search" && selectedPlaceId !== previousSelectedPlaceId) {
      queueMicrotask(() => {
        setIsSearchCollapsed(true);
      });
    }
  }, [mode, selectedPlaceId]);

  const handleBack = () => {
    if (mode === "search" && initialMode !== "search") {
      setMode("intro");
      onKeywordChange("");
      return;
    }

    onCancel();
  };

  const enterSearchMode = () => {
    setMode("search");
  };

  const handleKeywordChange = (nextKeyword: string) => {
    setIsSearchCollapsed(false);
    onKeywordChange(nextKeyword);
  };

  const handleSelectPlace = (placeId: string) => {
    if (selectedPlaceId === placeId) {
      onClearSelectedPlace?.();
      setIsSearchCollapsed(false);
      return;
    }

    onSelectPlace(placeId);
    setIsSearchCollapsed(true);
  };

  const handleResetCollapsedSearch = () => {
    setIsSearchCollapsed(false);
  };

  const isCollapsedSearchMode = mode === "search" && isSearchCollapsed && selectedPlace != null;

  return (
    <div className="bg-muted relative h-full min-h-0 overflow-hidden">
      <Suspense fallback={<div className="absolute inset-0" aria-hidden />}>
        <KakaoMapView
          appKey={KAKAO_MAP_APP_KEY}
          places={selectedMapPlaces}
          center={mapCenter}
          fitBoundsPlaces={selectedMapPlaces}
          viewportKey={`${mode}-${isSearchCollapsed ? "collapsed" : "expanded"}-${selectedPlaceId ?? trimmedKeyword}-${searchResults.length}`}
          selectedPlaceId={selectedPlaceId}
          onPlaceMarkerClick={(place) => handleSelectPlace(place.id)}
          className="absolute inset-0"
        />
      </Suspense>

      <BottomSheet
        open
        enableHistory={false}
        intrinsicPanelHeight={mode === "intro" || isCollapsedSearchMode}
        onClose={handleBack}
        className="pointer-events-none"
        overlayClassName="pointer-events-none bg-transparent"
        panelClassName={
          mode === "search" && !isCollapsedSearchMode
            ? "pointer-events-auto h-[min(88dvh,42rem)]"
            : "pointer-events-auto"
        }
        contentClassName={
          mode === "search" ? "flex min-h-0 flex-col pb-0" : "flex min-h-0 flex-col"
        }
      >
        {mode === "intro" ? (
          <IntroSheetContent
            title={title}
            subtitle={subtitle}
            linkUrl={linkUrl}
            linkSourceType={linkSourceType}
            content={content}
            onEnterSearch={enterSearchMode}
            onCancel={onCancel}
          />
        ) : isCollapsedSearchMode ? (
          <CollapsedSelectionContent
            selectedPlace={selectedPlace}
            canConfirm={canConfirm}
            resetLabel={collapsedResetLabel}
            confirmLabel={collapsedConfirmLabel}
            confirmPendingLabel={confirmPendingLabel}
            isConfirmPending={isConfirmPending}
            onReset={handleResetCollapsedSearch}
            onConfirm={onConfirm}
          />
        ) : (
          <SearchSheetContent
            keyword={keyword}
            trimmedKeyword={trimmedKeyword}
            searchResults={searchResults}
            selectedPlaceId={selectedPlaceId}
            isSearching={isSearching}
            isFetchingNextSearchPage={isFetchingNextSearchPage}
            isSearchError={isSearchError}
            hasNextSearchPage={hasNextSearchPage}
            showEmptyResult={showEmptyResult}
            saveError={saveError}
            canConfirm={canConfirm}
            confirmLabel={confirmLabel}
            confirmPendingLabel={confirmPendingLabel}
            isConfirmPending={isConfirmPending}
            inputRef={searchInputRef}
            onKeywordChange={handleKeywordChange}
            onSubmitSearch={onSubmitSearch}
            onLoadMoreSearchResults={onLoadMoreSearchResults}
            onSelectPlace={handleSelectPlace}
            onBack={handleBack}
            onConfirm={onConfirm}
          />
        )}
      </BottomSheet>
    </div>
  );
}

function CollapsedSelectionContent({
  selectedPlace,
  canConfirm,
  resetLabel,
  confirmLabel,
  confirmPendingLabel,
  isConfirmPending,
  onReset,
  onConfirm,
}: {
  selectedPlace: SavedPlace;
  canConfirm: boolean;
  resetLabel: string;
  confirmLabel: string;
  confirmPendingLabel: string;
  isConfirmPending: boolean;
  onReset: () => void;
  onConfirm: () => void;
}) {
  return (
    <section className="flex min-h-0 flex-col">
      <div className="px-6 pt-3">
        <ul className={PROMPT_FLOW_LIST_TOP_BORDER_CLASS}>
          <EditPlaceResultCard place={selectedPlace} selected onSelect={onReset} />
        </ul>
      </div>

      <TwoButtonFooter
        left={<PlaceFlowCancelPillButton onClick={onReset}>{resetLabel}</PlaceFlowCancelPillButton>}
        right={
          <PillButton
            type="button"
            variant={canConfirm ? "onboarding" : "onboardingMuted"}
            disabled={!canConfirm}
            onClick={onConfirm}
          >
            {isConfirmPending ? confirmPendingLabel : confirmLabel}
          </PillButton>
        }
      />
    </section>
  );
}

function IntroSheetContent({
  title,
  subtitle,
  linkUrl,
  linkSourceType,
  content,
  onEnterSearch,
  onCancel,
}: {
  title: string;
  subtitle: string;
  linkUrl?: string | null;
  linkSourceType?: LinkSourceType | null;
  content: string | null;
  onEnterSearch: () => void;
  onCancel: () => void;
}) {
  return (
    <section className="px-6 pt-8 pb-6">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <PlaceFlowHeadlines
            titleId="place-search-map-sheet-title"
            title={title}
            subtitle={subtitle}
          />
        </div>
        <button
          type="button"
          className="text-foreground hover:bg-muted/60 mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full transition-colors"
          aria-label="닫기"
          title="닫기"
          onClick={onCancel}
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      <div className="mt-6">
        <PlaceFlowSearchFieldRow
          id="manual-place-intro-search"
          value=""
          onChange={() => undefined}
          readOnly
          placeholder={PLACE_FLOW_COPY.searchPlaceholder}
          searchButtonLabel={PLACE_FLOW_COPY.searchButton}
          searchButtonDisabled={false}
          onClick={onEnterSearch}
          onFocus={onEnterSearch}
          onSubmitSearch={onEnterSearch}
        />
      </div>

      <div className="border-border mt-5 border-t pt-5">
        <LinkContentBlock
          key={`${content ?? ""}-${linkUrl?.trim() ?? ""}`}
          content={content}
          originalLinkUrl={linkUrl}
          linkSourceType={linkSourceType}
        />
      </div>
    </section>
  );
}

function SearchSheetContent({
  keyword,
  trimmedKeyword,
  searchResults,
  selectedPlaceId,
  isSearching,
  isFetchingNextSearchPage,
  isSearchError,
  hasNextSearchPage,
  showEmptyResult,
  saveError,
  canConfirm,
  confirmLabel,
  confirmPendingLabel,
  isConfirmPending,
  inputRef,
  onKeywordChange,
  onSubmitSearch,
  onLoadMoreSearchResults,
  onSelectPlace,
  onBack,
  onConfirm,
}: {
  keyword: string;
  trimmedKeyword: string;
  searchResults: SavedPlace[];
  selectedPlaceId: string | null;
  isSearching: boolean;
  isFetchingNextSearchPage: boolean;
  isSearchError: boolean;
  hasNextSearchPage: boolean;
  showEmptyResult: boolean;
  saveError: string | null;
  canConfirm: boolean;
  confirmLabel: string;
  confirmPendingLabel: string;
  isConfirmPending: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onKeywordChange: (nextKeyword: string) => void;
  onSubmitSearch: () => void;
  onLoadMoreSearchResults?: () => void;
  onSelectPlace: (placeId: string) => void;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useInfiniteScrollTrigger({
    enabled: hasNextSearchPage && !isSearching && !isFetchingNextSearchPage,
    rootRef: scrollRef,
    onLoadMore: () => {
      onLoadMoreSearchResults?.();
    },
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 px-5 pt-3 pb-4">
        <div className="flex min-h-11 items-center gap-2">
          <button
            type="button"
            className="text-foreground hover:bg-muted/60 flex size-10 shrink-0 items-center justify-center rounded-full transition-colors"
            aria-label="뒤로가기"
            onClick={onBack}
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <PlaceFlowSearchFieldRow
            id="place-search-map-sheet-search"
            value={keyword}
            onChange={onKeywordChange}
            placeholder={PLACE_FLOW_COPY.searchPlaceholder}
            searchButtonLabel={PLACE_FLOW_COPY.searchButton}
            searchButtonDisabled={trimmedKeyword.length === 0}
            onSubmitSearch={onSubmitSearch}
            inputRef={inputRef}
            className="min-h-10 min-w-0 flex-1"
          />
        </div>
      </header>

      <div ref={scrollRef} className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-6 pb-3">
        {trimmedKeyword ? (
          <ul className={PROMPT_FLOW_LIST_TOP_BORDER_CLASS}>
            {searchResults.length === 0 && !isSearching && showEmptyResult ? (
              <PlaceFlowSearchEmptyRow />
            ) : (
              searchResults.map((place) => (
                <EditPlaceResultCard
                  key={place.id}
                  place={place}
                  selected={selectedPlaceId === place.id}
                  onSelect={() => onSelectPlace(place.id)}
                />
              ))
            )}
            <div ref={loadMoreRef} className="h-1" aria-hidden />
          </ul>
        ) : null}

        {isSearching || isFetchingNextSearchPage ? (
          <div className="flex justify-center px-5 py-8">
            <BrandMarkerLoader />
          </div>
        ) : null}

        {saveError ? (
          <p className={PROMPT_FLOW_ALERT_IN_SCROLL_CLASS} role="alert">
            {saveError}
          </p>
        ) : null}

        {isSearchError ? (
          <p className={PROMPT_FLOW_ALERT_IN_SCROLL_CLASS} role="alert">
            검색 결과를 불러오지 못했어요. 다시 시도해 주세요.
          </p>
        ) : null}
      </div>

      <TwoButtonFooter
        left={
          <PlaceFlowCancelPillButton onClick={onBack}>
            {PLACE_FLOW_COPY.cancel}
          </PlaceFlowCancelPillButton>
        }
        right={
          <PillButton
            type="button"
            variant={canConfirm ? "onboarding" : "onboardingMuted"}
            disabled={!canConfirm}
            onClick={onConfirm}
          >
            {isConfirmPending ? confirmPendingLabel : confirmLabel}
          </PillButton>
        }
      />
    </div>
  );
}

function LinkContentBlock({
  content,
  originalLinkUrl,
  linkSourceType,
  className,
}: {
  content: string | null;
  /** 원본 링크가 있으면 CONTENT 라벨 오른쪽에 「원본 보기」 칩 */
  originalLinkUrl?: string | null;
  linkSourceType?: LinkSourceType | null;
  className?: string;
}) {
  const bodyRef = useRef<HTMLParagraphElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const labelClassName = "text-muted-foreground text-xs font-semibold tracking-wide uppercase";

  const trimmedOriginalLink = originalLinkUrl?.trim() ?? "";
  const showOriginalChip = trimmedOriginalLink.length > 0;

  const labelRow = (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <p className={cn(labelClassName, "shrink-0")}>{PLACE_FLOW_COPY.contentSectionLabel}</p>
      {showOriginalChip ? (
        <PlaceFlowOriginalLinkChipRow
          linkUrl={trimmedOriginalLink}
          linkSourceType={linkSourceType}
          className="min-w-0 shrink"
        />
      ) : null}
    </div>
  );

  useLayoutEffect(() => {
    const element = bodyRef.current;
    if (!content || !element) {
      return;
    }

    if (expanded) {
      return;
    }

    const measure = () => {
      setHasOverflow(element.scrollHeight > element.clientHeight);
    };

    measure();

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            measure();
          })
        : null;
    observer?.observe(element);

    return () => {
      observer?.disconnect();
    };
  }, [content, expanded]);

  if (!content) {
    return (
      <div className={cn(className)}>
        {labelRow}
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          {PLACE_FLOW_COPY.contentEmptyHint}
        </p>
      </div>
    );
  }

  return (
    <div className={cn(className)}>
      {labelRow}
      <p
        ref={bodyRef}
        className={cn(
          "text-foreground mt-2 text-sm leading-relaxed whitespace-pre-wrap",
          !expanded && "line-clamp-4",
          expanded && "scrollbar-hide max-h-[min(40dvh,18rem)] overflow-y-auto",
        )}
      >
        {content}
      </p>

      {hasOverflow || expanded ? (
        <button
          type="button"
          className="text-primary hover:text-primary/75 mt-1 inline p-0 text-sm leading-snug font-normal transition-colors"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "접기" : "더보기"}
        </button>
      ) : null}
    </div>
  );
}

function normalizeContentText(contentText: string | null | undefined): string | null {
  if (typeof contentText !== "string") {
    return null;
  }

  const trimmed = contentText.trim();
  return trimmed.length > 0 ? trimmed : null;
}
