const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createClient } = require('@supabase/supabase-js');
const cache = path.join(process.env.LOCALAPPDATA, 'npm-cache', '_npx');
const installation = fs.readdirSync(cache).map(name => path.join(cache, name, 'node_modules', 'playwright')).find(dir => fs.existsSync(path.join(dir, 'package.json')));
if (!installation) throw new Error('Run npm exec --yes --package @playwright/test -- playwright --version first.');
const { chromium } = require(installation);
for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
  const match = line.match(/^([A-Z_]+)\s*=\s*(.*)$/);
  if (match) process.env[match[1]] ??= match[2].trim().replace(/^['"]|['"]$/g, '');
}
const writer = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {auth:{persistSession:false}});
const slug = 'audit-browser-' + crypto.randomUUID();
const name = 'Realtime Audit ' + slug.slice(-8);
const category = 'Audit Category ' + slug.slice(-8);
function check(result) { if (result.error) throw new Error(result.error.message); }
async function publicChecks() {
  const {data,error}=await writer.from('products').select('*').order('created_at');
  if(error)throw new Error(error.message);
  const product=data.find(product=>product.stock>0);
  if(!product)throw new Error('No in-stock product for browser verification');
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const context=await browser.newContext();
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  try {
    await page.goto('http://localhost:3000/',{waitUntil:'domcontentloaded'});
    await page.locator('#collection').getByRole('heading',{name:product.name,exact:true}).waitFor();
    console.log('PASS: landing loads database catalogue.');
    await page.goto('http://localhost:3000/shop');
    await page.getByRole('heading',{name:product.name,exact:true}).waitFor();
    console.log('PASS: shop loads database products.');
    await page.goto('http://localhost:3000/products/'+product.slug);
    await page.getByRole('heading',{name:product.name,exact:true}).waitFor();
    await page.getByRole('button',{name:'Add '+product.name+' to favourites',exact:true}).click();
    await page.getByRole('button',{name:'Add to cart',exact:true}).click();
    await page.goto('http://localhost:3000/wishlist');
    await page.getByRole('heading',{name:product.name,exact:true}).waitFor();
    await page.goto('http://localhost:3000/cart');
    await page.getByRole('heading',{name:product.name,exact:true}).waitFor();
    console.log('PASS: product detail, wishlist and cart share actual catalogue data.');
    await page.goto('http://localhost:3000/checkout');
    await page.getByRole('button',{name:'Place order',exact:true}).waitFor();
    assert.equal(await page.getByRole('button',{name:'Place order',exact:true}).isEnabled(),true);
    console.log('PASS: valid in-stock cart reaches checkout. No order submitted.');
    await page.goto('http://localhost:3000/admin');
    await page.getByRole('heading',{name:'Admin sign in',exact:true}).waitFor();
    console.log('PASS: admin requires login.');
    await page.goto('http://localhost:3000/products/missing-audit-product');
    await page.getByText('This product is no longer available.',{exact:true}).waitFor();
    console.log('PASS: missing/deleted product cannot be purchased.');
    assert.deepEqual(errors,[]);
    console.log('PASS: no browser page errors.');
  } finally { await context.close();await browser.close();await writer.removeAllChannels(); }
}
if(process.argv.includes('--public')) {
  publicChecks().catch(error=>{console.error(error.message);process.exitCode=1});
} else {
(async () => {
  if (!process.env.AUDIT_ADMIN_EMAIL || !process.env.AUDIT_ADMIN_PASSWORD) throw new Error("Set temporary AUDIT_ADMIN_EMAIL and AUDIT_ADMIN_PASSWORD environment variables.");
  const signedIn = await writer.auth.signInWithPassword({email:process.env.AUDIT_ADMIN_EMAIL,password:process.env.AUDIT_ADMIN_PASSWORD});
  check(signedIn);
  const adminCheck = await writer.rpc("is_store_admin");
  check(adminCheck);
  if (!adminCheck.data) throw new Error("The signed-in test account is not a store admin.");
  const browser = await chromium.launch({channel:'msedge',headless:true});
  const context = await browser.newContext();
  const errors = [];
  const createPage = async route => {
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://localhost:3000' + route, {waitUntil:'domcontentloaded'});
    return page;
  };
  let productCreated = false;
  let categoryCreated = false;
  try {
    const admin = await createPage('/admin');
    await admin.getByLabel('Email',{exact:true}).fill(process.env.AUDIT_ADMIN_EMAIL);
    await admin.getByLabel('Password',{exact:true}).fill(process.env.AUDIT_ADMIN_PASSWORD);
    await admin.getByRole('button',{name:'Sign in',exact:true}).click();
    await admin.getByRole('heading',{name:'Dashboard',exact:true}).waitFor({timeout:15000});
    await admin.getByRole('button',{name:'Products',exact:true}).first().click();
    const shop = await createPage('/shop');
    const home = await createPage('/');
    await shop.waitForTimeout(2500);
    await admin.getByRole('button',{name:'Add new product',exact:true}).click();
    const editor = admin.getByRole('dialog');
    await editor.getByLabel('URL slug',{exact:true}).fill(slug);
    await editor.getByLabel('Product name',{exact:true}).fill(name);
    await editor.getByLabel('Price (Rs.)',{exact:true}).fill('91234');
    await editor.getByLabel('Stock quantity',{exact:true}).fill('2');
    await editor.getByLabel('Category',{exact:true}).selectOption('Everyday');
    await editor.getByLabel('Image URL',{exact:true}).fill('/images/shoes/runner-cutout.png');
    await editor.getByLabel('Badge / tag',{exact:true}).fill('NEW ARRIVAL');
    productCreated = true;
    await editor.getByRole('button',{name:'Save changes',exact:true}).click();
    await editor.waitFor({state:'detached'});
    await shop.getByRole('heading',{name,exact:true}).waitFor({timeout:15000});
    await home.getByRole('heading',{name,exact:true}).waitFor({timeout:15000});
    console.log('PASS: realtime insert appears on open shop and landing pages (including price above old cap).');
    const detail = await createPage('/products/' + slug);
    await detail.getByRole('heading',{name,exact:true}).waitFor();
    await detail.getByRole('button',{name:'Add '+name+' to favourites',exact:true}).click();
    await detail.getByRole('button',{name:'Add to cart',exact:true}).click();
    const wishlist = await createPage('/wishlist');
    const cart = await createPage('/cart');
    await wishlist.getByRole('heading',{name,exact:true}).waitFor();
    await cart.getByRole('heading',{name,exact:true}).waitFor();
    const card = admin.getByRole('article').filter({has:admin.getByRole('heading',{name,exact:true})});
    await card.getByRole('button',{name:'Edit',exact:true}).click();
    await admin.getByRole('dialog').getByLabel('Product name',{exact:true}).fill(name+' Updated');
    await admin.getByRole('dialog').getByLabel('Price (Rs.)',{exact:true}).fill('92345');
    await admin.getByRole('dialog').getByRole('button',{name:'Save changes',exact:true}).click();
    await admin.getByRole('dialog').waitFor({state:'detached'});
    for(const page of [shop,home,detail,wishlist,cart]) {
      await page.getByRole('heading',{name:name+' Updated',exact:true}).waitFor({timeout:15000});
      await page.getByText('Rs. 92,345',{exact:true}).first().waitFor({timeout:15000});
    }
    console.log('PASS: realtime name/price updates on shop, landing, detail, wishlist and cart without refresh.');
    check(await writer.from('products').update({stock:0}).eq('slug',slug));
    await detail.waitForFunction(() => [...document.querySelectorAll('button')].some(button => button.textContent.includes('Add to cart') && button.disabled));
    await cart.getByRole('alert').filter({hasText:'does not have enough stock'}).waitFor();
    console.log('PASS: stock updates disable purchase and flag the open cart.');
    admin.once('dialog', dialog => dialog.accept());
    await admin.getByRole('article').filter({has:admin.getByRole('heading',{name:name+' Updated',exact:true})}).getByRole('button',{name:'Delete',exact:true}).click();
    await admin.getByRole('heading',{name:name+' Updated',exact:true}).waitFor({state:'detached'});
    productCreated = false;
    await detail.getByText('This product is no longer available.',{exact:true}).waitFor();
    await shop.getByRole('heading',{name:name+' Updated',exact:true}).waitFor({state:'detached'});
    await wishlist.getByRole('heading',{name:name+' Updated',exact:true}).waitFor({state:'detached'});
    await cart.getByRole('alert').filter({hasText:'no longer available'}).waitFor();
    console.log('PASS: realtime delete removes listings and blocks stale product/cart actions.');
    check(await writer.from('categories').insert({name:category})); categoryCreated=true;
    await shop.getByRole('button',{name:category,exact:true}).waitFor();
    check(await writer.from('categories').delete().eq('name',category));categoryCreated=false;
    await shop.getByRole('button',{name:category,exact:true}).waitFor({state:'detached'});
    console.log('PASS: category insert/delete updates open shop filters.');
    const guestContext=await browser.newContext();
    const guestAdmin=await guestContext.newPage();
    await guestAdmin.goto('http://localhost:3000/admin');
    await guestAdmin.getByRole('heading',{name:'Admin sign in',exact:true}).waitFor();
    await guestContext.close();
    console.log('PASS: unauthenticated admin page requires login.');
    assert.deepEqual(errors,[]);
    console.log('PASS: no browser page errors.');
  } finally {
    if(productCreated) check(await writer.from('products').delete().eq('slug',slug));
    if(categoryCreated) check(await writer.from('categories').delete().eq('name',category));
    await context.close();await browser.close();await writer.removeAllChannels();
    console.log('Temporary audit records cleaned up.');
  }
})().catch(error=>{console.error(error.message);process.exitCode=1});

}
