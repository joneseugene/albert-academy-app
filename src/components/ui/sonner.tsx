"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useTheme } from "@/providers/theme-provider";

/**
 * App toaster. Mounted once in AppProviders; anywhere in client code call
 * `toast.success(...)` / `toast.error(...)` / `toast.promise(...)` from "sonner".
 */
function Toaster({ ...props }: ToasterProps) {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      position="top-right"
      richColors
      closeButton
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster };
