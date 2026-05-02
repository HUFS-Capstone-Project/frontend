type CopyableLinkBarProps = {
  url: string;
  copyLabel: string;
  onCopy: () => void;
};

export function CopyableLinkBar({ url, copyLabel, onCopy }: CopyableLinkBarProps) {
  return (
    <div className="border-border flex h-11 items-center gap-3 rounded-full border bg-white py-1.5 pr-1.5 pl-3">
      <p className="text-foreground min-w-0 flex-1 truncate text-sm">{url}</p>
      <button
        type="button"
        className="bg-muted text-foreground active:bg-muted/80 h-8 shrink-0 rounded-full px-4 text-sm font-medium transition-colors"
        onClick={onCopy}
      >
        {copyLabel}
      </button>
    </div>
  );
}
