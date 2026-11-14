"use client";

import { useMemo, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";

import { SwitchField, TextareaField, TextField } from "@/components/shared/form/fields";
import { FormActions, FormSection } from "@/components/shared/form/form-section";
import { ListField } from "@/components/shared/form/list-field";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useServerMutation } from "@/hooks/use-server-action";
import { draftLines, lyricsToDraft, songOrder } from "@/lib/lyrics";
import { usePermission } from "@/providers/session-provider";
import { updateSongAction } from "../actions";
import { songFormSchema, type Song, type SongFormValues } from "../schemas";
import { AudioPicker } from "./audio-picker";
import { LyricsSync } from "./lyrics-sync";

function toValues(song: Song): SongFormValues {
  const draft = lyricsToDraft(song.songLyrics);
  return {
    songTitle: song.songTitle ?? "",
    songCredits: song.songCredits ?? "",
    songAudioUrl: song.songAudioUrl ?? "",
    songVerses: (draft.verses.length ? draft.verses : [""]).map((text) => ({ text })),
    songChorus: draft.chorus,
    songRepeatChorus: draft.repeatChorus,
    songTimings: draft.times,
  };
}

export function SongForm({ song }: { song: Song }) {
  const canEdit = usePermission("school.update");
  const audioRef = useRef<HTMLAudioElement>(null);
  const initial = useMemo(() => toValues(song), [song]);
  const form = useForm<SongFormValues>({
    resolver: zodResolver(songFormSchema),
    defaultValues: initial,
    values: initial,
    disabled: !canEdit,
  });
  const save = useServerMutation(updateSongAction, { form, successMessage: "School song saved" });
  const c = form.control;

  const [verses, chorus, repeatChorus, timings, audioUrl] = useWatch({
    control: c,
    name: ["songVerses", "songChorus", "songRepeatChorus", "songTimings", "songAudioUrl"],
  });
  const lines = useMemo(
    () =>
      draftLines({
        verses: (verses ?? []).map((v) => v?.text ?? ""),
        chorus: chorus ?? "",
        repeatChorus: repeatChorus ?? true,
      }),
    [verses, chorus, repeatChorus],
  );

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid gap-6"
        onSubmit={form.handleSubmit((values) => save.mutate(values))}
      >
        <FormSection title="Song">
          <TextField
            control={c}
            name="songTitle"
            label="Title"
            placeholder="Albert Academy School Song"
          />
          <TextField
            control={c}
            name="songCredits"
            label="Credits"
            placeholder="e.g. Words: … · Music: …"
          />
        </FormSection>

        <FormSection title="Recording" description="Visitors play this on the website.">
          <div className="sm:col-span-2">
            <Controller
              control={c}
              name="songAudioUrl"
              render={({ field }) => (
                <AudioPicker value={field.value} onChange={field.onChange} audioRef={audioRef} />
              )}
            />
          </div>
        </FormSection>

        <FormSection
          title="Verses"
          description="Add each verse in the order it is sung, one lyric line per line."
        >
          <ListField
            control={c}
            name="songVerses"
            emptyRow={{ text: "" }}
            addLabel="Add verse"
            emptyText="No verses yet."
            disabled={!canEdit}
            renderRow={(index) => (
              <TextareaField
                control={c}
                name={`songVerses.${index}.text`}
                label={`Verse ${index + 1}`}
                rows={5}
              />
            )}
          />
        </FormSection>

        <FormSection title="Chorus" description="Written once; the website repeats it for you.">
          <TextareaField
            control={c}
            name="songChorus"
            label="Chorus"
            className="sm:col-span-2"
            rows={5}
          />
          <SwitchField
            control={c}
            name="songRepeatChorus"
            label="Sing the chorus after every verse"
            description="Turn off to sing it once, after the last verse."
            className="sm:col-span-2"
          />
        </FormSection>

        <FormSection
          title="Lyrics timing"
          description="Optional: makes the lyrics scroll exactly with the recording."
        >
          <div className="grid gap-3 sm:col-span-2">
            {lines.length > 0 && (
              <p className="text-sm">
                <span className="text-muted-foreground">Song order: </span>
                {songOrder(lines)}
              </p>
            )}
            {!canEdit ? null : audioUrl ? (
              <LyricsSync
                lines={lines}
                times={timings ?? []}
                audioRef={audioRef}
                onChange={(next) => form.setValue("songTimings", next, { shouldDirty: true })}
              />
            ) : (
              <p className="text-xs text-muted-foreground">
                Upload the recording to sync the lyrics with it.
              </p>
            )}
          </div>
        </FormSection>

        {canEdit && (
          <FormActions>
            <Button
              type="button"
              variant="outline"
              disabled={!form.formState.isDirty || save.isPending}
              onClick={() => form.reset(initial)}
            >
              Discard changes
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </FormActions>
        )}
      </form>
    </Form>
  );
}
