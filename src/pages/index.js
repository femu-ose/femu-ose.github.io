import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import QuickStart from '@site/src/components/QuickStart';
import styles from './index.module.css';

/*
 * The landing page is set like the first page of a paper: one statement, the
 * overview figure, then short sections separated by rules. No cards, no
 * shaded panels, one primary action.
 */

const MODES = [
  ['NoSSD', 'femu_mode=2', 'DRAM device with no media timing; the control condition', '/manual/modes/nossd'],
  ['BlackBox SSD', 'femu_mode=1', 'Device-side FTL, garbage collection and NAND timing', '/manual/modes/blackbox'],
  ['FDP', 'fdp=on', 'Flexible Data Placement on a BlackBox SSD', '/manual/features/fdp'],
  ['ZNS', 'femu_mode=3', 'Zoned namespaces with host-managed placement', '/manual/modes/zns'],
  ['Open-Channel', 'femu_mode=0', 'The host runs the FTL', '/manual/modes/ocssd'],
  ['Key-value', 'femu_mode=5', 'The NVMe key-value command set', '/manual/modes/kvssd'],
  ['Computational', 'femu_mode=4', 'Programs that run on the device', '/manual/modes/csd'],
  ['CXL SSD', 'femu-cxl-ssd', 'Flash behind a CXL Type-3 memory device', '/manual/modes/cxl-ssd'],
];

const USES = [
  ['Run storage software against a device you can change.',
   'A real guest kernel drives the emulated SSD, so file systems, databases and SPDK run unmodified.',
   [['Get started', '/docs/start'], ['tutorials', '/manual/tutorials']]],
  ['Study the FTL and the flash timing.',
   'Mapping schemes, garbage collection policies, write buffering and NAND timing are configurable and traced through the source.',
   [['architecture', '/manual/concepts/architecture'], ['design notes', '/docs/implementation']]],
  ['Prototype new interfaces before the hardware exists.',
   'Zoned namespaces, Flexible Data Placement, key-value, computational storage and CXL-attached flash.',
   [['choosing a mode', '/manual/concepts/choosing-a-mode']]],
  ['Reproduce and extend published work.',
   'Pin a commit and a configuration, measure with the device counters, and cite the paper behind each mode.',
   [['reproducibility', '/docs/research/reproducibility'], ['cite FEMU', '/docs/research/cite']]],
];

/* Newest first; keep to five. Each entry links to a post or a page with the details. */
const UPDATES = [
  ['2026-10', 'The FEMU Manual is on the website', '/blog/femu-manual'],
  ['2026-10', 'FEMU receives an NSF POSE award to build its open-source ecosystem', '/blog/nsf-pose-award'],
  ['2026-09', 'Cylon and WARP presented at SNIA SDC 2026', '/docs/research/cite'],
  ['2026-09', 'Guides to FEMU\u2019s implementation, policies and configurations', '/blog/implementation-guides'],
  ['2026', 'New papers on FEMU: WARP and Cylon (FAST \u201926), CEMU (ASPLOS \u201926)', '/docs/research/cite'],
];

function Hero() {
  return (
    <header className={styles.hero}>
      <h1 className={styles.title}>FEMU</h1>
      <p className={styles.subtitle}>NVMe and CXL SSD emulation for storage systems research</p>
      <p className={styles.lede}>
        FEMU is an SSD emulator built on QEMU/KVM. A guest operating system sees
        the emulated SSD as a real PCIe device and drives it with its own NVMe or
        CXL drivers, while FEMU charges NAND, channel and garbage-collection time
        from a timing model you configure.
      </p>
      <h2 className={styles.quickTitle}>Run it in five minutes</h2>
      <p className={styles.quickLead}>
        Build FEMU, make a guest image with one script, and boot a virtual
        machine that has an emulated SSD.
      </p>
      <QuickStart compact />
      <p className={styles.lede}>What you can do with it:</p>
      <ol className={styles.uses}>
        {USES.map(([lead, text, links]) => (
          <li key={lead}>
            <strong>{lead}</strong> {text}{' '}
            ({links.map(([label, to], i) => (
              <React.Fragment key={to}>{i > 0 && ', '}<Link to={to}>{label}</Link></React.Fragment>
            ))}).
          </li>
        ))}
      </ol>
      <p className={styles.meta}>
        Documents FEMU <code>master</code> on QEMU 10.1.0 ·{' '}
        <Link to="/manual/changelog">changelog</Link> ·{' '}
        <Link to="/manual">manual</Link> (<Link href="pathname:///pdf/femu-manual.pdf">PDF</Link>) ·{' '}
        <Link href="https://github.com/MoatLab/FEMU">source</Link>
      </p>
    </header>
  );
}

function Overview() {
  return (
    <section>
      <figure className={styles.figure}>
        <img src={useBaseUrl('/img/manual/arch-overview.svg')}
          alt="Where FEMU sits: the guest drives FEMU's NVMe or CXL device, the timing model decides when each request completes, and the data goes to the memory backend in host memory." />
        <figcaption>
          Where FEMU sits: the guest drives FEMU's NVMe or CXL device, the timing
          model decides when each request completes, and the data goes straight to
          the memory backend in host memory.
        </figcaption>
      </figure>
    </section>
  );
}

function Modes() {
  return (
    <section className={styles.section}>
      <h2>Devices</h2>
      <p className={styles.sectionLead}>
        One binary emulates several kinds of SSD. Several namespaces of
        different modes can share one controller.
      </p>
      <table className={styles.modeTable}>
        <tbody>
          {MODES.map(([name, select, use, to]) => (
            <tr key={name}>
              <td className={styles.modeName}><Link to={to}>{name}</Link></td>
              <td className={styles.modeSelect}><code>{select}</code></td>
              <td>{use}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.after}>
        <Link to="/manual/concepts/choosing-a-mode">Choosing a mode</Link>
      </p>
    </section>
  );
}

function Updates() {
  return (
    <section className={styles.section}>
      <h2>Updates</h2>
      <table className={styles.modeTable}>
        <tbody>
          {UPDATES.map(([date, text, to]) => (
            <tr key={text}>
              <td className={styles.updateDate}>{date}</td>
              <td><Link to={to}>{text}</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.after}>
        <Link to="/blog">All news</Link> ·{' '}
        <Link to="/docs/community/meetings">Community meetings</Link>
      </p>
    </section>
  );
}

function Limits() {
  return (
    <section className={`${styles.section} ${styles.last}`}>
      <h2>What it does not model</h2>
      <p className={styles.sectionLead}>
        FEMU models timing, placement and wear. It does not model cells, voltages
        or raw bit errors, and its backing store is host memory, so data is gone
        when the emulator exits. The limits are written down rather than left to
        be discovered: <Link to="/docs/modes/fidelity">model fidelity</Link>.
      </p>
    </section>
  );
}

export default function Home() {
  return (
    <Layout
      title="NVMe and CXL SSD emulation for storage research"
      description="FEMU is an NVMe and CXL SSD emulator for storage systems research: a real guest kernel, a configurable FTL and NAND timing model, and eight device modes.">
      <main className={styles.page}>
        <Hero />
        <Overview />
        <Modes />
        <Updates />
        <Limits />
      </main>
    </Layout>
  );
}
