const fs=require('node:fs');
const {createClient}=require('@supabase/supabase-js');
for(const line of fs.readFileSync('.env','utf8').split(/\r?\n/)){const m=line.match(/^([A-Z_]+)\s*=\s*(.*)$/);if(m)process.env[m[1]]??=m[2].trim().replace(/^['"]|['"]$/g,'');}
const options={auth:{persistSession:false,autoRefreshToken:false}};
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const writer=createClient(url,key,options),viewer=createClient(url,key,options);
const slug='audit-'+crypto.randomUUID(),category='Audit '+slug;
const events=[];
function check(error){if(error)throw new Error(error.message)}
async function event(table,type){const end=Date.now()+8000;while(Date.now()<end){if(events.some(e=>e.table===table&&e.eventType===type)){console.log(table,type,'realtime PASS');return;}await new Promise(r=>setTimeout(r,100));}console.log(table,type,'realtime NOT RECEIVED');}
(async()=>{
 const channel=viewer.channel(slug);
 for(const table of ['products','categories'])channel.on('postgres_changes',{event:'*',schema:'public',table},payload=>{if(payload.eventType==='DELETE'||payload.new.slug===slug||payload.new.name===category)events.push(payload)});
 try{
  await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error('Subscribe timeout')),12000);channel.subscribe(status=>{if(status==='SUBSCRIBED'){clearTimeout(timeout);resolve();}if(status==='CHANNEL_ERROR'){clearTimeout(timeout);reject(new Error(status));}})});
  check((await writer.from('products').insert({slug,name:'Temporary connection audit',category,price:123,stock:1,image:'/images/shoes/runner-cutout.png'})).error);
  await event('products','INSERT');
  check((await writer.from('products').update({price:124}).eq('slug',slug)).error);
  const read=await viewer.from('products').select('price').eq('slug',slug).single();check(read.error);if(read.data.price!==124)throw new Error('Update readback failed');
  await event('products','UPDATE');
  check((await writer.from('products').delete().eq('slug',slug)).error);
  await event('products','DELETE');
  const removed=await viewer.from('products').select('slug').eq('slug',slug);check(removed.error);if(removed.data.length)throw new Error('Delete failed');
  check((await writer.from('categories').insert({name:category})).error);await event('categories','INSERT');
  check((await writer.from('categories').delete().eq('name',category)).error);await event('categories','DELETE');
 }catch(error){console.error(error.message);process.exitCode=1;}
 finally{
  for(const [table,column,value]of [['products','slug',slug],['categories','name',category]]){const {error}=await writer.from(table).delete().eq(column,value);console.log(table,'cleanup',error?error.message:'OK')}
  await viewer.removeAllChannels();await writer.removeAllChannels();
 }
})();
