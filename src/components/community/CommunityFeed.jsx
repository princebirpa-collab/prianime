import { useCallback, useEffect, useState } from "react";
import { Heart, MessageCircle, Send, RefreshCw, Sparkles } from "lucide-react";
import { communityRequest } from "@/lib/communityApi";

export default function CommunityFeed({ profile }) {
  const [posts, setPosts] = useState([]);
  const [draft, setDraft] = useState("");
  const [comments, setComments] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [expanded, setExpanded] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const result = await communityRequest("/posts?profileId=" + encodeURIComponent(profile.id));
      setPosts(result.posts || []);
      setError("");
    } catch (e) { setError(e.message); }
  }, [profile.id]);

  useEffect(() => { load(); }, [load]);

  const publish = async (event) => {
    event.preventDefault();
    if (draft.trim().length < 3 || busy) return;
    setBusy(true);
    try {
      const result = await communityRequest("/posts", { method: "POST", body: {
        profileId: profile.id, displayName: profile.name, body: draft.trim()
      }});
      setPosts((current) => [result.post, ...current]);
      setDraft("");
      setError("");
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const toggleLike = async (post) => {
    try {
      const result = await communityRequest("/posts/" + encodeURIComponent(post.id) + "/like?profileId=" + encodeURIComponent(profile.id), {
        method: "POST", body: { profileId: profile.id }
      });
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, liked: result.liked, likes: result.likes } : item));
    } catch (e) { setError(e.message); }
  };

  const toggleComments = async (post) => {
    if (expanded === post.id) { setExpanded(""); return; }
    setExpanded(post.id);
    try {
      const result = await communityRequest("/posts/" + encodeURIComponent(post.id) + "/comments?profileId=" + encodeURIComponent(profile.id));
      setComments((current) => ({ ...current, [post.id]: result.comments || [] }));
    } catch (e) { setError(e.message); }
  };

  const sendComment = async (event, post) => {
    event.preventDefault();
    const body = (commentDrafts[post.id] || "").trim();
    if (!body) return;
    try {
      const result = await communityRequest("/posts/" + encodeURIComponent(post.id) + "/comments?profileId=" + encodeURIComponent(profile.id), {
        method: "POST", body: { profileId: profile.id, displayName: profile.name, body }
      });
      setComments((current) => ({ ...current, [post.id]: [...(current[post.id] || []), result.comment] }));
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, comments: Number(item.comments || 0) + 1 } : item));
      setCommentDrafts((current) => ({ ...current, [post.id]: "" }));
    } catch (e) { setError(e.message); }
  };

  return (
    <section className="mx-auto mt-5 w-full max-w-[1500px] px-3 sm:px-4">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(ellipse_at_top_left,rgba(126,34,64,.22),transparent_42%),linear-gradient(135deg,#15131b,#0b0c13_65%)] shadow-[0_24px_80px_rgba(0,0,0,.24)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
          <div><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.24em] text-rose-300"><Sparkles className="h-3.5 w-3.5"/> PRI-ANIME SOCIAL</p><h2 className="mt-1 font-display text-2xl text-white">Community Feed</h2><p className="mt-1 text-xs text-white/45">Share anime moments, recommendations and fan theories.</p></div>
          <button type="button" onClick={load} aria-label="Refresh community feed" className="rounded-xl border border-white/10 bg-white/[.04] p-2.5 text-white/65 hover:bg-white/10 hover:text-white"><RefreshCw className="h-4 w-4"/></button>
        </div>
        <form onSubmit={publish} className="border-b border-white/10 p-4 sm:p-5">
          <div className="flex gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-rose-500 to-amber-400 text-sm font-black text-black">{profile.avatar ? <img src={profile.avatar} alt="" className="h-full w-full object-cover"/> : (profile.name || "A").slice(0,1).toUpperCase()}</div>
            <div className="min-w-0 flex-1">
              <textarea value={draft} onChange={(e)=>setDraft(e.target.value)} maxLength={1200} rows={3} placeholder="What's happening in your anime world?" className="w-full resize-y rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-rose-300/40"/>
              <div className="mt-2 flex items-center justify-between gap-3"><span className="text-[10px] text-white/35">{draft.length}/1200</span><button disabled={busy || draft.trim().length<3} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-950/30 disabled:cursor-not-allowed disabled:opacity-40"><Send className="h-3.5 w-3.5"/>{busy?"Posting…":"Publish post"}</button></div>
            </div>
          </div>
        </form>
        <div className="space-y-3 p-3 sm:p-5">
          {posts.length===0 && !error && <div className="rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center"><MessageCircle className="mx-auto h-7 w-7 text-rose-300/70"/><p className="mt-3 font-semibold text-white">Your feed starts here</p><p className="mt-1 text-xs text-white/45">Be the first to share something with the community.</p></div>}
          {posts.map((post)=> <article key={post.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
            <div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-black text-white">{(post.display_name||"A").slice(0,1).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-bold text-white">{post.display_name||"Anime Fan"}</p><time className="text-[10px] text-white/40">{new Date(post.created_at).toLocaleString()}</time></div></div>
            <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-white/85">{post.body}</p>
            <div className="mt-4 flex items-center gap-2 border-t border-white/[.07] pt-3">
              <button type="button" onClick={()=>toggleLike(post)} aria-pressed={!!post.liked} className={"inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition "+(post.liked?"bg-rose-500/15 text-rose-300":"text-white/55 hover:bg-white/[.06] hover:text-white")}><Heart className={"h-4 w-4 "+(post.liked?"fill-current":"")}/>{post.likes||0} Likes</button>
              <button type="button" onClick={()=>toggleComments(post)} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/55 hover:bg-white/[.06] hover:text-white"><MessageCircle className="h-4 w-4"/>{post.comments||0} Comments</button>
            </div>
            {expanded===post.id && <div className="mt-2 border-t border-white/[.07] pt-3"><div className="space-y-3">{(comments[post.id]||[]).map((comment)=><div key={comment.id} className="flex gap-2"><div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 text-[10px] font-bold text-white">{(comment.display_name||"A").slice(0,1).toUpperCase()}</div><div className="min-w-0 rounded-xl bg-white/[.04] px-3 py-2"><p className="text-[11px] font-bold text-white">{comment.display_name}</p><p className="mt-1 whitespace-pre-wrap break-words text-xs text-white/70">{comment.body}</p></div></div>)}</div><form onSubmit={(e)=>sendComment(e,post)} className="mt-3 flex gap-2"><input value={commentDrafts[post.id]||""} onChange={(e)=>setCommentDrafts((current)=>({...current,[post.id]:e.target.value}))} maxLength={500} placeholder="Write a comment…" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-xs text-white outline-none placeholder:text-white/35"/><button className="rounded-xl bg-white/10 px-3 text-white hover:bg-white/15" aria-label="Send comment"><Send className="h-4 w-4"/></button></form></div>}
          </article>)}
        </div>
        {error && <p role="alert" className="border-t border-rose-400/20 bg-rose-400/5 px-5 py-3 text-xs text-rose-200">{error}</p>}
      </div>
    </section>
  );
}
