"use client";

import { useRef, type Ref } from "react";
import { ImageIcon, ImageUpIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { uploadImageAction } from "@/features/media/actions";
import { useServerMutation } from "@/hooks/use-server-action";
import { IMAGE_ACCEPT, MAX_IMAGE_BYTES, type ImageFolder } from "@/lib/images";
import { cn } from "@/lib/utils";
import { Thumbnail } from "./thumbnail";

export type { ImageFolder };

type Props = {
  /** Current image URL ("" = none). */
  value: string;
  onChange: (url: string) => void;
  folder: ImageFolder;
  /** "portrait" for people, "landscape" for news/gallery, "square" for logos. */
  shape?: "portrait" | "landscape" | "square";
  disabled?: boolean;
  ref?: Ref<HTMLButtonElement>;
};

const SHAPES = {
  portrait: "aspect-[4/5] w-32",
  landscape: "aspect-video w-full max-w-sm",
  square: "aspect-square w-32",
};

/** Pick an image, upload it straight away, and hand back its URL. */
export function ImagePicker({
  value,
  onChange,
  folder,
  shape = "landscape",
  disabled,
  ref,
}: Props) {
  const input = useRef<HTMLInputElement>(null);
  const upload = useServerMutation(uploadImageAction, {
    onSuccess: ({ url }) => onChange(url),
  });

  function onFile(file: File | undefined) {
    if (input.current) input.current.value = ""; // allow re-picking the same file
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error(`That image is too large. Use one under ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`);
      return;
    }
    const form = new FormData();
    form.set("file", file);
    form.set("folder", folder);
    upload.mutate(form);
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-md border bg-muted",
          SHAPES[shape],
        )}
      >
        {value ? (
          <Thumbnail src={value} alt="" className="size-full rounded-none border-0" />
        ) : (
          <ImageIcon className="size-8 text-muted-foreground" aria-hidden />
        )}
        {upload.isPending && (
          <span className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2Icon className="size-6 animate-spin text-primary" aria-label="Uploading" />
          </span>
        )}
      </div>
      <div className="grid gap-2">
        <div className="flex flex-wrap gap-2">
          <Button
            ref={ref}
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || upload.isPending}
            onClick={() => input.current?.click()}
          >
            <ImageUpIcon />
            {upload.isPending ? "Uploading…" : value ? "Change photo" : "Upload photo"}
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || upload.isPending}
              onClick={() => onChange("")}
            >
              <Trash2Icon /> Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          PNG, JPEG or WebP, up to {MAX_IMAGE_BYTES / 1024 / 1024} MB.
        </p>
      </div>
      <input
        ref={input}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  );
}
