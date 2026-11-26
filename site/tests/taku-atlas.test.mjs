import assert from 'node:assert/strict';
import test from 'node:test';
import { parts, nodes, edges } from '../../research/part-2/supply-data.js';
import { robotParts, studyCatalog } from '../../research/part-2/robot-parts.js';

const shots = ['overview', 'side', 'face', 'shoulder', 'elbow', 'wrist', 'claw', 'waist', 'base'];
const stages = new Set(['raw', 'refining', 'material', 'component', 'assembly']);
const scopes = new Set(['representative', 'documented-process', 'verified-relationship']);

test('every assembly and all 23 exploded pieces lead to a sourced step in their own network', () => {
  assert.deepEqual(Object.keys(robotParts), Object.keys(parts));
  assert.equal(Object.values(studyCatalog).reduce((count, study) => count + study.parts.length, 0), 23);
  for (const [id, entry] of Object.entries(robotParts)) {
    const network = parts[id].edgeIds.map((key) => edges[key]);
    const sites = new Set(network.flatMap((edge) => [edge.from, edge.to]));
    assert.equal(entry.node, parts[id].focusNode);
    if (!entry.study) {
      assert.ok(entry.info && sites.has(entry.node));
      continue;
    }
    for (const piece of studyCatalog[entry.study].parts) {
      assert.ok(piece.name && piece.detail && piece.trace && sites.has(piece.node), id + ': ' + piece.name);
      assert.ok(nodes[piece.node].sources.length);
    }
  }
});
function sourced(item) {
  assert.ok(item.sources.length, item.id + ' needs sources');
  for (const source of item.sources) {
    assert.ok(source.title && new URL(source.url).protocol === 'https:', item.id);
  }
}

test('every camera has a sourced, acyclic manufacturing sequence with independently selectable inputs', () => {
  assert.deepEqual(Object.keys(parts), shots);
  for (const [id, p] of Object.entries(parts)) {
    sourced(p);
    assert.ok(p.geometry && p.summary);
    const connections = p.edgeIds.map((key) => edges[key]);
    assert.equal(new Set(p.edgeIds).size, p.edgeIds.length, id + ' repeats connections');
    const used = new Set(connections.flatMap((e) => [e.from, e.to]));
    assert.ok(used.size > 5);
    assert.ok(used.has(p.focusNode), id + ' opens at a part-specific production step');
    const connected = new Set([p.focusNode]);
    for (const key of connected) {
      for (const e of connections) {
        if (e.from === key) connected.add(e.to);
        if (e.to === key) connected.add(e.from);
      }
    }
    assert.equal(connected.size, used.size, id + ' has a detached branch');
    if (['shoulder', 'elbow', 'wrist'].includes(id)) assert.ok(connections.length >= 20);
    assert.ok(
      [...used].some(
        (key) =>
          connections.filter((e) => e.to === key).length > 1 ||
          connections.filter((e) => e.from === key).length > 1,
      ),
      id + ' needs a branching route',
    );
    const done = new Set(),
      pending = new Set();
    function visit(key) {
      if (done.has(key)) return;
      assert.ok(!pending.has(key), id + ' contains a cycle at ' + key);
      pending.add(key);
      for (const e of connections.filter((e) => e.from === key)) visit(e.to);
      pending.delete(key);
      done.add(key);
    }
    used.forEach(visit);
  }
});
test('industrial evidence and geographic locations survive for every site and connection', () => {
  for (const n of Object.values(nodes)) {
    sourced(n);
    assert.ok(n.site && n.place && n.detail && stages.has(n.stage), n.id);
    assert.ok(
      Number.isFinite(n.lon) && Math.abs(n.lon) <= 180 && Number.isFinite(n.lat) && Math.abs(n.lat) <= 90,
      n.id,
    );
  }
  for (const e of Object.values(edges)) {
    sourced(e);
    assert.ok(nodes[e.from] && nodes[e.to] && e.from !== e.to && e.detail && scopes.has(e.scope), e.id);
  }
});
