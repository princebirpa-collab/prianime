import { base44 } from "@/api/base44Client";
import { getProfile } from "@/lib/profile";

const owner = () => getProfile().id;

export async function listSaved(kind) {
  const page = await base44.entities.Watchlist.filter(
    { owner_ref: owner(), kind },
    { sort: "-created_date", limit: 200 }
  );
  return page.items || [];
}

export async function toggleSaved(anime, kind) {
  const existing = await base44.entities.Watchlist.filter(
    { owner_ref: owner(), anime_id: anime.id, kind },
    { limit: 1 }
  );
  const found = existing.items?.[0];
  if (found) {
    await base44.entities.Watchlist.delete(found.id);
    return false;
  }
  await base44.entities.Watchlist.create({
    owner_ref: owner(),
    kind,
    anime_id: anime.id,
    title: anime.display || anime.title,
    cover: anime.cover || "",
    banner: anime.banner || "",
    score: anime.score ?? undefined,
    episodes: anime.episodes ?? undefined,
    format: anime.format || "",
    genres: (anime.genres || []).slice(0, 6),
  });
  return true;
}

export async function listProgress(kind) {
  const page = await base44.entities.Progress.filter(
    { owner_ref: owner(), kind },
    { sort: "-updated_date", limit: 100 }
  );
  return page.items || [];
}

export async function saveProgress(entry) {
  const existing = await base44.entities.Progress.filter(
    { owner_ref: owner(), kind: entry.kind, ref_id: String(entry.ref_id) },
    { limit: 1 }
  );
  const payload = {
    title: entry.title || "",
    cover: entry.cover || "",
    episode: entry.episode ?? 0,
    position: Math.round(entry.position ?? 0),
    duration: Math.round(entry.duration ?? 0),
    link: entry.link || "",
  };
  const found = existing.items?.[0];
  if (found) return base44.entities.Progress.update(found.id, payload);
  return base44.entities.Progress.create({
    owner_ref: owner(),
    kind: entry.kind,
    ref_id: String(entry.ref_id),
    ...payload,
  });
}

export async function clearProgress(entryId) {
  return base44.entities.Progress.delete(entryId);
}

export async function recordAnimeView(anime) {
  try {
    const watched = await base44.entities.Progress.count({ owner_ref: owner(), kind: "anime", ref_id: String(anime.id), episode: { $gt: 0 } });
    if (watched > 0) return;
    await saveProgress({
      kind: "anime",
      ref_id: anime.id,
      title: anime.display,
      cover: anime.cover,
      episode: 0,
      position: 0,
      duration: 0,
      link: `/anime/${anime.id}`,
    });
  } catch {
    /* view tracking is best-effort */
  }
}

================================================================================
