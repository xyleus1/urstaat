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

test('desktop and portrait poster anchors land on their own visible CAD surfaces', async () => {
  const [anchors, surfaces] = await Promise.all(['still-anchors.json', 'still-surfaces.json']
    .map(name => readFile(new URL(name, base), 'utf8').then(JSON.parse)));
  const views = ['overview', 'side', 'face', 'shoulder', 'elbow', 'wrist', 'claw', 'waist', 'base'];
  const shots = [...views, 'right-shoulder', 'right-elbow', 'right-wrist', 'right-claw'];
  assert.equal(Object.keys(surfaces).length, shots.length * 2);
  assert.deepEqual(Object.keys(anchors).sort(), Object.keys(surfaces).sort());
  for (const shot of shots) for (const suffix of ['', '-mobile']) {
    const name = shot + suffix + '.webp';
    const [width, height, encoded] = surfaces[name], runs = Buffer.from(encoded, 'base64');
    const labels = new Uint8Array(width * height);
    let cursor = 0;
    for (let i = 0; i < runs.length; i += 2) {
      assert.ok(runs[i] && i + 1 < runs.length, name);
      labels.fill(runs[i + 1], cursor, cursor + runs[i]);
      cursor += runs[i];
    }
    assert.equal(cursor, labels.length, name);
    assert.ok(anchors[name].length && labels.includes(0), name);
    const visible = new Set(labels);
    visible.delete(0);
    for (const { id, side, x, y } of anchors[name]) {
      assert.ok(views.includes(id) && ['left', 'right'].includes(side) && x > 0 && x < 1 && y > 0 && y < 1, name);
      const code = views.indexOf(id) + 1 + (side === 'right' ? 9 : 0);
      assert.equal(labels[Math.floor(y * height) * width + Math.floor(x * width)], code, name + ' ' + id);
      assert.ok(visible.delete(code), name + ' contains a duplicate anchor');
    }
    assert.equal(visible.size, 0, 'Every labeled surface gets a hotspot on ' + name);
  }
});
