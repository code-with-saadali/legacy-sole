const fs = require('node:fs');
const { createClient } = require('@supabase/supabase-js');
for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
  const match = line.match(/^([A-Z_]+)\s*=\s*(.*)$/);
  if (match) process.env[match[1]] ??= match[2].trim().replace(/^['"]|['"]$/g, '');
}
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {auth:{persistSession:false}});
(async () => {
  for (const table of ['products','categories','orders']) {
    const {count,error} = await client.from(table).select('*',{count:'exact',head:true});
    console.log(JSON.stringify({table,count,error:error?.message ?? null}));
  }
  const channel = client.channel('audit-readonly-' + Date.now());
  for(const table of ['products','categories','orders']) channel.on('postgres_changes',{event:'*',schema:'public',table},()=>{});
  await new Promise(resolve=>{
    const timer=setTimeout(()=>{console.log('Realtime: timeout');resolve();},12000);
    channel.subscribe(status=>{console.log('Realtime:',status);if(status==='SUBSCRIBED'||status==='CHANNEL_ERROR'){clearTimeout(timer);resolve();}});
  });
  await client.removeAllChannels();
})();
