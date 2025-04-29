import * as React from "react";
import { cn } from "@/lib/utils";

const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea"> & { maxRows?: number }
>(({ className, maxRows = 5, ...props }, ref) => {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [lineHeight, setLineHeight] = React.useState<number>(24); // Default line height

  React.useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

  // Calculate line height once the component mounts
  React.useEffect(() => {
    if (textareaRef.current) {
      // Get computed line height
      const style = window.getComputedStyle(textareaRef.current);
      const lineHeightStyle = parseInt(style.lineHeight, 10);
      setLineHeight(isNaN(lineHeightStyle) ? 24 : lineHeightStyle);
    }
  }, []);

  // Auto-resize function
  const autoResize = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to get the correct scrollHeight
    textarea.style.height = 'auto';

    // Calculate how many rows of text are in the textarea
    const textareaLineCount = textarea.value.split('\n').length;
    
    // Get the scrollHeight which is the height of all content
    const scrollHeight = textarea.scrollHeight;

    // Calculate the max height based on the max number of rows
    const maxHeight = lineHeight * maxRows;

    // Set the height to scrollHeight if it's less than maxHeight, otherwise set to maxHeight
    if (scrollHeight <= maxHeight) {
      textarea.style.height = `${scrollHeight}px`;
      textarea.style.overflowY = 'hidden';
    } else {
      textarea.style.height = `${maxHeight}px`;
      textarea.style.overflowY = 'auto';
    }
  }, [maxRows, lineHeight]);

  // Set up event listeners for auto-resize
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Initial resize
    autoResize();

    // Listen for input events
    textarea.addEventListener('input', autoResize);
    return () => {
      textarea.removeEventListener('input', autoResize);
    };
  }, [autoResize]);

  return (
    <textarea
      className={cn(
        "flex min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none",
        className
      )}
      ref={textareaRef}
      rows={1} // Start with 1 row
      {...props}
    />
  );
});

AutoResizeTextarea.displayName = "AutoResizeTextarea";

export { AutoResizeTextarea };