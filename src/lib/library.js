import { getProfile } from "@/lib/profile";

const PROGRESS_KEY = "pri-anime:watch-progress:v1";
const SAVED_KEY = "pri-anime:saved-library:v1";

const owner = () => getProfile().id;

function readRows(key) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeRows(key, rows) {
  try {
    window.localStorage.setItem(key, JSON.stringify(rows));
  } catch {
    // Keep the UI usable if browser storage is unavailable or full.
  }
}

function localRowsFor(kind) {
  const profileId = owner();
  return readRows(PROGRESS_KEY)
    .filter((row) => row.owner_ref === profileId && (!kind || row.kind === kind))
    .sort((a, b) => String(b.updated_date || "").localeCompare(String(a.updated_date || "")));
}

// Watchlist and favorites are device-local; no Base44 service is required.
export async function listSaved(kind) {
  return readRows(SAVED_KEY)
    .filter((row) => row.owner_ref === owner() && row.kind === kind)
    .sort((a, b) => String(b.created_date || "").localeCompare(String(a.created_date || "")));
}

export async function toggleSaved(anime, kind) {
  const profileId = owner();
  const rows = readRows(SAVED_KEY);
  const animeId = String(anime.id ?? anime.anime_id ?? "");
  const index = rows.findIndex(
    (row) => row.owner_ref === profileId && row.kind === kind && String(row.anime_id) === animeId
  );

  if (index >= 0) {
    rows.splice(index, 1);
    writeRows(SAVED_KEY, rows);
    return false;
  }

  rows.push({
    id: `local_saved_${profileId}_${kind}_${animeId}`,
    owner_ref: profileId,
    kind,
    anime_id: animeId,
    title: anime.display || anime.title || "",
    cover: anime.cover || "",
    banner: anime.banner || "",
    score: anime.score ?? undefined,
    episodes: anime.episodes ?? undefined,
    format: anime.format || "",
    genres: (anime.genres || []).slice(0, 6),
    created_date: new Date().toISOString(),
  });
  writeRows(SAVED_KEY, rows);
  return true;
}

export async function listProgress(kind) {
  return localRowsFor(kind);
}

export async function saveProgress(entry) {
  const profileId = owner();
  const refId = String(entry.ref_id);
  const rows = readRows(PROGRESS_KEY);
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
  writeRows(PROGRESS_KEY, rows);
  return payload;
}

export async function clearProgress(entryId, kind, refId) {
  const profileId = owner();
  const rows = readRows(PROGRESS_KEY);
  const remaining = rows.filter((row) => {
    if (row.owner_ref !== profileId) return true;
    if (entryId && row.id === entryId) return false;
    return !(kind && refId != null && row.kind === kind && String(row.ref_id) === String(refId));
  });
  writeRows(PROGRESS_KEY, remaining);
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
