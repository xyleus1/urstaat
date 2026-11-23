import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const base = new URL('../../research/part-2/assets/', import.meta.url);

test('both Taku exports are self-contained GLBs, within the transfer budget', async () => {
  const sizes = [];
  for (const [tier, budgetMiB] of [['mobile', 3.5], ['desktop', 7]]) {
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
  assert.ok(sizes[0] < sizes[1], 'Mobile uses the smaller export');
});

test('the in-motion mesh fits a single indexed draw', async () => {
  const bytes = await readFile(new URL('taku-motion.bin', base));
  assert.equal(bytes.toString('ascii', 0, 4), 'TKM1');
  const vertices = bytes.readUInt32LE(4), indices = bytes.readUInt32LE(8);
  assert.ok(vertices > 0 && vertices < 65536);
  assert.ok(indices > 0 && indices % 3 === 0);
  assert.equal(bytes.length, 36 + vertices * 12 + indices * 2);
  for (let i = 36 + vertices * 12; i < bytes.length; i += 2) assert.ok(bytes.readUInt16LE(i) < vertices);
});
