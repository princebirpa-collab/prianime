/**
 * PRI-ANIME Smart Experience
 *
 * A small, app-scoped layer inspired by the safe parts of the supplied EWE
 * bundle. It deliberately avoids patching fetch/XHR, cookies, storage,
 * timers, Function.prototype, or player frames.
 */

const MAX_DIAGNOSTICS = 40;
const diagnostics = [];
let installed = false;

function record(type, detail = {}) {
  diagnostics.push({
    type,
    at: Date.now(),
    // Keep diagnostics metadata-only: never store URLs, user input, or payloads.
    status: Number.isFinite(detail.status) ? detail.status : undefined,
  });
  if (diagnostics.length > MAX_DIAGNOSTICS) diagnostics.shift();
}

function networkProfile() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return {
    online: navigator.onLine,
    saveData: Boolean(connection?.saveData),
    effectiveType: connection?.effectiveType || "unknown",
  };
}

/**
 * Use this helper for external links opened by app controls.
 * Only web URLs are allowed and the new tab is isolated from window.opener.
 */
export function openSafeExternal(value) {
  try {
    const url = new URL(value, window.location.href);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    const opened = window.open(url.href, "_blank", "noopener,noreferrer");
    if (opened) opened.opener = null;
    return Boolean(opened);
  } catch {
    record("blocked-external-navigation");
    return false;
  }
}

export function getPriSmartDiagnostics() {
  return {
    network: networkProfile(),
    recentEvents: diagnostics.map((entry) => ({ ...entry })),
  };
}

export function installPriSmartExperience() {
  if (installed || typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }
  installed = true;

  const publishNetwork = () => {
    const detail = networkProfile();
    record(detail.online ? "online" : "offline");
    window.dispatchEvent(new CustomEvent("pri:network-change", { detail }));
  };
  const onError = () => record("runtime-error");
  const onRejection = () => record("unhandled-rejection");
  const onVisibility = () => record(document.hidden ? "tab-hidden" : "tab-visible");

  window.addEventListener("online", publishNetwork);
  window.addEventListener("offline", publishNetwork);
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
  document.addEventListener("visibilitychange", onVisibility);

  // Secure only external blank-target anchors; leave internal navigation,
  // player embeds, and all VidStuck code untouched.
  const secureBlankLinks = (event) => {
    const anchor = event.target?.closest?.('a[target="_blank"]');
    if (!anchor) return;
    try {
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin &&
          (url.protocol === "https:" || url.protocol === "http:")) {
        anchor.rel = "noopener noreferrer";
      }
    } catch {
      // Invalid links are left to the browser; no global navigation blocking.
    }
  };
  document.addEventListener("click", secureBlankLinks, true);

  record("smart-layer-ready", networkProfile());

  return () => {
    window.removeEventListener("online", publishNetwork);
    window.removeEventListener("offline", publishNetwork);
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
    document.removeEventListener("visibilitychange", onVisibility);
    document.removeEventListener("click", secureBlankLinks, true);
    installed = false;
  };
}
