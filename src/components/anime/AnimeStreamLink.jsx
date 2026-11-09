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
    .trim()
    .replace(/\\s+/g, " ");
}

function titleCandidates(item) {
  return [
    item?.display,
    item?.titleRomaji,
    item?.titleNative,
    ...(item?.titleAliases || []),
  ].map(normalizeTitle).filter(Boolean);
}

function resolveAniListMatch(items, anime) {
  const wanted = titleCandidates(anime);
  if (!wanted.length) return null;

  const valid = (items || []).filter((item) => /^\\d+$/.test(String(item?.id || "")));
  const exact = valid.find((item) => titleCandidates(item).some((title) => wanted.includes(title)));
  if (exact) return exact;

  // Permit a single unambiguous normalized title containment match for
  // translated/shortened catalogue titles; never guess between multiple shows.
  const partial = valid.filter((item) => {
    const candidates = titleCandidates(item);
    return candidates.some((candidate) =>
      wanted.some((name) => candidate.length > 4 && name.length > 4 &&
        (candidate.includes(name) || name.includes(candidate)))
    );
  });
  return partial.length === 1 ? partial[0] : null;
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

    setResolving(true);
    try {
      const queries = [...new Set([anime?.titleRomaji, anime?.display, anime?.titleNative].filter(Boolean))];
      let match = null;
      for (const query of queries) {
        const result = await callAniList({ action: "search", q: query, perPage: 50 });
        match = resolveAniListMatch(result?.items, anime);
        if (match) break;
      }

      if (!match) {
        setMessage("We couldn't confidently match this catalogue title to an AniList entry. Try another title or use the available catalogue reference.");
        return;
      }
      navigate(`/watch?anime=${encodeURIComponent(match.id)}`);
    } catch (error) {
      setMessage(error?.message || "The playback match could not be loaded. Please try again.");
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
        {resolving ? "Finding a playable match…" : "Watch anime"}
      </button>
      {source.data ? (
        <a href={source.data.tmdbUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary">
          TMDB {source.data.tmdbId} · VidStuck <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      ) : isAniListId ? (
        <span className="text-[11px] text-muted-foreground">
          {source.isPending ? "Finding a TMDB match…" : source.isError ? "Source lookup is unavailable. Open the player to retry." : "No verified TMDB match yet."}
        </span>
      ) : (
        <span className="text-[11px] text-muted-foreground">Backup catalogue title · resolving its playback ID</span>
      )}
      {message && <p role="status" className="max-w-sm text-xs leading-relaxed text-amber-300">{message}</p>}
    </div>
  );
}
