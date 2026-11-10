"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Root application error", error); }, [error]);
  return <html lang="en"><body style={{margin:0,background:"#08090b",color:"white",fontFamily:"system-ui,sans-serif"}}><main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24}}><section style={{maxWidth:500,textAlign:"center",padding:36,border:"1px solid #ffffff1a",borderRadius:24,background:"#ffffff08"}}><p style={{color:"#fda4af",letterSpacing:".2em",fontSize:12,fontWeight:700}}>ORYZ / SYSTEM</p><h1>We hit a snag</h1><p style={{color:"#aaa",lineHeight:1.6}}>The app had trouble starting this page. Please try again.</p><button onClick={() => reset()} style={{marginTop:16,padding:"12px 20px",border:0,borderRadius:12,fontWeight:700,cursor:"pointer"}}>Reload page</button></section></main></body></html>;
}
