import { useCallback, useEffect, useRef, useState } from "react";

const OPEN_DELAY = 200;
const CLOSE_DELAY = 200;

export function useHoverPreview() {
  const [open, setOpen] = useState(false);
  const openTimer = useRef(null);
  const closeTimer = useRef(null);

  const clearOpen = useCallback(() => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
  }, []);

  const clearClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const openPreview = useCallback(() => {
    clearClose();
    if (openTimer.current) return;
    openTimer.current = setTimeout(() => {
      openTimer.current = null;
      setOpen(true);
    }, OPEN_DELAY);
  }, [clearClose]);

  const scheduleClose = useCallback(() => {
    clearOpen();
    if (closeTimer.current) return;
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      setOpen(false);
    }, CLOSE_DELAY);
  }, [clearOpen]);

  const cancelClose = useCallback(clearClose, [clearClose]);

  const closeNow = useCallback(() => {
    clearOpen();
    clearClose();
    setOpen(false);
  }, [clearOpen, clearClose]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeNow();
    };
    const onScroll = () => closeNow();
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, closeNow]);

  useEffect(
    () => () => {
      clearOpen();
      clearClose();
    },
    [clearOpen, clearClose]
  );

  return { open, openPreview, scheduleClose, cancelClose, closeNow };
}
