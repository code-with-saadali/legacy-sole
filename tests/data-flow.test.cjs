const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
function load(file, overrides = {}) {
  const filename = path.resolve(file);
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = loaded.require.bind(loaded);
  loaded.require = name => name in overrides ? overrides[name] : originalRequire(name);
  loaded._compile(compiled, filename);
  return loaded.exports;
}
const {parseCart, cartIssues} = load('src/app/_data/cart.ts');
const product = {slug:'test-shoe',name:'Shoe',price:100,image:'/shoe.png',stock:2};
const cartItem = {...product,size:'UK 8',quantity:1};

test('invalid local cart JSON does not crash the page', () => {
  assert.deepEqual(parseCart('{broken'), []);
  assert.deepEqual(parseCart('{"slug":"not-an-array"}'), []);
});
test('cart rejects invalid sizes, quantities and prices', () => {
  assert.deepEqual(parseCart(JSON.stringify([cartItem,{...cartItem,quantity:-1},{...cartItem,quantity:0.5},{...cartItem,size:'UK 100'},{...cartItem,price:-1}])), [cartItem]);
});
test('stock is aggregated across cart sizes', () => {
  assert.equal(cartIssues([cartItem,{...cartItem,size:'UK 9',quantity:2}],[product]).length,1);
  assert.deepEqual(cartIssues([cartItem,{...cartItem,size:'UK 9'}],[product]),[]);
});
test('deleted and out of stock products block stale cart checkout', () => {
  assert.match(cartIssues([cartItem],[])[0],/no longer available/);
  assert.match(cartIssues([cartItem],[{...product,stock:0}])[0],/enough stock/);
});
function catalog(result) {
  const chain = { select:()=>chain, eq:()=>chain, order:async()=>result, maybeSingle:async()=>result };
  return load('src/app/_data/products.ts',{'../../lib/supabase':{supabase:{from:()=>chain}}});
}
test('last product deletion returns an empty catalogue', async () => {
  assert.deepEqual(await catalog({data:[],error:null}).getProducts(),[]);
});
test('database failures are not silently replaced by empty products', async () => {
  const data = catalog({data:null,error:{message:'Connection failed'}});
  await assert.rejects(data.getProducts(),/Connection failed/);
  await assert.rejects(data.getCategories(),/Connection failed/);
  await assert.rejects(data.getProductBySlug('test'),/Connection failed/);
});
test('missing slug is different from a database failure', async () => {
  assert.equal(await catalog({data:null,error:null}).getProductBySlug('deleted'),undefined);
});
test('database rows normalize price, stock, details and missing images', () => {
  const data=catalog({});
  const result=data.normalizeProduct({slug:'test',price:'100',stock:'2',details:null,image:''});
  assert.equal(result.price,100);assert.equal(result.stock,2);assert.deepEqual(result.details,[]);assert.equal(result.image,'/images/shoes/runner-cutout.png');
});
