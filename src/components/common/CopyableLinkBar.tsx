type CopyableLinkBarProps = {
  url: string;
};

export function CopyableLinkBar({ url }: CopyableLinkBarProps) {
  return (
    <div className="border-border flex h-11 items-center rounded-full border bg-white px-3 py-1.5">
      <p className="text-foreground min-w-0 flex-1 truncate text-sm">{url}</p>
    </div>
  );
}
