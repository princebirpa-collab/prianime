import { useEffect, useState } from "react";
import { Film, Tv, Search, ArrowLeft, Star, LoaderCircle } from "lucide-react";

export default function BrandLanding({ kind = "series" }) {
  const movie = kind === "movie";
  const media = movie ? "movie" : "tv";
  const name = movie ? "PRI-MOVIE" : "PRI-SHOW";
  const [mode, setMode] = useState("trending");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    const params = new URLSearchParams({ tmdb: "1", kind: media, mode, page: String(page) });
    if (mode === "search") params.set("q", query.trim());
    fetch("/api/catalog-feed?" + params.toString())
      .then(async response => { const body = await response.json(); if (!response.ok) throw new Error(body.error || "Catalogue unavailable"); return body; })
      .then(body => { if (active) setItems(body.results || []); })
      .catch(e => { if (active) { setItems([]); setError(e.message || "Catalogue unavailable"); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [media, mode, query, page]);

  return <main className="min-h-screen bg-[#070707] px-4 pb-24 pt-8 text-white sm:px-6">
    <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_5%,rgba(255,255,255,.10),transparent_45%),radial-gradient(ellipse_at_10%_70%,rgba(255,255,255,.04),transparent_40%),linear-gradient(145deg,#080808,#151515_55%,#050505)]"/>
    <div className="mx-auto max-w-7xl">
      <a href="/" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.04] px-4 py-2 text-sm text-white/75 backdrop-blur-xl hover:bg-white/10"><ArrowLeft size={16}/>Back to PRI-ANIME</a>
      <header className="mt-10 rounded-3xl border border-white/10 bg-white/[.035] p-6 backdrop-blur-2xl sm:p-10">
        <div className="flex items-center gap-3 text-white/60">{movie ? <Film/> : <Tv/>}<span className="text-xs tracking-[.3em]">{movie ? "FILM COLLECTION" : "SERIES COLLECTION"}</span></div>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-7xl">{name}</h1>
        <p className="mt-3 max-w-xl text-white/60">{movie ? "Explore films across genres, eras and worlds." : "Discover series, seasons and stories worth watching."}</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3"><Search size={18} className="text-white/45"/><input value={query} onChange={e=>{setQuery(e.target.value);setPage(1);setMode(e.target.value.trim()?"search":"trending");}} placeholder={movie?"Search movies...":"Search TV series..."} className="w-full bg-transparent outline-none placeholder:text-white/35"/></div>
          <div className="flex gap-2">{["trending","popular"].map(v=><button key={v} onClick={()=>{setMode(v);setQuery("");setPage(1);}} className={`rounded-xl border px-4 py-3 text-sm capitalize ${mode===v?"border-white/30 bg-white/15":"border-white/10 bg-white/[.04] text-white/65"}`}>{v}</button>)}</div>
        </div>
      </header>
      <div className="mt-8 flex items-center justify-between"><h2 className="text-xl font-semibold">{mode==="search"?"Search results":mode==="popular"?"Popular":"Trending this week"}</h2><span className="text-xs text-white/40">{items.length} titles</span></div>
      {error && <div className="mt-6 rounded-2xl border border-white/10 bg-white/[.04] p-5 text-white/70">{error}<p className="mt-2 text-xs text-white/45">Check the TMDB_API_KEY environment variable in your server settings.</p></div>}
      {loading ? <div className="grid min-h-48 place-items-center"><LoaderCircle className="animate-spin text-white/60"/></div> : !error && <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">{items.map(item=><article key={item.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[.035] transition hover:border-white/25 hover:bg-white/[.07]">
        <div className="relative aspect-[2/3] overflow-hidden bg-white/5">{item.poster ? <img src={item.poster} alt={item.title} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"/> : <div className="grid h-full place-items-center text-white/30">{movie?<Film/>:<Tv/>}</div>}<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3"><div className="flex items-center gap-1 text-xs text-white/75"><Star size={12} className="fill-white/70"/>{item.rating.toFixed(1)}</div></div></div>
        <div className="p-3"><h3 className="line-clamp-2 text-sm font-medium">{item.title}</h3><p className="mt-1 text-xs text-white/40">{item.year||"Year unknown"}</p><p className="mt-2 line-clamp-3 text-xs leading-relaxed text-white/55">{item.overview}</p></div>
      </article>)}</div>}
      {!loading && !error && items.length===0 && <p className="py-12 text-center text-white/45">No titles found.</p>}
      <div className="mt-8 flex justify-center gap-3"><button disabled={page<=1||loading} onClick={()=>setPage(p=>p-1)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 disabled:opacity-30">Previous</button><span className="px-3 py-2 text-sm text-white/50">Page {page}</span><button disabled={loading||items.length===0} onClick={()=>setPage(p=>p+1)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 disabled:opacity-30">Next</button></div>
      <p className="mt-10 text-center text-xs text-white/35">This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
    </div>
  </main>;
}