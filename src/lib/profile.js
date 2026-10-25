import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pri-anime:profile";
const EVENT = "pri-profile-change";

const ADJECTIVES = ["Silent", "Gilded", "Crimson", "Astral", "Hollow", "Radiant", "Umbra", "Vesper"];
const NOUNS = ["Ronin", "Oracle", "Wanderer", "Scribe", "Sentinel", "Dreamer", "Kitsune", "Archivist"];

function randomName() {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${a} ${n}`;
}

export function createProfile() {
  return {
    id: `viewer_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`,
    name: randomName(),
    bio: "Wandering the gilded theater.",
    createdAt: new Date().toISOString(),
  };
}

export function getProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.id) return parsed;
    }
  } catch {
    /* ignore corrupt storage */
  }
  const fresh = createProfile();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  } catch {
    /* ignore */
  }
  return fresh;
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: profile }));
}

export function useProfile() {
  const [profile, setProfile] = useState(getProfile);

  useEffect(() => {
    const sync = (event) => setProfile(event.detail);
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const update = useCallback((patch) => {
    const next = { ...getProfile(), ...patch };
    saveProfile(next);
    return next;
  }, []);

  return [profile, update];
}
