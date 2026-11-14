const ANILIST = "https://graphql.anilist.co";
const JIKAN = "https://api.jikan.moe/v4/anime";
const KITSU = "https://kitsu.io/api/edge/anime";
const CORE = `id title { romaji english native } synonyms coverImage { extraLarge large color } bannerImage description(asHtml: false) genres averageScore popularity episodes duration status format season seasonYear startDate { year month day } endDate { year month day } studios(isMain: true) { nodes { name } } trailer { id site } nextAiringEpisode { episode timeUntilAiring }`;
const SEARCH = `query ($search: String!, $page: Int!) { Page(page: $page, perPage: 50) { pageInfo { total currentPage lastPage hasNextPage } media(type: ANIME, isAdult: false, search: $search, sort: [SEARCH_MATCH]) { ${CORE} } } }`;

function send(res, status, data, cache="public, s-maxage=60, stale-while-revalidate=300") {
  res.statusCode=status;
  res.setHeader("Content-Type","application/json; charset=utf-8");
  res.setHeader("Cache-Control",cache);
  res.setHeader("X-Content-Type-Options","nosniff");
  res.end(JSON.stringify(data));
}
function clean(value) { return String(value||"").trim().replace(/[\u0000-\u001f\u007f]/g,"").slice(0,100); }
async function jsonFetch(url, options={}) {
  const response=await fetch(url,{headers:{Accept:"application/json",...(options.headers||{})},signal:AbortSignal.timeout(6500),...options});
  if(!response.ok) throw new Error("Upstream unavailable");
  return response.json();
}
async function aniList(q,page) {
  const payload=await jsonFetch(ANILIST,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:SEARCH,variables:{search:q,page}})});
  if(payload.errors?.length) throw new Error("AniList query failed");
  return {items:payload.data?.Page?.media||[],pageInfo:payload.data?.Page?.pageInfo||null};
}
async function jikan(q) {
  const payload=await jsonFetch(`${JIKAN}?q=${encodeURIComponent(q)}&limit=15&sfw=true`);
  return payload.data||[];
}
async function kitsu(q) {
  const params = new URLSearchParams();
  params.set("filter[text]", q);
  params.set("page[limit]", "20");
  const payload=await jsonFetch(`${KITSU}?${params.toString()}`,{headers:{"Accept":"application/vnd.api+json","Content-Type":"application/vnd.api+json"}});
  const normalizeText = (value) => String(value||"").toLocaleLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^\p{L}\p{N}]+/gu," ").trim();
  const query = normalizeText(q);
  return (payload.data||[]).filter((entry)=>{
    const a=entry.attributes||{};
    const rating=String(a.ageRating||"").toUpperCase();
    const guide=String(a.ageRatingGuide||"").toUpperCase();
    const titles = [a.canonicalTitle, ...Object.values(a.titles||{}), ...(a.abbreviatedTitles||[])].map(normalizeText).filter(Boolean);
    const titleMatch = query.length >= 3 && titles.some((title)=>title===query||title.startsWith(query)||(title.length >= 5 && query.startsWith(title)));
    return titleMatch && !["R","R18","R18+","NC-17"].includes(rating)&&!/(18\s*\+|R18|NC-17|ADULT)/.test(guide);
  });
}
export default async function handler(req,res) {
  if(req.method!=="GET"){res.setHeader("Allow","GET");return send(res,405,{error:"Method not allowed."},"no-store");}
  const q=clean(req.query?.q);
  const page=Math.min(Math.max(Number(req.query?.page)||1,1),10);
  if(q.length<2)return send(res,200,{anilist:[],mal:[],kitsu:[],pageInfo:null});
  const variants=[...new Set([q,q.replace(/[^\p{L}\p{N}]+/gu," ").trim()])].filter(Boolean).slice(0,2);
  const settled=await Promise.allSettled([
    ...variants.map((term)=>aniList(term,page)),
    jikan(q),
    kitsu(q)
  ]);
  const aniResults=settled.slice(0,variants.length).filter(x=>x.status==="fulfilled").map(x=>x.value);
  const aniMap=new Map();
  for(const result of aniResults) for(const item of result.items) aniMap.set(String(item.id),item);
  const info=aniResults.map(x=>x.pageInfo).filter(Boolean).sort((a,b)=>(b.total||0)-(a.total||0))[0]||null;
  const mal=settled[variants.length]?.status==="fulfilled"?settled[variants.length].value:[];
  const kitsuItems=settled[variants.length+1]?.status==="fulfilled"?settled[variants.length+1].value:[];
  const anyProvider=aniResults.length||mal.length||kitsuItems.length;
  if(!anyProvider)return send(res,502,{error:"Anime search providers are temporarily unavailable."},"no-store");
  return send(res,200,{anilist:[...aniMap.values()],mal,kitsu:kitsuItems,pageInfo:info,providers:{anilist:aniResults.length?"ok":"unavailable",jikan:settled[variants.length]?.status==="fulfilled"?"ok":"unavailable",kitsu:settled[variants.length+1]?.status==="fulfilled"?"ok":"unavailable"}});
}