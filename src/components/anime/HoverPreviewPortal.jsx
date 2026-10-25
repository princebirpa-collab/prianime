import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const WIDTH = 344;
const MARGIN = 12;
const EST_HEIGHT = 500;
const EASE = [0.22, 1, 0.36, 1];

export default function HoverPreviewPortal({ anchorRef, open, onPointerEnter, onPointerLeave, children }) {
  const [pos, setPos] = useState(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (!open) return;
    const compute = () => {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let x;
      if (rect.right + WIDTH + MARGIN <= vw - MARGIN) {
        x = rect.right + MARGIN;
      } else if (rect.left - WIDTH - MARGIN >= MARGIN) {
        x = rect.left - WIDTH - MARGIN;
      } else {
        x = Math.min(Math.max(rect.left - WIDTH / 2, MARGIN), Math.max(MARGIN, vw - WIDTH - MARGIN));
      }
      let y = rect.top + rect.height / 2 - EST_HEIGHT / 2;
      y = Math.min(Math.max(y, MARGIN), Math.max(MARGIN, vh - EST_HEIGHT - MARGIN));
      setPos({ left: Math.round(x), top: Math.round(y) });
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [open, anchorRef]);

  return createPortal(
    <AnimatePresence>
      {open && pos && (
        <motion.div
          key="anime-hover-preview"
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: reduced ? 0 : 0.24, ease: EASE }}
          className="fixed z-[70]"
          style={{ left: pos.left, top: pos.top, width: WIDTH }}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

================================================================================
