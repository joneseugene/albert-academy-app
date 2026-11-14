"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  Heading2Icon,
  Heading3Icon,
  ImagePlusIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  Loader2Icon,
  MinusIcon,
  PilcrowIcon,
  QuoteIcon,
  Redo2Icon,
  RemoveFormattingIcon,
  StrikethroughIcon,
  UnderlineIcon,
  Undo2Icon,
  UnlinkIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { uploadImageAction } from "@/features/media/actions";
import { useServerMutation } from "@/hooks/use-server-action";
import { IMAGE_ACCEPT, MAX_IMAGE_BYTES, type ImageFolder } from "@/lib/images";
import { toRichHtml } from "@/lib/rich-text";
import { cn } from "@/lib/utils";

export type RichTextEditorProps = {
  /** Stored HTML (legacy plain text is upgraded on load). */
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  /**
   * "full": headings, lists, quotes, alignment, images…
   * "basic": inline formatting, lists and links — for short summaries.
   */
  variant?: "full" | "basic";
  /** Enables the image button; uploads go to this folder. */
  imageFolder?: ImageFolder;
  /** Visible-character limit, shown as a counter. */
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  "aria-describedby"?: string;
};

/** WYSIWYG editor (Tiptap) that reads and writes HTML. */
export function RichTextEditor({
  value,
  onChange,
  onBlur,
  variant = "full",
  imageFolder,
  maxLength,
  placeholder,
  disabled,
  invalid,
  id,
  "aria-describedby": describedBy,
}: RichTextEditorProps) {
  const full = variant === "full";
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    content: toRichHtml(value),
    extensions: [
      StarterKit.configure({
        heading: full ? { levels: [2, 3] } : false,
        blockquote: full ? {} : false,
        horizontalRule: full ? {} : false,
        codeBlock: false,
        code: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
        },
      }),
      ...(full ? [TextAlign.configure({ types: ["heading", "paragraph"] })] : []),
      ...(full && imageFolder ? [Image.configure({ HTMLAttributes: { loading: "lazy" } })] : []),
      Placeholder.configure({ placeholder: placeholder ?? "Start writing…" }),
      CharacterCount,
    ],
    editorProps: {
      attributes: {
        class: cn(
          "rich-text min-h-full px-3.5 py-3 text-sm outline-none",
          full ? "min-h-48" : "min-h-24",
        ),
        ...(id ? { id } : {}),
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
        "aria-multiline": "true",
        role: "textbox",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
    onBlur: () => onBlur?.(),
  });

  // Follow outside changes (form reset, record switch) without fighting the typing.
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (!value && editor.isEmpty) return;
    if (value === editor.getHTML()) return;
    editor.commands.setContent(toRichHtml(value), { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  const characters =
    useEditorState({
      editor,
      selector: ({ editor }) => editor?.storage.characterCount.characters() ?? 0,
    }) ?? 0;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border bg-background transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        invalid && "border-destructive focus-within:ring-destructive/20",
        disabled && "opacity-60",
      )}
    >
      {editor && !disabled && <Toolbar editor={editor} full={full} imageFolder={imageFolder} />}
      <div
        className={cn("overflow-y-auto", full ? "max-h-128" : "max-h-64")}
        onClick={() => editor?.commands.focus()}
      >
        {editor ? (
          <EditorContent editor={editor} />
        ) : (
          <div className={cn("px-3.5 py-3", full ? "min-h-48" : "min-h-24")} />
        )}
      </div>
      {maxLength !== undefined && (
        <div
          className={cn(
            "border-t px-3 py-1.5 text-right text-[11px] text-muted-foreground tabular-nums",
            characters > maxLength && "text-destructive",
          )}
        >
          {characters.toLocaleString()} / {maxLength.toLocaleString()}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Toolbar({
  editor,
  full,
  imageFolder,
}: {
  editor: Editor;
  full: boolean;
  imageFolder?: ImageFolder;
}) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      paragraph: e.isActive("paragraph"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      align: (["left", "center", "right", "justify"] as const).find((a) =>
        e.isActive({ textAlign: a }),
      ),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
  const chain = () => editor.chain().focus();

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 px-1.5 py-1"
    >
      {full && (
        <>
          <Tool
            label="Paragraph"
            active={s.paragraph && !s.bullet && !s.ordered && !s.quote}
            onClick={() => chain().setParagraph().run()}
          >
            <PilcrowIcon />
          </Tool>
          <Tool
            label="Heading"
            active={s.h2}
            onClick={() => chain().toggleHeading({ level: 2 }).run()}
          >
            <Heading2Icon />
          </Tool>
          <Tool
            label="Subheading"
            active={s.h3}
            onClick={() => chain().toggleHeading({ level: 3 }).run()}
          >
            <Heading3Icon />
          </Tool>
          <Divider />
        </>
      )}

      <Tool label="Bold (Ctrl+B)" active={s.bold} onClick={() => chain().toggleBold().run()}>
        <BoldIcon />
      </Tool>
      <Tool label="Italic (Ctrl+I)" active={s.italic} onClick={() => chain().toggleItalic().run()}>
        <ItalicIcon />
      </Tool>
      <Tool
        label="Underline (Ctrl+U)"
        active={s.underline}
        onClick={() => chain().toggleUnderline().run()}
      >
        <UnderlineIcon />
      </Tool>
      <Tool label="Strikethrough" active={s.strike} onClick={() => chain().toggleStrike().run()}>
        <StrikethroughIcon />
      </Tool>
      <LinkTool editor={editor} active={s.link} />
      <Divider />

      <Tool
        label="Bulleted list"
        active={s.bullet}
        onClick={() => chain().toggleBulletList().run()}
      >
        <ListIcon />
      </Tool>
      <Tool
        label="Numbered list"
        active={s.ordered}
        onClick={() => chain().toggleOrderedList().run()}
      >
        <ListOrderedIcon />
      </Tool>

      {full && (
        <>
          <Tool label="Quote" active={s.quote} onClick={() => chain().toggleBlockquote().run()}>
            <QuoteIcon />
          </Tool>
          <Tool label="Divider line" onClick={() => chain().setHorizontalRule().run()}>
            <MinusIcon />
          </Tool>
          <Divider />
          {(
            [
              ["left", "Align left", AlignLeftIcon],
              ["center", "Center", AlignCenterIcon],
              ["right", "Align right", AlignRightIcon],
              ["justify", "Justify", AlignJustifyIcon],
            ] as const
          ).map(([align, label, Icon]) => (
            <Tool
              key={align}
              label={label}
              active={s.align === align}
              onClick={() => chain().setTextAlign(align).run()}
            >
              <Icon />
            </Tool>
          ))}
          {imageFolder && (
            <>
              <Divider />
              <ImageTool editor={editor} folder={imageFolder} />
            </>
          )}
        </>
      )}

      <Divider />
      <Tool label="Clear formatting" onClick={() => chain().unsetAllMarks().clearNodes().run()}>
        <RemoveFormattingIcon />
      </Tool>
      <span className="ml-auto flex">
        <Tool label="Undo (Ctrl+Z)" disabled={!s.canUndo} onClick={() => chain().undo().run()}>
          <Undo2Icon />
        </Tool>
        <Tool label="Redo (Ctrl+Y)" disabled={!s.canRedo} onClick={() => chain().redo().run()}>
          <Redo2Icon />
        </Tool>
      </span>
    </div>
  );
}

function Tool({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // keep the editor selection
      onClick={onClick}
      className={cn(
        "size-7 text-muted-foreground [&_svg]:size-4",
        active && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
      )}
    >
      {children}
    </Button>
  );
}

const Divider = () => <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />;

function LinkTool({ editor, active }: { editor: Editor; active: boolean }) {
  const [open, setOpen] = useState(false);
  const [href, setHref] = useState("");

  const apply = () => {
    const url = href.trim();
    const chain = editor.chain().focus().extendMarkRange("link");
    if (!url) chain.unsetLink().run();
    else {
      const full = /^(https?:|mailto:|tel:)/i.test(url) ? url : `https://${url}`;
      if (editor.state.selection.empty && !active) {
        chain
          .insertContent({
            type: "text",
            text: url,
            marks: [{ type: "link", attrs: { href: full } }],
          })
          .run();
      } else chain.setLink({ href: full }).run();
    }
    setOpen(false);
  };

  return (
    <>
      <Popover
        open={open}
        onOpenChange={(o) => {
          if (o) setHref((editor.getAttributes("link").href as string | undefined) ?? "");
          setOpen(o);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            title="Link"
            aria-label="Link"
            aria-pressed={active}
            onMouseDown={(e) => e.preventDefault()}
            className={cn(
              "size-7 text-muted-foreground [&_svg]:size-4",
              active && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
            )}
          >
            <LinkIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="grid w-80 gap-2 p-3">
          <label className="text-xs font-medium" htmlFor="rte-link">
            Link address
          </label>
          <Input
            id="rte-link"
            autoFocus
            value={href}
            placeholder="https://example.com"
            onChange={(e) => setHref(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                apply();
              }
            }}
          />
          <div className="flex justify-end gap-2">
            {active && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  editor.chain().focus().extendMarkRange("link").unsetLink().run();
                  setOpen(false);
                }}
              >
                <UnlinkIcon /> Remove
              </Button>
            )}
            <Button type="button" size="sm" onClick={apply}>
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}

function ImageTool({ editor, folder }: { editor: Editor; folder: ImageFolder }) {
  const input = useRef<HTMLInputElement>(null);
  const upload = useServerMutation(uploadImageAction, {
    onSuccess: ({ url }) => editor.chain().focus().setImage({ src: url, alt: "" }).run(),
  });

  const onFile = (file: File | undefined) => {
    if (input.current) input.current.value = "";
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error(`That image is too large. Use one under ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`);
      return;
    }
    const form = new FormData();
    form.set("file", file);
    form.set("folder", folder);
    upload.mutate(form);
  };

  return (
    <>
      <Tool label="Insert image" disabled={upload.isPending} onClick={() => input.current?.click()}>
        {upload.isPending ? <Loader2Icon className="animate-spin" /> : <ImagePlusIcon />}
      </Tool>
      <input
        ref={input}
        type="file"
        accept={IMAGE_ACCEPT}
        hidden
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </>
  );
}
