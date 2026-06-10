"use client";

import { useCallback, useEffect, useRef, type ComponentType } from "react";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

type FormatCommand =
  | "bold"
  | "italic"
  | "underline"
  | "h2"
  | "h3"
  | "insertUnorderedList"
  | "insertOrderedList";

const toolbarItems: {
  command: FormatCommand;
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { command: "bold", label: "Negrito", icon: Bold },
  { command: "italic", label: "Itálico", icon: Italic },
  { command: "underline", label: "Sublinhado", icon: Underline },
  { command: "h2", label: "Título", icon: Heading2 },
  { command: "h3", label: "Subtítulo", icon: Heading3 },
  { command: "insertUnorderedList", label: "Lista", icon: List },
  { command: "insertOrderedList", label: "Lista numerada", icon: ListOrdered },
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Descreva a evolução clínica da sessão de forma narrativa...",
  className,
  disabled = false,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const syncContent = useCallback(() => {
    if (!editorRef.current) {
      return;
    }

    onChange(editorRef.current.innerHTML);
  }, [onChange]);

  useEffect(() => {
    if (!editorRef.current || editorRef.current.innerHTML === value) {
      return;
    }

    editorRef.current.innerHTML = value;
  }, [value]);

  function applyFormat(command: FormatCommand) {
    if (disabled || !editorRef.current) {
      return;
    }

    editorRef.current.focus();

    if (command === "h2") {
      document.execCommand("formatBlock", false, "h2");
    } else if (command === "h3") {
      document.execCommand("formatBlock", false, "h3");
    } else {
      document.execCommand(command, false);
    }

    syncContent();
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm",
        disabled && "opacity-70",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 p-2">
        {toolbarItems.map((item) => {
          const Icon = item.icon;

          return (
            <Button
              key={item.command}
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8"
              onClick={() => applyFormat(item.command)}
              disabled={disabled}
              aria-label={item.label}
              title={item.label}
            >
              <Icon className="size-4" aria-hidden />
            </Button>
          );
        })}
      </div>

      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={syncContent}
        onBlur={syncContent}
        data-placeholder={placeholder}
        className={cn(
          "min-h-72 px-4 py-4 text-sm leading-relaxed outline-none sm:min-h-96",
          "prose prose-sm max-w-none dark:prose-invert",
          "[&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold",
          "[&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:text-sm [&_h3]:font-semibold",
          "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
          "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&_p]:my-2",
          "empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]"
        )}
      />
    </div>
  );
}
