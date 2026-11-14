"use client";

import { useRef, useState } from "react";
import { Loader2Icon, MusicIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useServerMutation } from "@/hooks/use-server-action";
import { createSongUploadAction } from "../actions";
import { AUDIO_ACCEPT, MAX_AUDIO_BYTES } from "../schemas";

/** PUT with progress (fetch has no upload progress). */
function putWithProgress(url: string, file: File, onProgress: (pct: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("content-type", file.type);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress((e.loaded / e.total) * 100);
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(xhr.responseText));
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(file);
  });
}

/** Upload the song recording straight to storage; hands back its public URL. */
export function AudioPicker({
  value,
  onChange,
  audioRef,
}: {
  value: string;
  onChange: (url: string) => void;
  /** The preview <audio>, shared with the lyrics sync tool. */
  audioRef: React.RefObject<HTMLAudioElement | null>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const prepare = useServerMutation(createSongUploadAction);

  async function onFile(file: File | undefined) {
    if (input.current) input.current.value = "";
    if (!file) return;
    if (!file.type.startsWith("audio/")) return toast.error("Choose an audio file (MP3, M4A…)");
    if (file.size > MAX_AUDIO_BYTES) return toast.error("Use an audio file under 30 MB");
    try {
      setProgress(0);
      const { uploadUrl, publicUrl } = await prepare.mutateAsync({
        fileName: file.name,
        contentType: file.type,
        size: file.size,
      });
      await putWithProgress(uploadUrl, file, setProgress);
      onChange(publicUrl);
      toast.success("Recording uploaded. Save to publish it");
    } catch {
      toast.error("The upload didn't finish. Please try again.");
    } finally {
      setProgress(null);
    }
  }

  const uploading = progress !== null;

  return (
    <div className="grid gap-3">
      {value ? (
        <audio ref={audioRef} src={value} controls preload="metadata" className="w-full" />
      ) : (
        <div className="flex items-center gap-3 rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground">
          <MusicIcon className="size-5" aria-hidden /> No recording yet.
        </div>
      )}
      {uploading && (
        <div className="grid gap-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground tabular-nums">
            Uploading… {Math.round(progress)}%
          </p>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => input.current?.click()}
        >
          {uploading ? <Loader2Icon className="animate-spin" /> : <UploadIcon />}
          {value ? "Replace recording" : "Upload recording"}
        </Button>
        {value && !uploading && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
            <Trash2Icon /> Remove
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">MP3, M4A, AAC, OGG or WAV, up to 30 MB.</p>
      <input
        ref={input}
        type="file"
        accept={AUDIO_ACCEPT}
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  );
}
