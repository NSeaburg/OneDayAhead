import * as React from "react";
import { cn } from "@/lib/utils";

export interface RichInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const RichInput = React.forwardRef<HTMLInputElement, RichInputProps>(
  ({ className, type, onKeyDown, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Handle Ctrl+B for bold
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        insertFormatting(e.currentTarget, '**', '**');
      }
      // Handle Ctrl+I for italic
      else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        insertFormatting(e.currentTarget, '*', '*');
      }
      
      // Call original onKeyDown if provided
      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    const insertFormatting = (input: HTMLInputElement, before: string, after: string) => {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const text = input.value;
      const selectedText = text.substring(start, end);
      
      const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
      input.value = newText;
      
      // Set cursor position after the formatting
      const newCursorPos = start + before.length + selectedText.length + after.length;
      input.setSelectionRange(newCursorPos, newCursorPos);
      
      // Trigger change event
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        onKeyDown={handleKeyDown}
        spellCheck={true}
        {...props}
      />
    );
  }
);

RichInput.displayName = "RichInput";

export { RichInput };