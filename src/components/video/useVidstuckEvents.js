import { useEffect, useRef } from "react";
import { parseVidstuckUrl } from "@/components/video/vidstuckUrls";

export default function useVidstuckEvents(frameRef, src, onProgress) {
  const callback = useRef(onProgress);
  callback.current = onProgress;
  useEffect(() => {
    const expected = parseVidstuckUrl(src);
    if (!expected) return;
    const receive = (event) => {
      if (event.origin !== expected.url.origin || event.source !== frameRef.current?.contentWindow) return;
      let data = event.data;
      if (typeof data === "string") {
        if (data.length > 16000) return;
        try { data = JSON.parse(data); } catch { return; }
      }
      if (!data || typeof data !== "object" || Array.isArray(data)) return;
      if (Number(data.id) !== expected.tmdbId || data.type !== expected.mediaType) return;
      const position = Number(data.timestamp);
      const duration = Number(data.duration);
      const season = Number(data.season ?? expected.season);
      const episode = Number(data.episode ?? expected.episode);
      if (!Number.isFinite(position) || !Number.isFinite(duration) || position < 0 || duration <= 0 || position > duration + 5) return;
      if (!Number.isInteger(season) || season < 0 || !Number.isInteger(episode) || episode < 1) return;
      callback.current?.(position, duration, { season, episode });
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [frameRef, src]);
}

================================================================================
