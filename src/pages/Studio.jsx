import { useEffect, useState } from "react";
import { Copy, Loader2, Save, Send, Sparkles, Trash2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/common/PageHeader";
import { getProfile } from "@/lib/profile";
import { usePref, LANGUAGES } from "@/lib/prefs";
import { relativeDate } from "@/lib/format";

const MODES = [
  { id: "chat", label: "Recommendations" },
  { id: "story", label: "Story treatment" },
  { id: "episode", label: "Episode outline" },
  { id: "character", label: "Character bible" },
  { id: "dialogue", label: "Scene dialogue" },
];

const STYLES = ["cinematic", "manhwa", "painterly", "cel"];

export default function Studio() {
  const [mode, setMode] = useState("chat");
  const [language, setLanguage] = usePref("language");
  const [style, setStyle] = useState("cinematic");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [stories, setStories] = useState([]);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    base44.entities.Story.filter({ owner_ref: getProfile().id }, { sort: "-created_date", limit: 20 })
      .then((page) => setStories(page.items || []))
      .catch(() => setStories([]));
  }, []);

  const send = async (event) => {
    event.preventDefault();
    const prompt = input.trim();
    if (!prompt || busy) return;
    const nextMessages = [...messages, { role: "user", content: prompt }];
    setMessages(nextMessages);
    setInput("");
    setBusy(true);
    setError("");
    try {
      const response = await base44.functions.invoke("aiStudio", {
        mode,
        prompt,
        language,
        style,
        messages: nextMessages,
      });
      const data = response?.data;
      if (data?.ok) {
        setMessages([...nextMessages, { role: "assistant", content: data.text }]);
      } else {
        setError(data?.error || "The atelier did not answer. Try again.");
      }
    } catch (invokeError) {
      setError(invokeError.message || "The AI studio is unreachable right now.");
    } finally {
      setBusy(false);
    }
  };

  const copy = async (content, id) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(id);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      setError("Your browser blocked clipboard access.");
    }
  };

  const saveStory = async (content, id) => {
    const asked = [...messages].reverse().find((message) => message.role === "user")?.content || "Untitled";
    try {
      const created = await base44.entities.Story.create({
        owner_ref: getProfile().id,
        title: asked.slice(0, 90),
        kind: mode === "chat" ? "story" : mode,
        language,
        style,
        script: content,
        prompt: asked,
      });
      setStories((prev) => [created, ...prev]);
    } catch (saveError) {
      setError(saveError.message || "Could not save the script.");
    }
  };

  const removeStory = async (id) => {
    try {
      await base44.entities.Story.delete(id);
      setStories((prev) => prev.filter((story) => story.id !== id));
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete the script.");
    }
  };

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="AI atelier"
        title="Write the next original arc"
        description="Recommendations, world-building, character bibles, episode outlines and scene dialogue â€” written in English or Hindi by PRI-ANIME's AI atelier."
      />

      <div className="mx-auto grid w-full max-w-[1600px] gap-6 px-4 pt-8 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-10">
        <section className="flex min-h-[62vh] flex-col rounded-2xl border border-border/60 bg-card/40">
          <div className="flex flex-wrap items-center gap-2 border-b border-border/50 px-4 py-3">
            {MODES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setMode(option.id)}
                className={`rounded-full px-3 py-1.5 text-xs transition ${
                  mode === option.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <label htmlFor="studio-language" className="sr-only">
                Language
              </label>
              <select
                id="studio-language"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs"
              >
                {LANGUAGES.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <label htmlFor="studio-style" className="sr-only">
                Visual style
              </label>
              <select
                id="studio-style"
                value={style}
                onChange={(event) => setStyle(event.target.value)}
                className="rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs"
              >
                {STYLES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 thin-scrollbar sm:px-6" aria-live="polite">
            {messages.length === 0 && (
              <div className="rounded-xl border border-dashed border-border/60 bg-background/40 p-5">
                <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
                <p className="mt-3 font-display text-lg">Start with a seed</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  â€œA swordswoman who can only speak the truth hires herself out as a court liar.â€ Try a logline, a
                  character, or ask which anime to watch next.
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "ml-auto max-w-[85%] border border-primary/30 bg-primary/10"
                    : "max-w-[92%] border border-border/50 bg-background/50"
                }`}
              >
                <p className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {message.role === "user" ? "Director" : "Atelier"}
                </p>
                <p className="whitespace-pre-line text-[14px] leading-relaxed text-foreground/90">{message.content}</p>
                {message.role === "assistant" && (
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => copy(message.content, index)}
                      className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground transition hover:text-primary"
                    >
                      {copied === index ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} Copy
                    </button>
                    <button
                      type="button"
                      onClick={() => saveStory(message.content, index)}
                      className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground transition hover:text-primary"
                    >
                      <Save className="h-3 w-3" /> Save script
                    </button>
                  </div>
                )}
              </div>
            ))}

            {busy && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" /> The atelier is writingâ€¦
              </p>
            )}
            {error && <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">{error}</p>}
          </div>

          <form onSubmit={send} className="border-t border-border/50 p-3 sm:p-4">
            <div className="flex items-end gap-2">
              <label htmlFor="studio-input" className="sr-only">
                Prompt
              </label>
              <textarea
                id="studio-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    send(event);
                  }
                }}
                rows={2}
                maxLength={4000}
                placeholder="Describe the story, character or sceneâ€¦"
                className="min-h-[52px] flex-1 resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground transition disabled:opacity-40"
                aria-label="Send prompt"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </form>
        </section>

        <aside>
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h2 className="font-display text-lg">Saved scripts</h2>
            <span className="text-xs text-muted-foreground">{stories.length}</span>
          </div>
          <div className="mt-3 space-y-2">
            {stories.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border/60 px-4 py-6 text-sm text-muted-foreground">
                Saved drafts appear here. They stay on this device profile.
              </p>
            ) : (
              stories.map((story) => (
                <div key={story.id} className="rounded-xl border border-border/50 bg-card/50 p-3">
                  <p className="line-clamp-2 text-sm text-foreground">{story.title}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {story.kind} Â· {story.language} Â· {relativeDate(story.created_date)}
                  </p>
                  <div className="mt-2.5 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => copy(story.script, story.id)}
                      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition hover:text-primary"
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStory(story.id)}
                      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
