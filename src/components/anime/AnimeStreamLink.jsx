import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, ExternalLink, Loader2 } from "lucide-react";
import useAnimeSource from "@/components/video/useAnimeSource";
import { callAniList } from "@/lib/animeApi";

function normalizeTitle(value) {
  return String(value || "")
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .replace(/[^\\p{L}\\p{N}]+/gu, " ")
    .trim();
}

function hasExactTitleMatch(item, anime) {
  const wanted = new Set([
    anime?.display,
    anime?.titleRomaji,
    anime?.titleNative,
    ...(anime?.titleAliases || []),
  ].map(normalizeTitle).filter(Boolean));
  const candidates = [
    item?.display,
    item?.titleRomaji,
    item?.titleNative,
    ...(item?.titleAliases || []),
  ].map(normalizeTitle).filter(Boolean);
  return candidates.some((title) => wanted.has(title));
}

export default function AnimeStreamLink({ anime }) {
  const navigate = useNavigate();
  const isAniListId = /^\\d+$/.test(String(anime?.id || ""));
  const source = useAnimeSource(isAniListId ? anime.id : null);
  const [resolving, setResolving] = useState(false);
  const [message, setMessage] = useState("");

  const openAnime = async () => {
    setMessage("");
    if (isAniListId) {
      navigate(`/watch?anime=${encodeURIComponent(anime.id)}`);
      return;
    }

    // MAL/Kitsu catalogue IDs are not valid playback IDs. Resolve the exact
    // title back to AniList before opening the anime theatre; never send a
    // "mal-..." or "kitsu-..." ID to the numeric watch route.
    setResolving(true);
    try {
      const query = anime.titleRomaji || anime.display;
      const result = await callAniList({ action: "search", q: query, perPage: 50 });
      const match = (result.items || []).find((item) =>
        /^\\d+$/.test(String(item?.id || "")) && hasExactTitleMatch(item, anime)
      );
      if (!match) {
        setMessage("Is title ka exact AniList playback match nahi mila. Search results mein title detail dekh sakte ho, lekin galat anime open nahi karenge.");
        return;
      }
      navigate(`/watch?anime=${encodeURIComponent(match.id)}`);
    } catch (error) {
      setMessage(error?.message || "Anime playback match abhi resolve nahi ho paaya. Thodi der baad retry karo.");
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={openAnime}
        disabled={resolving}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
      >
        {resolving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Play className="h-4 w-4 fill-current" aria-hidden="true" />}
        {resolving ? "Finding playable match…" : "Watch anime"}
      </button>
      {source.data ? (
        <a href={source.data.tmdbUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary">
          TMDB {source.data.tmdbId} · Vidstuck <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      ) : isAniListId ? (
        <span className="text-[11px] text-muted-foreground">
          {source.isPending ? "Finding TMDB match…" : source.isError ? "Source lookup unavailable — open player to retry" : "No verified TMDB match yet"}
        </span>
      ) : (
        <span className="text-[11px] text-muted-foreground">Backup catalogue title · playback ID is resolved before opening</span>
      )}
      {message && <p role="status" className="max-w-sm text-xs leading-relaxed text-amber-300">{message}</p>}
    </div>
  );
}
