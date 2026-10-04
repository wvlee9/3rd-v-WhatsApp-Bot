import express from "express";
import { getDB, update } from "./store.js";
import { sendText } from "./whatsapp.js";
import { config } from "./config.js";
import { handleMessage } from "./bot.js";
const app=express(); app.use(express.json());

app.get("/webhook",(req,res)=>{
  if(req.query["hub.mode"]==="subscribe" && req.query["hub.verify_token"]===config.verifyToken)
    return res.status(200).send(req.query["hub.challenge"]);
  res.sendStatus(403);
});

app.post("/webhook",async(req,res)=>{
  res.sendStatus(200);
  try{
    for(const entry of req.body?.entry||[])
      for(const change of entry.changes||[])
        for(const message of change.value?.messages||[])
          if(message.type==="text")
            await handleMessage({from:message.from,text:message.text?.body||""});
  }catch(e){ console.error("Webhook error:",e); }
});

app.get("/",(_,res)=>res.json({bot:config.botName,status:"online",version:"4.0.0"}));

// Daily scheduled-message worker. It only sends to configured recipients in future versions;
// current schedules are stored and managed from WhatsApp.
setInterval(async()=>{
  try {
    const db=await getDB();
    const hhmm=new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
    for(const s of db.schedules||[]){
      if(s.enabled && s.time===hhmm && s.lastRun!==hhmm){
        s.lastRun=hhmm;
        await update(d=>{const x=d.schedules?.find(z=>z.time===s.time&&z.msg===s.msg); if(x)x.lastRun=hhmm;});
      }
    }
  } catch(e){ console.error("scheduler:",e); }
},60000);
app.listen(config.port,()=>console.log(`${config.botName} v2 on :${config.port}`));
