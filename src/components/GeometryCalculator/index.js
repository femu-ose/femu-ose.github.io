import React, {useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';
import {exposedBytes} from './capacity.mjs';

const FIELDS = [
  {key: 'secsz', label: 'Sector size (bytes)', initial: 512},
  {key: 'secs_per_pg', label: 'Sectors per page', initial: 8, max: 256},
  {key: 'pgs_per_blk', label: 'Pages per block', initial: 256, max: 65536},
  {key: 'blks_per_pl', label: 'Blocks per plane', initial: 256, max: 65536},
  {key: 'pls_per_lun', label: 'Planes per LUN', initial: 1, max: 16},
  {key: 'luns_per_ch', label: 'LUNs per channel', initial: 8, max: 128},
  {key: 'nchs', label: 'Channels', initial: 8, max: 4096},
];
const DEFAULTS = Object.fromEntries(FIELDS.map((f) => [f.key, String(f.initial)]));

function human(bytes) {
  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index++;
  }
  return `${Number.isInteger(value) ? value : value.toFixed(2)} ${units[index]}`;
}

export default function GeometryCalculator() {
  const [draft, setDraft] = useState(DEFAULTS);
  const [targetGiB, setTargetGiB] = useState('4');
  const derived = useMemo(() => {
    const g = Object.fromEntries(FIELDS.map((f) => [f.key, Number(draft[f.key])]));
    const invalid = FIELDS.filter((f) => !Number.isSafeInteger(g[f.key]) ||
      g[f.key] < 1 || g[f.key] > (f.max || 2147483647));
    if (invalid.length) {
      return {error: 'Enter positive whole numbers within the stated limits.', invalid};
    }
    const sectors = g.secs_per_pg * g.pgs_per_blk * g.blks_per_pl *
      g.pls_per_lun * g.luns_per_ch * g.nchs;
    if (sectors > 2147483647) {
      return {error: 'This geometry exceeds the FTL limit of 2,147,483,647 sectors.', invalid: []};
    }
    const page = g.secsz * g.secs_per_pg;
    const block = page * g.pgs_per_blk;
    const raw = sectors * g.secsz;
    if (!Number.isSafeInteger(raw)) {
      return {error: 'This capacity exceeds precise integer arithmetic in this calculator.', invalid: []};
    }
    // Ordinary page mapping, default 95% forced-GC watermark, one write pointer.
    const reserveLines = Math.floor((1 - 95 / 100) * g.blks_per_pl) + 1;
    const usable = Math.max(0, g.blks_per_pl - reserveLines) *
      block * g.pls_per_lun * g.luns_per_ch * g.nchs;
    const exposed = exposedBytes(raw);
    if (exposed < 512 || g.blks_per_pl <= reserveLines) {
      return {error: 'Too few spare lines for this recipe. Increase blocks per plane.', invalid: []};
    }
    // Keep the final partial exposed page inside the usable space, as the
    // device validator does by rounding exposed bytes up to whole pages.
    if (exposed > usable) {
      return {error: 'The exposed capacity, including any partial final page, exceeds the space left after the GC reserve. Increase blocks per plane.', invalid: []};
    }
    return {g, raw, exposed, page, block, parallel: g.nchs * g.luns_per_ch,
      invalid: [], error: null};
  }, [draft]);
  const target = Number(targetGiB);
  const targetValid = targetGiB.trim() !== '' && Number.isFinite(target) && target > 0;
  const suggested = !derived.error && targetValid ?
    Math.round(target * 1024 ** 3 / (derived.block * derived.g.pls_per_lun *
      derived.g.luns_per_ch * derived.g.nchs)) : null;
  const suggestionValid = suggested !== null && suggested >= 1 && suggested <= 65536;
  const command = derived.error ? null :
    '-device femu,femu_mode=1,op_pcent=10,\\\n  ' +
    FIELDS.map((f) => `${f.key}=${derived.g[f.key]}`).join(',');

  return (
    <div className={styles.wrap}>
      <p className={styles.note}>
        Black-box geometry with page mapping, default GC thresholds, and
        <code> op_pcent=10</code>. Raw NAND and exposed capacity are different.
      </p>
      <div className={styles.grid}>
        {FIELDS.map((f) => (
          <label key={f.key} className={styles.field}>
            <span className={styles.label}>{f.label}</span>
            <input type="number" min="1" max={f.max || 2147483647} step="1"
              value={draft[f.key]}
              onChange={(e) => setDraft((prev) => ({...prev, [f.key]: e.target.value}))}
              aria-invalid={derived.invalid.some((item) => item.key === f.key)}
              aria-describedby="geometry-status"
              className={styles.input} />
            <code className={styles.hint}>{f.key}</code>
            {f.max && <small>Maximum {f.max.toLocaleString('en-US')}</small>}
          </label>
        ))}
      </div>
      <div id="geometry-status" role="status" aria-live="polite">
        {derived.error ? <p className={styles.note}>{derived.error}</p> : (
          <div className={styles.result}>
            <div className={styles.big}>
              <span className={styles.bigLabel}>Raw NAND capacity</span>
              <span className={styles.bigValue}>{human(derived.raw)}</span>
            </div>
            <dl className={styles.facts}>
              <div><dt>Exposed</dt><dd>{human(derived.exposed)}</dd></div>
              <div><dt>Page</dt><dd>{human(derived.page)}</dd></div>
              <div><dt>Block</dt><dd>{human(derived.block)}</dd></div>
              <div><dt>LUNs</dt><dd>{derived.parallel}</dd></div>
            </dl>
          </div>
        )}
      </div>
      {command && <>
        <p className={styles.note} data-geometry-memory>
          Payload backing allocation: <strong>{human(derived.raw)}</strong> for
          this recipe, plus metadata for {(derived.raw / derived.page).toLocaleString('en-US')}
          {' '}raw pages, guest RAM, and QEMU overhead. This is an allocation
          size, not measured resident memory. Check the{' '}
          <Link to="/docs/host-resources#what-consumes-memory">host memory requirements</Link>
          {' '}before launching.
        </p>
        <p className={styles.cmd}>Device arguments for this recipe:</p>
        <pre className={styles.pre} tabIndex={0} role="region"
          aria-label="Generated FEMU device arguments"><code>{command}</code></pre>
      </>}
      <div className={styles.reverse}>
        <label className={styles.label}>
          Target raw NAND capacity (GiB):
          <input type="number" min="0" step="any" value={targetGiB}
            onChange={(e) => setTargetGiB(e.target.value)}
            aria-invalid={!targetValid} aria-describedby="geometry-target-status"
            className={styles.inputSmall} />
        </label>
        <div id="geometry-target-status" role="status" aria-live="polite">
          {!targetValid ? <p>Enter a positive capacity.</p> : !derived.error && (
            <p className={styles.suggest}>
              {suggestionValid ? <>
                Nearest whole-number geometry: <code>blks_per_pl={suggested}</code>.
                Apply it above to check the FTL and reserve limits.
              </> : 'The target cannot be reached within the blocks-per-plane limit.'}
            </p>
          )}
        </div>
      </div>
      <button type="button" className="button button--secondary"
        onClick={() => { setDraft(DEFAULTS); setTargetGiB('4'); }}>
        Reset geometry
      </button>
      <p className={styles.note}>
        This recipe exposes raw bytes divided by 1.10, rounded to 512-byte sectors.
        The calculator checks geometry and default GC reserve; device realization
        remains the final check. ZNS uses different geometry rules.
      </p>
    </div>
  );
}
