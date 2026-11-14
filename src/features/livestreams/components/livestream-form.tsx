"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2Icon, CircleAlertIcon } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { FormFooter } from "@/components/shared/crud/form-footer";
import { ImageField, SelectField, SwitchField, TextField } from "@/components/shared/form/fields";
import { FormSection } from "@/components/shared/form/form-section";
import { RichTextField } from "@/components/shared/rich-text/rich-text-field";
import { LivePlayer, PlatformMark } from "@/components/site/live-player";
import { Form } from "@/components/ui/form";
import { routes } from "@/config/routes";
import { useServerMutation } from "@/hooks/use-server-action";
import {
  parseStreamUrl,
  STREAM_PLATFORMS,
  STREAM_STATUSES,
  supportedOptions,
} from "@/lib/livestream";
import { createLivestreamAction, updateLivestreamAction } from "../actions";
import { livestreamFormSchema, type Livestream, type LivestreamFormValues } from "../schemas";

/** Stored instant -> "YYYY-MM-DDTHH:mm" in school time (Freetown = GMT). */
const toLocal = (d: Date | null) => (d ? d.toISOString().slice(0, 16) : "");

export function LivestreamForm({ stream }: { stream?: Livestream }) {
  const initial: LivestreamFormValues = {
    title: stream?.title ?? "",
    sourceUrl: stream?.sourceUrl ?? "",
    status: stream?.status ?? "scheduled",
    startsAt: toLocal(stream?.startsAt ?? null),
    endsAt: toLocal(stream?.endsAt ?? null),
    description: stream?.description ?? "",
    photoUrl: stream?.photoUrl ?? "",
    isFeatured: stream?.isFeatured ?? true,
    showReplay: stream?.showReplay ?? true,
    autoplay: stream?.autoplay ?? true,
    startMuted: stream?.startMuted ?? true,
    showControls: stream?.showControls ?? true,
    showChat: stream?.showChat ?? false,
    privacyMode: stream?.privacyMode ?? false,
  };
  const form = useForm<LivestreamFormValues>({
    resolver: zodResolver(livestreamFormSchema),
    defaultValues: initial,
    values: stream ? initial : undefined,
  });
  const c = form.control;

  const create = useServerMutation(createLivestreamAction, {
    form,
    successMessage: "Live stream added",
  });
  const update = useServerMutation(updateLivestreamAction, {
    form,
    successMessage: "Live stream saved",
  });

  const [title, sourceUrl, autoplay, startMuted, showControls, showChat, privacyMode] = useWatch({
    control: c,
    name: [
      "title",
      "sourceUrl",
      "autoplay",
      "startMuted",
      "showControls",
      "showChat",
      "privacyMode",
    ],
  });
  const parsed = useMemo(() => parseStreamUrl(sourceUrl ?? ""), [sourceUrl]);
  const supported = supportedOptions(parsed);
  const platformName = parsed.ok ? STREAM_PLATFORMS[parsed.platform] : null;
  const notOn = (ok: boolean, extra = "") =>
    ok ? undefined : parsed.ok ? `Not available for ${platformName}${extra}.` : undefined;

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid gap-6"
        onSubmit={form.handleSubmit((values) =>
          stream ? update.mutate({ ...values, id: stream.id }) : create.mutate(values),
        )}
      >
        <FormSection
          title="Stream"
          description="Paste the link to the live video and the website builds the player for you."
        >
          <TextField control={c} name="title" label="Title" required className="sm:col-span-2" />
          <div className="grid gap-2 sm:col-span-2">
            <TextField
              control={c}
              name="sourceUrl"
              label="YouTube or Facebook link"
              required
              placeholder="https://www.youtube.com/live/… or https://www.facebook.com/…/videos/…"
            />
            {sourceUrl?.trim() && (
              <p
                className={
                  parsed.ok
                    ? "flex items-center gap-1.5 text-xs text-muted-foreground"
                    : "flex items-center gap-1.5 text-xs text-destructive"
                }
              >
                {parsed.ok ? (
                  <>
                    <PlatformMark platform={parsed.platform} />
                    <CheckCircle2Icon className="size-3.5 text-success" />
                    {parsed.platform === "youtube"
                      ? parsed.kind === "channel"
                        ? "YouTube channel: always shows the channel's current live stream"
                        : "YouTube video"
                      : "Facebook video"}
                  </>
                ) : (
                  <>
                    <CircleAlertIcon className="size-3.5" /> {parsed.error}
                  </>
                )}
              </p>
            )}
          </div>
          <SelectField
            control={c}
            name="status"
            label="Status"
            required
            description="Switch to “Live now” when the broadcast starts (also from the list)."
            options={Object.entries(STREAM_STATUSES).map(([value, label]) => ({ value, label }))}
          />
          <div className="hidden sm:block" />
          <TextField
            control={c}
            name="startsAt"
            label="Starts"
            type="datetime-local"
            description="School time (GMT). Needed for upcoming streams."
          />
          <TextField
            control={c}
            name="endsAt"
            label="Ends"
            type="datetime-local"
            description="Optional."
          />
          <SwitchField
            control={c}
            name="isFeatured"
            label="Announce on the home page"
            description="A banner while it's upcoming or live."
          />
          <SwitchField
            control={c}
            name="showReplay"
            label="Keep as a replay"
            description="Stays on the website after it ends."
          />
        </FormSection>

        <FormSection title="Player settings" description="How the video behaves on the website.">
          <SwitchField
            control={c}
            name="autoplay"
            label="Autoplay"
            description="Start playing when the page opens."
          />
          <SwitchField
            control={c}
            name="startMuted"
            label="Start muted"
            description="Browsers only autoplay muted video; visitors tap to unmute."
          />
          <SwitchField
            control={c}
            name="showControls"
            label="Show player controls"
            disabled={!supported.showControls && parsed.ok}
            description={notOn(supported.showControls) ?? "Play, volume and fullscreen buttons."}
          />
          <SwitchField
            control={c}
            name="showChat"
            label="Show live chat"
            disabled={!supported.showChat && parsed.ok}
            description={
              notOn(
                supported.showChat,
                parsed.ok && parsed.platform === "youtube" ? " channel links" : "",
              ) ?? "YouTube's live chat beside the video."
            }
          />
          <SwitchField
            control={c}
            name="privacyMode"
            label="Privacy-enhanced mode"
            disabled={!supported.privacyMode && parsed.ok}
            description={
              notOn(supported.privacyMode) ??
              "YouTube doesn't store visitor info until they play the video."
            }
          />
        </FormSection>

        <FormSection title="Preview" description="Exactly what visitors will see.">
          <div className="sm:col-span-2">
            {parsed.ok ? (
              <LivePlayer
                sourceUrl={sourceUrl}
                title={title || "Live stream"}
                options={{
                  autoplay: false, // never blast audio in the admin
                  startMuted,
                  showControls: supported.showControls ? showControls : true,
                  showChat: supported.showChat && showChat,
                  privacyMode: supported.privacyMode && privacyMode,
                }}
              />
            ) : (
              <p className="rounded-md border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                Paste a YouTube or Facebook link to see the player.
              </p>
            )}
            {parsed.ok && autoplay && (
              <p className="mt-2 text-xs text-muted-foreground">
                Autoplay is paused in this preview; it applies on the website.
              </p>
            )}
          </div>
        </FormSection>

        <FormSection title="Details">
          <RichTextField
            control={c}
            name="description"
            label="Description"
            variant="basic"
            maxLength={5000}
            className="sm:col-span-2"
          />
          <ImageField
            control={c}
            name="photoUrl"
            label="Cover image"
            description="Optional. Shown before the stream starts and in lists. YouTube videos use their own thumbnail otherwise."
            folder="livestreams"
            className="sm:col-span-2"
          />
        </FormSection>

        <FormFooter
          cancelHref={routes.livestreams}
          pending={create.isPending || update.isPending}
          editing={Boolean(stream)}
          createLabel="Add live stream"
        />
      </form>
    </Form>
  );
}
