import { config } from "./config.js";
import { sendText, sendButtons } from "./whatsapp.js";
import { getDB, update, pushLog } from "./store.js";

const rate=new Map();
const admin=from=>config.adminNumbers.has(from);

function spam(from,limit){
  const now=Date.now(), a=(rate.get(from)||[]).filter(t=>now-t<20000);
  a.push(now); rate.set(from,a); return a.length>limit;
}
const menu=`🤖 *WVLEE9 WH BOT V4*

📊 /status
📈 /stats
📜 /logs
📋 /menu

💬 /addcmd كلمة | رد
🗑️ /delcmd كلمة
🧾 /listcmd
🔗 /alias اسم | أمر
💬 /auto on|off

🛡️ /antispam on|off
🔢 /setspam رقم
🚫 /badword add|del كلمة
🚫 /badwords

⚠️ /warn رقم
✅ /unwarn رقم
🔎 /warnings رقم
⛔ /block رقم
♻️ /unblock رقم
📋 /blocked

👋 /setwelcome نص
👋 /welcome on|off

🔧 /maintenance on|off
🧹 /clearlogs

⏰ /schedule HH:MM | نص
📅 /schedules
❌ /delschedule رقم`;

const text=(s)=>s.trim();
async function reply(from,msg){ await update(d=>{d.stats.replies++;}); return sendText(from,msg); }

export async function handleMessage({from,text:raw}){
  if(!raw) return;
  const clean=text(raw), lower=clean.toLowerCase();
  let db=await getDB();
  await update(d=>{
    d.stats.messages++;
    d.users[from]??={messages:0};
    d.users[from].messages++;
    pushLog(d,{type:"message",from,preview:clean.slice(0,80)});
  });
  db=await getDB();

  if(db.blocked?.includes(from)) return;
  if(db.settings.maintenance && !admin(from)) return reply(from,"🔧 البوت في وضع الصيانة حاليًا.");

  if(lower==="/menu"||lower==="/help")
    return sendButtons(from,menu,["📊 الحالة","📈 الإحصائيات","🛡️ الحماية"]);

  if(lower==="/status")
    return reply(from,`🟢 *ONLINE*\n🤖 ${config.botName}\n📦 V4\n💬 Auto: ${db.settings.autoReply?"ON":"OFF"}\n🛡️ Anti-spam: ${db.settings.antiSpam?"ON":"OFF"}\n🔧 Maintenance: ${db.settings.maintenance?"ON":"OFF"}\n👥 Users: ${Object.keys(db.users).length}`);

  if(lower==="/stats")
    return reply(from,`📊 *STATS*\n📨 Messages: ${db.stats.messages}\n🤖 Replies: ${db.stats.replies}\n⚙️ Commands: ${db.stats.commands}\n👥 Users: ${Object.keys(db.users).length}`);

  if(lower==="/logs"){
    if(!admin(from)) return reply(from,"⛔ للمشرفين فقط.");
    const logs=(db.logs||[]).slice(0,10).map((x,i)=>`${i+1}. ${x.type} — ${x.from} — ${x.preview||""}`).join("\n");
    return reply(from,logs?`📜 آخر الأحداث:\n${logs}`:"لا توجد سجلات.");
  }

  if(lower==="/clearlogs"){
    if(!admin(from)) return reply(from,"⛔ للمشرفين فقط.");
    await update(d=>{d.logs=[];}); return reply(from,"🧹 تم مسح السجلات.");
  }

  if(lower.startsWith("/addcmd ")){
    if(!admin(from)) return reply(from,"⛔ للمشرفين فقط.");
    const raw2=clean.slice(8), i=raw2.indexOf("|");
    if(i<1) return reply(from,"❌ /addcmd كلمة | رد");
    const k=raw2.slice(0,i).trim().toLowerCase(), v=raw2.slice(i+1).trim();
    await update(d=>{d.commands[k]=v; d.stats.commands++; pushLog(d,{type:"addcmd",from,key:k});});
    return reply(from,`✅ تمت إضافة: ${k}`);
  }

  if(lower.startsWith("/delcmd ")){
    if(!admin(from)) return reply(from,"⛔ للمشرفين فقط.");
    const k=clean.slice(8).trim().toLowerCase();
    await update(d=>{delete d.commands[k]; pushLog(d,{type:"delcmd",from,key:k});});
    return reply(from,`🗑️ حذف: ${k}`);
  }

  if(lower==="/listcmd"){
    const keys=Object.keys(db.commands||{});
    return reply(from,keys.length?`🧾 الردود:\n${keys.map(k=>"• "+k).join("\n")}`:"لا توجد ردود.");
  }

  if(lower.startsWith("/alias ")){
    if(!admin(from)) return reply(from,"⛔ للمشرفين فقط.");
    const r=clean.slice(7),i=r.indexOf("|");
    if(i<1) return reply(from,"❌ /alias اسم | أمر");
    const k=r.slice(0,i).trim().toLowerCase(),v=r.slice(i+1).trim().toLowerCase();
    await update(d=>{d.aliases[k]=v;}); return reply(from,`🔗 تم إنشاء alias: ${k}`);
  }

  if(lower.startsWith("/auto ")){
    if(!admin(from)) return reply(from,"⛔ للمشرفين فقط.");
    const on=lower.endsWith("on"); await update(d=>{d.settings.autoReply=on;});
    return reply(from,on?"💬 Auto ON":"🔕 Auto OFF");
  }

  if(lower.startsWith("/antispam ")){
    if(!admin(from)) return reply(from,"⛔ للمشرفين فقط.");
    const on=lower.endsWith("on"); await update(d=>{d.settings.antiSpam=on;});
    return reply(from,on?"🛡️ Anti-spam ON":"🛡️ Anti-spam OFF");
  }

  if(lower.startsWith("/setspam ")){
    if(!admin(from)) return reply(from,"⛔ للمشرفين فقط.");
    const n=Number(clean.slice(9)); if(!Number.isInteger(n)||n<2||n>100) return reply(from,"❌ رقم 2–100.");
    await update(d=>{d.settings.spamLimit=n;}); return reply(from,`✅ الحد: ${n} رسالة/20ث`);
  }

  if(lower.startsWith("/badword ")){
    if(!admin(from)) return reply(from,"⛔ للمشرفين فقط.");
    const p=clean.split(/\s+/), action=p[1]?.toLowerCase(), word=p.slice(2).join(" ").toLowerCase();
    if(!["add","del"].includes(action)||!word) return reply(from,"❌ /badword add كلمة");
    await update(d=>{d.badwords??=[]; if(action==="add"&&!d.badwords.includes(word))d.badwords.push(word); if(action==="del")d.badwords=d.badwords.filter(x=>x!==word);});
    return reply(from,action==="add"?`🚫 أضيفت: ${word}`:`🗑️ حُذفت: ${word}`);
  }

  if(lower==="/badwords") return reply(from,(db.badwords||[]).length?db.badwords.map(x=>"• "+x).join("\n"):"لا توجد كلمات ممنوعة.");

  if(/^\/(warn|unwarn|warnings|block|unblock)\b/i.test(clean)){
    if(!admin(from)) return reply(from,"⛔ للمشرفين فقط.");
    const [cmd,arg]=clean.slice(1).split(/\s+/,2);
    if(!arg) return reply(from,`❌ /${cmd} رقم`);
    if(cmd==="warn"){await update(d=>{d.warnings[arg]=(d.warnings[arg]||0)+1;});return reply(from,`⚠️ ${arg}: ${((await getDB()).warnings[arg])} تحذير`);}
    if(cmd==="unwarn"){await update(d=>{d.warnings[arg]=Math.max(0,(d.warnings[arg]||0)-1);});return reply(from,"✅ تم خفض التحذير.");}
    if(cmd==="warnings") return reply(from,`⚠️ ${arg}: ${db.warnings?.[arg]||0}`);
    if(cmd==="block"){await update(d=>{d.blocked??=[];if(!d.blocked.includes(arg))d.blocked.push(arg);});return reply(from,"⛔ تم الحظر.");}
    if(cmd==="unblock"){await update(d=>{d.blocked=(d.blocked||[]).filter(x=>x!==arg);});return reply(from,"♻️ تم إلغاء الحظر.");}
  }

  if(lower==="/blocked") return admin(from)?reply(from,(db.blocked||[]).join("\n")||"لا يوجد."):reply(from,"⛔ للمشرفين فقط.");

  if(lower.startsWith("/setwelcome ")){
    if(!admin(from)) return reply(from,"⛔ للمشرفين فقط.");
    await update(d=>{d.welcomeMessage=clean.slice(12).trim();}); return reply(from,"✅ تم حفظ رسالة الترحيب.");
  }
  if(lower.startsWith("/welcome ")){
    if(!admin(from)) return reply(from,"⛔ للمشرفين فقط.");
    const on=lower.endsWith("on"); await update(d=>{d.settings.welcome=on;}); return reply(from,on?"👋 Welcome ON":"🔕 Welcome OFF");
  }

  if(lower.startsWith("/maintenance ")){
    if(!admin(from)) return reply(from,"⛔ للمشرفين فقط.");
    const on=lower.endsWith("on"); await update(d=>{d.settings.maintenance=on;}); return reply(from,on?"🔧 الصيانة ON":"🟢 الصيانة OFF");
  }

  if(lower.startsWith("/schedule ")){
    if(!admin(from)) return reply(from,"⛔ للمشرفين فقط.");
    const r=clean.slice(10),i=r.indexOf("|"); if(i<1)return reply(from,"❌ /schedule 18:30 | نص");
    const time=r.slice(0,i).trim(),msg=r.slice(i+1).trim();
    if(!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) return reply(from,"❌ الوقت HH:MM");
    await update(d=>{d.schedules??=[];d.schedules.push({time,msg,enabled:true});});
    return reply(from,`⏰ تمت إضافة الجدولة ${time}`);
  }

  if(lower==="/schedules"){
    if(!admin(from)) return reply(from,"⛔ للمشرفين فقط.");
    return reply(from,(db.schedules||[]).map((s,i)=>`${i}: ${s.time} — ${s.msg}`).join("\n")||"لا توجد جدولات.");
  }

  if(lower.startsWith("/delschedule ")){
    if(!admin(from)) return reply(from,"⛔ للمشرفين فقط.");
    const i=Number(clean.slice(13)); if(!Number.isInteger(i))return reply(from,"❌ /delschedule رقم");
    await update(d=>{d.schedules?.splice(i,1);}); return reply(from,"🗑️ تم حذف الجدولة.");
  }

  if(db.settings.antiSpam && spam(from,db.settings.spamLimit))
    return reply(from,"🛡️ تم تفعيل حماية السبام مؤقتًا.");

  if(!db.settings.autoReply) return;

  const alias=db.aliases?.[lower];
  const key=alias?.startsWith("/")?alias.slice(1):lower;
  const bad=(db.badwords||[]).find(w=>lower.includes(w));
  if(bad) return reply(from,"⚠️ الرجاء الالتزام بقوانين المجموعة.");

  const built=new Map([["السلام عليكم","وعليكم السلام ورحمة الله وبركاته 🌹"],["مرحبا","مرحبًا بك 👋🔥"],["hello","Hello 👋"],["بوت",`🤖 ${config.botName} جاهز.`]]);
  const ans=db.commands?.[key]||built.get(key);
  if(ans) return reply(from,ans);
}
