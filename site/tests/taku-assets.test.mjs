import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const base = new URL('../../research/part-2/assets/', import.meta.url);

test('the three fixed Taku exports are self-contained GLBs within their transfer budgets', async () => {
  const sizes = [];
  for (const [tier, budgetMiB] of [['mobile', 3.5], ['software', 2], ['desktop', 7]]) {
    const bytes = await readFile(new URL('taku-' + tier + '.glb', base));
    assert.equal(bytes.toString('ascii', 0, 4), 'glTF');
    assert.equal(bytes.readUInt32LE(4), 2);
    assert.equal(bytes.readUInt32LE(8), bytes.length);
    assert.equal(bytes.toString('ascii', 16, 20), 'JSON');
    const gltf = JSON.parse(bytes.toString('utf8', 20, 20 + bytes.readUInt32LE(12)));
    const names = new Set(gltf.nodes.map(node => node.name));
    for (const side of ['', 'right_']) {
      for (const joint of ['shoulder', 'elbow', 'wrist', 'claw']) {
        assert.ok(names.has('view_' + side + joint), 'Missing camera anchor ' + side + joint);
      }
    }
    for (const resource of [...gltf.buffers, ...(gltf.images || [])]) {
      assert.ok(!resource.uri || resource.uri.startsWith('data:'), 'GLB depends on external asset ' + resource.uri);
    }
    assert.ok(bytes.length < budgetMiB * 1048576, tier + ' model alone exceeds the entire viewer budget');
    sizes.push(bytes.length);
  }
  assert.ok(sizes[0] < sizes[1] && sizes[1] < sizes[2], 'The three fixed exports have distinct budgets');
});

test('each desktop and portrait still has a visible hit region for its selected CAD component',async()=>{
  const regions=JSON.parse(await readFile(new URL('still-regions.json',base),'utf8'));
  const shots=['overview','side','face','shoulder','elbow','wrist','claw','waist','base','right-shoulder','right-elbow','right-wrist','right-claw'];
  assert.equal(Object.keys(regions).length,shots.length*2);
  for(const shot of shots)for(const suffix of ['', '-mobile']){
    const name=shot+suffix+'.webp';
    const [width,height,encoded]=regions[name],bits=Buffer.from(encoded,'base64');
    assert.equal(bits.length,Math.ceil(width*height/8));
    assert.ok(bits.some(byte=>byte!==0)&&bits.some(byte=>byte!==255),name);
  }
});
