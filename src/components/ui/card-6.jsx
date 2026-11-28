import * as React from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

export const MusicCard = React.forwardRef(({className,imageUrl,title,artist,songTitle,onPlay,...props},ref)=>{
  const cardVariants={initial:{scale:1},hover:{scale:1.025,transition:{type:"spring",stiffness:300,damping:20}}};
  const imageVariants={initial:{scale:1.1},hover:{scale:1,transition:{type:"spring",stiffness:300,damping:20}}};
  const playVariants={initial:{scale:.8,opacity:0},hover:{scale:1.08,opacity:1},tap:{scale:.95}};
  return <motion.div ref={ref} className={cn("relative h-64 w-full overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-lg",className)} variants={cardVariants} initial="initial" whileHover="hover" {...props}>
    <motion.img src={imageUrl} alt={title+" playlist artwork"} loading="lazy" className="absolute inset-0 h-full w-full object-cover" variants={imageVariants}/>
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent"/>
    <div className="relative z-10 flex h-full flex-col justify-end p-5"><div className="flex items-end justify-between gap-4"><div><h3 className="text-lg font-bold text-white">{title}</h3><p className="text-sm text-white/75">{artist} · {songTitle}</p></div>
      <motion.button type="button" onClick={e=>{e.stopPropagation();onPlay?.();}} aria-label={"Open playlist for "+title} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-black shadow-lg" variants={playVariants} whileTap="tap"><Play className="h-6 w-6 translate-x-px fill-current"/></motion.button></div></div>
  </motion.div>;
});
MusicCard.displayName="MusicCard";
