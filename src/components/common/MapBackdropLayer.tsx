import type { ReactNode } from "react";

type MapBackdropLayerProps = {
  children: ReactNode;
};

export function MapBackdropLayer({ children }: MapBackdropLayerProps) {
  return <div className="absolute inset-0 z-0">{children}</div>;
}
