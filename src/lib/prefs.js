import { useCallback, useEffect, useState } from "react";

const PREFIX = "pri-anime:pref:";

export const DEFAULT_PREFS = {
  language: "en",
  reelMuted: true,
  reduceMotion: false,
  autoplayReels: true,
  notifications: true,
  dataSaver: false,
  subtitles: true,
};

export function usePref(key) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? DEFAULT_PREFS[key] : JSON.parse(raw);
    } catch {
      return DEFAULT_PREFS[key];
    }
  });

  const update = useCallback(
    (next) => {
      setValue(next);
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify(next));
      } catch {
        /* storage full or blocked */
      }
      window.dispatchEvent(new CustomEvent("pri-pref-change", { detail: { key, value: next } }));
    },
    [key]
  );

  useEffect(() => {
    const sync = (event) => {
      if (event.detail?.key === key) setValue(event.detail.value);
    };
    window.addEventListener("pri-pref-change", sync);
    return () => window.removeEventListener("pri-pref-change", sync);
  }, [key]);

  return [value, update];
}

export const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "hi", label: "à¤¹à¤¿à¤¨à¥à¤¦à¥€ (Hindi)" },
  { id: "ja", label: "æ—¥æœ¬èªž (Japanese)" },
  { id: "es", label: "EspaÃ±ol" },
];

================================================================================
