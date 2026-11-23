import crypto from "node:crypto";
const secret=()=>process.env.LUNRA_SESSION_SECRET;
const sign=(v)=>crypto.createHmac("sha256",secret()).update(v).digest("base64url");
const signed=(v)=>v+"."+sign(v);
const verify=(v)=>{if(!v)return null;const i=v.lastIndexOf(".");if(i<1)return null;const payload=v.slice(0,i),sig=v.slice(i+1),expected=sign(payload);try{return crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected))?payload:null;}catch{return null;}};
const cookie=(name,value,maxAge)=>name+"="+value+"; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age="+maxAge;
const b64=(v)=>Buffer.from(v).toString("base64url");
export default async function handler(req,res){
 const action=req.query.action||"";
 if(!secret()||!process.env.DISCORD_CLIENT_ID||!process.env.DISCORD_CLIENT_SECRET||!process.env.DISCORD_REDIRECT_URI)return res.status(503).json({error:"Discord OAuth is not configured. Set the required Vercel environment variables."});
 if(action==="login"){
  const state=b64(crypto.randomBytes(24));res.setHeader("Set-Cookie",cookie("lunra_state",signed(state),600));
  const url=new URL("https://discord.com/oauth2/authorize");url.searchParams.set("client_id",process.env.DISCORD_CLIENT_ID);url.searchParams.set("response_type","code");url.searchParams.set("redirect_uri",process.env.DISCORD_REDIRECT_URI);url.searchParams.set("scope","identify email");url.searchParams.set("state",state);return res.redirect(302,url.toString());
 }
 if(action==="callback"){
  const raw=req.headers.cookie||"",stateCookie=raw.match(/(?:^|; )lunra_state=([^;]+)/)?.[1],validState=verify(stateCookie);
  if(!req.query.code||!req.query.state||!validState||validState!==req.query.state)return res.status(400).send("OAuth state validation failed.");
  try{
   const tokenResponse=await fetch("https://discord.com/api/oauth2/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:process.env.DISCORD_CLIENT_ID,client_secret:process.env.DISCORD_CLIENT_SECRET,grant_type:"authorization_code",code:req.query.code,redirect_uri:process.env.DISCORD_REDIRECT_URI})});
   if(!tokenResponse.ok)return res.status(502).send("Discord token exchange failed.");
   const token=await tokenResponse.json();const me=await fetch("https://discord.com/api/users/@me",{headers:{Authorization:"Bearer "+token.access_token}});
   if(!me.ok)return res.status(502).send("Unable to retrieve Discord identity.");const user=await me.json();
   const payload=b64(JSON.stringify({id:user.id,username:user.username,global_name:user.global_name||user.username,avatar:user.avatar,email:user.email||null,exp:Date.now()+7*86400000}));
   res.setHeader("Set-Cookie",[cookie("lunra_session",signed(payload),7*86400),cookie("lunra_state","",0)]);return res.redirect(302,"/universe?discord=connected");
  }catch{return res.status(500).send("OAuth callback failed.");}
 }
 if(action==="me"){
  const val=(req.headers.cookie||"").match(/(?:^|; )lunra_session=([^;]+)/)?.[1],payload=verify(val);if(!payload)return res.status(401).json({authenticated:false});
  try{const user=JSON.parse(Buffer.from(payload,"base64url").toString());if(user.exp<Date.now())return res.status(401).json({authenticated:false});return res.status(200).json({authenticated:true,user});}catch{return res.status(401).json({authenticated:false});}
 }
 if(action==="logout"){res.setHeader("Set-Cookie",cookie("lunra_session","",0));return res.status(200).json({ok:true});}
 return res.status(404).json({error:"Unknown action"});
}
