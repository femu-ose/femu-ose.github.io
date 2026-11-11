import React from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import LayoutProvider from '@theme/Layout/Provider';
import Footer from '@theme/Footer';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

/*
 * Event page for the FEMU tutorial at SIGOPS ATC '26. It has its own header
 * and a wide layout, separate from the FEMU site's documentation look: event
 * facts beside the introduction, then materials, the program, preparation,
 * organizers and papers, following conference tutorial pages such as Vortex
 * and FireSim. Event facts come from the ATC 2026 workshops page; MoatLab
 * organizer photos and home pages come from the MoatLab site.
 */

const ATC = 'https://www.sigops.org/s/conferences/atc/2026';
const REPO = 'https://github.com/MoatLab/FEMU';

const FACTS = [
  ['Conference', <><a href={`${ATC}/`}>SIGOPS ATC 2026</a>, November 15 to 18, 2026</>],
  ['Date', 'Sunday, November 15, 2026'],
  ['Time', <>08:00 to 12:00 Hong Kong local time, coffee break 10:00 to 10:30 (<a href={`${ATC}/workshops.html`}>conference program</a>)</>],
  ['Room', <>Salon II and III, <a href={`${ATC}/hotel.html`}>Hyatt Regency Hong Kong, Sha Tin</a></>],
  ['Registration', <>Workshops and tutorials registration through the <a href={`${ATC}/registration.html`}>ATC 2026 registration page</a></>],
  ['Format', 'Half-day tutorial: talks with guided examples on FEMU'],
  ['Preparation', <>Optional; see <a href="#prepare">Before you come</a>. The FEMU code and manual are available now; the tutorial slides and lab guide are not yet released.</>],
];

const LINKS = [
  ['Code', [
    ['FEMU on GitHub', REPO, 'Source, issues and discussions'],
    ['Contributing guide', `${REPO}/blob/master/CONTRIBUTING.md`, 'How to propose and test a change'],
  ]],
  ['Set up', [
    ['Get started', '/docs/start', 'Build FEMU and boot a guest'],
    ['Host requirements', '/manual/getting-started/requirements', 'Linux, KVM and memory'],
    ['Guest image', '/manual/getting-started/guest-image', 'The VM image the exercises use'],
  ]],
  ['Learn', [
    ['FEMU Manual', '/manual/', 'Architecture, modes and configuration'],
    ['Manual tutorials', '/manual/tutorials', 'Exercises that match the sessions'],
    ['FEMU website', '/', 'News, research and community'],
  ]],
];

/* [time, id, title, summary, [[label, href], ...], presenter] */
const PROGRAM = [
  ['08:00', '', 'Welcome and setup check', 'Goals of the morning, the FEMU project and how to follow along.', []],
  ['08:10', 'S0', 'FEMU architecture and the I/O path', 'From a guest application through the NVMe driver into FEMU; NoSSD mode as a baseline without media timing.',
    [['Architecture', '/manual/concepts/architecture'], ['First SSD', '/manual/tutorials/01-first-ssd']]],
  ['08:40', 'S1', 'BlackBox SSDs: mapping, garbage collection and write amplification', 'Logical-to-physical mapping, garbage collection and NAND timing, and how to measure write amplification over a fixed interval.',
    [['BlackBox mode', '/manual/modes/blackbox'], ['GC and WAF', '/manual/tutorials/02-gc-and-waf']]],
  ['09:10', 'S2', 'Flexible Data Placement (FDP)', 'The same workload with and without placement hints, with capacity and measurement held constant.',
    [['FDP', '/manual/features/fdp'], ['Exercise', '/manual/tutorials/04-fdp'], ['WARP paper', 'https://www.usenix.org/conference/fast26/presentation/song']]],
  ['09:35', 'S3', 'Zoned Namespaces (ZNS)', 'Zone states, sequential writes, append and reset, and what the host must now manage.',
    [['ZNS mode', '/manual/modes/zns'], ['Exercise', '/manual/tutorials/03-zns']]],
  ['09:55', '', 'Questions', '', []],
  ['10:00', '', 'Coffee break', 'Provided by the conference.', []],
  ['10:30', 'S4', 'Computational storage', 'A compute request run on the device, checked against a host reference result.',
    [['CSD mode', '/manual/modes/csd'], ['CEMU paper', 'https://doi.org/10.1145/3779212.3790137']], 'Tao Lu, DapuStor'],
  ['10:50', 'S5', 'CXL-attached SSDs', 'From CXL device discovery to usable guest memory, with flash behind a memory interface.',
    [['CXL SSD', '/manual/modes/cxl-ssd'], ['Exercise', '/manual/tutorials/08-cxl-memory'], ['Cylon paper', 'https://www.usenix.org/conference/fast26/presentation/yoon']]],
  ['11:10', 'S6', 'Extending FEMU, testing and contributing', 'Add a small device command, test it, and package the change so others can reproduce it.',
    [['Code structure', '/manual/development/code-structure'], ['Contributing', `${REPO}/blob/master/CONTRIBUTING.md`]]],
  ['11:40', '', 'Questions and next steps', 'Open discussion, and how to stay involved in the FEMU community.', [['Community', '/docs/community']]],
];

const PEOPLE = [
  ['Huaicheng Li', 'https://huaicheng.github.io/', 'https://moatlab.github.io/moatlab-pics/huaicheng-vt.jpg', 'Assistant Professor, Virginia Tech',
    'Creator and maintainer of FEMU. Works on operating systems, storage and memory systems.'],
  ['Hansen Idden', 'https://hansenidden18.github.io/', 'https://moatlab.github.io/students/hansen-idden.jpg', 'PhD student, Virginia Tech',
    'Works on memory and storage systems; co-author of Cylon, the FEMU CXL SSD emulator.'],
  ['Shoaib Qazi', 'https://shoaibcs.github.io/', 'https://moatlab.github.io/students/shoaib-qazi.jpg', 'PhD student, Virginia Tech',
    'Works on storage systems; co-author of WARP, the FEMU FDP emulator.'],
  ['Tao Lu', 'https://github.com/taovcu', null, 'Manager, Emerging Technology Department, DapuStor',
    'Co-author of CEMU, the computational storage emulator. Presents the computational storage session (S4).'],
];

const PAPERS = [
  ['The CASE of FEMU: Cheap, Accurate, Scalable and Extensible Flash Emulator', 'FAST \'18', 'https://www.usenix.org/conference/fast18/presentation/li', 'FEMU itself; all sessions'],
  ['Characterizing and Emulating FDP SSDs with WARP', 'FAST \'26', 'https://www.usenix.org/conference/fast26/presentation/song', 'S2, Flexible Data Placement'],
  ['CEMU: Enabling Full-System Emulation of Computational Storage Beyond Hardware Limits', 'ASPLOS \'26', 'https://doi.org/10.1145/3779212.3790137', 'S4, computational storage'],
  ['Cylon: Fast and Accurate Full-System Emulation of CXL-SSDs', 'FAST \'26', 'https://www.usenix.org/conference/fast26/presentation/yoon', 'S5, CXL-attached SSDs'],
];

const FAQ = [
  ['Do I need an SSD or a CXL device?', 'No. Every session uses emulated devices. Running the exercises yourself needs an x86-64 Linux host with KVM.'],
  ['Can I follow along on a Mac or Windows laptop?', 'Yes, by connecting over SSH to a Linux machine with KVM. A laptop on its own can follow the talks and read the code, but cannot run the guest exercises.'],
  ['Does FEMU predict the performance of a specific real SSD?', 'Not without calibration. FEMU makes device mechanisms observable and configurable; matching a particular drive requires measuring that drive and tuning the model to it.'],
  ['Will the tutorial be recorded?', 'No recording has been announced. This page will link the slides and lab guide when they are released.'],
];

function A({href, children, className}) {
  return href.startsWith('/') ? <Link to={href} className={className}>{children}</Link> : <a href={href} className={className}>{children}</a>;
}

const NAV = [['program', 'Program'], ['prepare', 'Preparation'], ['materials', 'Materials'], ['organizers', 'Organizers']];

export default function Tutorial() {
  const map = useBaseUrl('/img/site/tutorial-map.svg');
  return (
    <LayoutProvider>
      <Head>
        <title>FEMU Tutorial at SIGOPS ATC 2026</title>
        <meta name="description" content="Half-day FEMU tutorial at SIGOPS ATC 2026, Sunday November 15, 08:00 to 12:00, Hyatt Regency Hong Kong, Sha Tin: schedule, materials, preparation and organizers."/>
        <link rel="canonical" href="https://femu-ose.github.io/tutorials/atc26/"/>
      </Head>
      <div className={styles.site}>
        <header className={styles.topbar}>
          <div className={styles.wrap}>
            <a href="#top" className={styles.brand}><img src={useBaseUrl('/img/femu-mark.svg')} alt="" width="26" height="26"/><span>FEMU Tutorial <span className={styles.brandEvent}>ATC 2026</span></span></a>
            <nav aria-label="Sections" className={styles.topnav}>
              {NAV.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
            </nav>
            <div className={styles.toplinks}><Link to="/">FEMU website</Link><a href={REPO}>GitHub</a></div>
          </div>
        </header>

        <main id="top">
          <section className={styles.hero}>
            <div className={`${styles.wrap} ${styles.heroGrid}`}>
              <div>
                <p className={styles.kicker}>Half-day tutorial at <a href={`${ATC}/workshops.html`}>SIGOPS ATC 2026</a>, Hong Kong</p>
                <h1>FEMU for Next-Generation Storage Research</h1>
                <p className={styles.subtitle}>Emulating, Extending, and Building the Future of Storage Systems</p>
                <p className={styles.lede}>FEMU is an open-source SSD emulator built on QEMU/KVM. A guest operating system uses the emulated device through standard NVMe and CXL interfaces, while the device itself, including its flash translation layer, garbage collection and timing model, is code you can read, measure and change. This tutorial shows how to use it for storage research and how to extend it.</p>
              </div>
              <aside className={styles.factsCard} aria-label="Event details">
                <dl>{FACTS.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
              </aside>
            </div>
          </section>

          <div className={styles.wrap}>
            <section id="materials" className={styles.section}>
              <h2>Materials and links</h2>
              <div className={styles.linkGrid}>
                {LINKS.map(([group, items]) => <div key={group}>
                  <h3>{group}</h3>
                  <ul>{items.map(([label, href, note]) => <li key={label}><A href={href}>{label}</A><span>{note}</span></li>)}</ul>
                </div>)}
                <div>
                  <h3>Tutorial</h3>
                  <ul><li><span className={styles.pending}>Slides and lab guide</span><span>Not yet released; this page will link them</span></li>
                    <li><a href="https://groups.google.com/g/femu">Mailing list</a><span>Questions before and after the tutorial</span></li></ul>
                </div>
              </div>
            </section>

            <section id="about" className={`${styles.section} ${styles.twoCol}`}>
              <div>
                <h2>About the tutorial</h2>
                <p>The morning follows one I/O request from a guest application into the emulated device. It then uses the same setup to look at device-managed flash, Flexible Data Placement, Zoned Namespaces, computational storage and CXL-attached SSDs. The last session shows how to add a device feature, test it and share it.</p>
                <p>Each session pairs a short explanation with an example on FEMU, and links to the manual pages and exercises you can repeat afterwards.</p>
              </div>
              <div>
                <h2>Who should attend</h2>
                <p>Graduate students starting storage research, file-system and database researchers who want to see what happens inside the device, and developers prototyping storage interfaces.</p>
                <p>No prior FEMU experience is needed. Familiarity with Linux and basic storage concepts helps.</p>
              </div>
            </section>

            <section id="program" className={styles.section}>
              <h2>Program</h2>
              <p className={styles.note}>Sunday, November 15, 2026. All times are Hong Kong local time. Times within the morning may shift slightly.</p>
              <figure className={styles.figure}>
                  <a href={map}><img src={map} alt="The tutorial sessions on FEMU's structure: S1 to S5 are the BlackBox, FDP, ZNS, computational storage and CXL SSD interfaces, which share the frontend, FTL, NAND timing and memory backend; S0 follows one request through the whole stack and S6 changes and tests the device code."/></a>
                  <figcaption>Where each session sits in FEMU. S1 to S5 each use a different device interface over the same frontend, FTL, NAND timing model and memory backend. S0 follows one request through the whole stack; S6 changes the device code and tests it.</figcaption>
                </figure>
              <div>
                <table className={styles.program}>
                  <thead><tr><th scope="col">Time</th><th scope="col">Session</th><th scope="col">Related</th></tr></thead>
                  <tbody>{PROGRAM.map(([time, id, title, summary, refs, presenter]) => (
                    <tr key={time} className={id ? undefined : styles.plainRow}>
                      <td className={styles.time}>{time}</td>
                      <td><span className={styles.sessionTitle}>{id && <span className={styles.sid}>{id}</span>}{title}</span>{summary && <span className={styles.summary}>{summary}</span>}{presenter && <span className={styles.presenter}>Presented by {presenter}</span>}</td>
                      <td className={styles.refs}>{refs.map(([label, href]) => <A key={label} href={href}>{label}</A>)}</td>
                    </tr>))}
                  </tbody>
                </table>

              </div>
            </section>

            <section id="prepare" className={`${styles.section} ${styles.twoCol}`}>
              <div>
                <h2>Before you come</h2>
                <p>You can follow the whole tutorial without running anything. To run the exercises yourself:</p>
                <ol>
                  <li>Use an x86-64 Linux machine with KVM, local or reachable over SSH. Check the <Link to="/manual/getting-started/requirements">host requirements</Link>; the FDP exercise needs about 20 GiB of free host memory.</li>
                  <li>Build FEMU and boot a guest with <Link to="/docs/start">Get started</Link>, and prepare the <Link to="/manual/getting-started/guest-image">guest image</Link>.</li>
                  <li>Skim the <Link to="/manual/concepts/architecture">architecture overview</Link> and <Link to="/manual/concepts/choosing-a-mode">choosing a mode</Link>.</li>
                </ol>
                <p>The extension session uses C; the rest uses the Linux shell.</p>
              </div>
              <div id="faq">
                <h2>FAQ</h2>
                <dl className={styles.faq}>{FAQ.map(([q, a]) => <React.Fragment key={q}><dt>{q}</dt><dd>{a}</dd></React.Fragment>)}</dl>
                <p className={styles.note}>Other questions: the <a href="https://groups.google.com/g/femu">FEMU mailing list</a>, <a href={`${REPO}/discussions`}>GitHub Discussions</a>, or <a href={`${REPO}/issues`}>issues</a> for bugs.</p>
              </div>
            </section>

            <section id="organizers" className={styles.section}>
              <h2>Organizers</h2>
              <div className={styles.people}>{PEOPLE.map(([name, home, photo, role, bio]) => (
                <div key={name} className={styles.person}>
                  <a href={home}>{photo
                    ? <img src={photo} alt={`Photo of ${name}`} width="120" height="120"/>
                    : <span className={styles.initials} aria-hidden="true">{name.split(' ').map((w) => w[0]).join('')}</span>}</a>
                  <div><a href={home} className={styles.personName}>{name}</a><span className={styles.role}>{role}</span><p>{bio}</p></div>
                </div>))}
              </div>
              <p className={styles.note}>Huaicheng Li, Hansen Idden and Shoaib Qazi are from <a href="https://moatlab.github.io/">MoatLab</a> at Virginia Tech; Tao Lu is from DapuStor.</p>
            </section>

            <section id="papers" className={styles.section}>
              <h2>Papers</h2>
              <table className={styles.papers}>
                <thead><tr><th scope="col">Paper</th><th scope="col">Venue</th><th scope="col">Covered in</th></tr></thead>
                <tbody>{PAPERS.map(([title, venue, href, used]) => <tr key={title}><td><a href={href}>{title}</a></td><td>{venue}</td><td>{used}</td></tr>)}</tbody>
              </table>
              <p className={styles.note}>BibTeX for each paper is on <Link to="/docs/research/cite">Cite FEMU</Link>.</p>
            </section>
          </div>
        </main>
        <Footer/>
      </div>
    </LayoutProvider>
  );
}
