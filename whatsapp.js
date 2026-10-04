import { config } from "./config.js";
const base = `https://graph.facebook.com/${config.graphApiVersion}/${config.phoneNumberId}/messages`;
async function send(payload){
  const res=await fetch(base,{method:"POST",headers:{"Authorization":`Bearer ${config.accessToken}`,"Content-Type":"application/json"},body:JSON.stringify(payload)});
  const data=await res.json(); if(!res.ok) throw new Error(JSON.stringify(data)); return data;
}
export const sendText=(to,body)=>send({messaging_product:"whatsapp",recipient_type:"individual",to,type:"text",text:{preview_url:false,body}});
export const sendButtons=(to,body,buttons)=>send({messaging_product:"whatsapp",to,type:"interactive",interactive:{type:"button",body:{text:body},action:{buttons:buttons.slice(0,3).map((title,i)=>({type:"reply",reply:{id:`btn_${i}`,title:title.slice(0,20)}}))}}});
