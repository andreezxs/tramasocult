import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

const EDITABLE = "input, textarea, select, [contenteditable='true']";

function isEditable(target: EventTarget | null) {
  return (target as HTMLElement | null)?.closest(EDITABLE) != null;
}

export function ContentProtection() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    document.documentElement.classList.add("site-protected");
    document.documentElement.classList.toggle("site-admin", isAdmin);
    document.body.classList.add("protected-reading-active");

    const allow = (target: EventTarget | null) => isAdmin || isEditable(target);

    const blockClipboard = (event: ClipboardEvent) => {
      if (!allow(event.target)) event.preventDefault();
    };

    const blockContextMenu = (event: MouseEvent) => {
      if (!allow(event.target)) event.preventDefault();
    };

    const blockSelection = (event: Event) => {
      if (!allow(event.target)) event.preventDefault();
    };

    const blockShortcuts = (event: KeyboardEvent) => {
      if (allow(event.target)) return;

      const key = event.key.toLowerCase();
      const commandKey = event.ctrlKey || event.metaKey;
      const blockedCommand = commandKey && ["a", "c", "x", "v", "p", "s", "u"].includes(key);
      const blockedDevTools = commandKey && event.shiftKey && ["i", "j", "c"].includes(key);
      const blockedCapture =
        event.key === "PrintScreen" ||
        (commandKey && event.shiftKey && ["3", "4", "5"].includes(event.key));

      if (blockedCommand || blockedDevTools || blockedCapture || event.key === "F12") {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const clearSelection = () => {
      if (isAdmin) return;
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) selection.removeAllRanges();
    };

    const onVisibility = () => {
      if (document.hidden && !isAdmin) {
        document.documentElement.classList.add("capture-guard");
      } else {
        document.documentElement.classList.remove("capture-guard");
      }
    };

    document.addEventListener("copy", blockClipboard, true);
    document.addEventListener("cut", blockClipboard, true);
    document.addEventListener("paste", blockClipboard, true);
    document.addEventListener("contextmenu", blockContextMenu, true);
    document.addEventListener("selectstart", blockSelection, true);
    document.addEventListener("dragstart", blockSelection, true);
    document.addEventListener("keydown", blockShortcuts, true);
    document.addEventListener("keyup", clearSelection, true);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.documentElement.classList.remove("site-protected", "capture-guard", "site-admin");
      document.body.classList.remove("protected-reading-active");
      document.removeEventListener("copy", blockClipboard, true);
      document.removeEventListener("cut", blockClipboard, true);
      document.removeEventListener("paste", blockClipboard, true);
      document.removeEventListener("contextmenu", blockContextMenu, true);
      document.removeEventListener("selectstart", blockSelection, true);
      document.removeEventListener("dragstart", blockSelection, true);
      document.removeEventListener("keydown", blockShortcuts, true);
      document.removeEventListener("keyup", clearSelection, true);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isAdmin]);

  return null;
}
