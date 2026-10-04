import fs from "node:fs/promises";
const FILE="./bot-data.json";
const defaults={
  settings:{autoReply:true,antiSpam:true,spamLimit:6,welcome:false,maintenance:false},
  commands:{},
  aliases:{},
  warnings:{},
  blocked:[],
  badwords:[],
  welcomeMessage:"مرحباً بك 👋🔥",
  logs:[],
  schedules:[],
  stats:{messages:0,replies:0,commands:0},
  users:{}
};
async function load(){
  try { return JSON.parse(await fs.readFile(FILE,"utf8")); }
  catch { await save(defaults); return structuredClone(defaults); }
}
async function save(db){ await fs.writeFile(FILE,JSON.stringify(db,null,2)); }
export const getDB=load;
export async function update(fn){ const db=await load(); await fn(db); await save(db); return db; }
export function pushLog(db,event){ db.logs??=[]; db.logs.unshift({at:new Date().toISOString(),...event}); db.logs=db.logs.slice(0,200); }
