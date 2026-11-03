import { base44 } from "@/api/base44Client";
import { getProfile } from "@/lib/profile";

const PROGRESS_KEY = "pri-anime:watch-progress:v1";

const owner = () => getProfile().id;

function readLocalProgress() {
  try {
    const value = JSON.parse(window.localStorage.getItem(PROGRESS_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeLocalProgress(rows) {
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(rows));
  } catch {
    // Playback should continue even if storage is full or unavailable.
  }
}

function localRowsFor(kind) {
  const profileId = owner();
  return readLocalProgress()
    .filter((row) => row.owner_ref === profileId && (!kind || row.kind === kind))
    .sort((a, b) => String(b.updated_date || "").localeCompare(String(a.updated_date || "")));
}

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
  return localRowsFor(kind);
}

export async function saveProgress(entry) {
  const profileId = owner();
  const refId = String(entry.ref_id);
  const rows = readLocalProgress();
  const foundIndex = rows.findIndex(
    (row) => row.owner_ref === profileId && row.kind === entry.kind && String(row.ref_id) === refId
  );
  const now = new Date().toISOString();
  const previous = foundIndex >= 0 ? rows[foundIndex] : null;
  const payload = {
    id: previous?.id || `local_progress_${profileId}_${entry.kind}_${refId}`,
    owner_ref: profileId,
    kind: entry.kind,
    ref_id: refId,
    title: entry.title || previous?.title || "",
    cover: entry.cover || previous?.cover || "",
    episode: entry.episode ?? previous?.episode ?? 0,
    position: Math.max(0, Math.round(entry.position ?? 0)),
    duration: Math.max(0, Math.round(entry.duration ?? 0)),
    link: entry.link || previous?.link || "",
    created_date: previous?.created_date || now,
    updated_date: now,
  };

  if (foundIndex >= 0) rows[foundIndex] = payload;
  else rows.push(payload);
  writeLocalProgress(rows);
  return payload;
}

export async function clearProgress(entryId, kind, refId) {
  const profileId = owner();
  const rows = readLocalProgress();
  const remaining = rows.filter((row) => {
    if (row.owner_ref !== profileId) return true;
    if (entryId && row.id === entryId) return false;
    return !(kind && refId != null && row.kind === kind && String(row.ref_id) === String(refId));
  });
  writeLocalProgress(remaining);
  return true;
}

export async function recordAnimeView(anime) {
  const refId = String(anime.id);
  const existing = localRowsFor("anime").find((row) => String(row.ref_id) === refId);
  if (existing) return existing;

  return saveProgress({
    kind: "anime",
    ref_id: refId,
    title: anime.display || anime.title,
    cover: anime.cover || "",
    episode: 0,
    position: 0,
    duration: 0,
    link: `/anime/${refId}`,
  });
}
