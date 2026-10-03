import assert from 'node:assert/strict';
import {exposedBytes} from '../src/components/GeometryCalculator/capacity.mjs';

// Expected values use integer division and 512-byte alignment from FEMU's
// femu_realize(), reviewed at 39a55eeb637b23c26b3a2ce9254399c9e0b1b3be.
const cases = [
  [512, 0],
  [564, 512],
  [17179869184, 15618062848],
  // secsz=900000001, pgs_per_blk=33361, blks_per_pl=201; other axes=1.
  // The previous floating-point expression returned 5486368097005056.
  [6035004906705561, 5486368097004544],
];
for (const [raw, expected] of cases) {
  assert.equal(exposedBytes(raw), expected, `raw capacity ${raw}`);
}
console.log(`Passed ${cases.length} capacity boundary cases.`);
