import React, {useEffect, useState} from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import LayoutProvider from '@theme/Layout/Provider';
import Footer from '@theme/Footer';
import styles from './styles.module.css';

const nav = [['overview', 'Overview'], ['program', 'Program'], ['prepare', 'Prepare'], ['team', 'Team'], ['resources', 'Resources'], ['faq', 'FAQ']];
const modules = [
  {id: 'S0', time: '13:15–13:45', title: 'FEMU architecture and the I/O path', tag: 'Architecture · NoSSD', question: 'What happens between a guest write and its completion?', text: 'Trace the path from a Linux application through the guest NVMe driver to FEMU. Use NoSSD as a baseline without NAND media timing, then verify that the returned bytes match the original data.', outcome: 'Explain the I/O path and verify an exact readback match.', topics: 'QEMU/KVM, guest and host boundaries, NVMe queues, data verification.'},
  {id: 'S1', time: '13:45–14:15', title: 'BlackBox SSDs, garbage collection and write amplification', tag: 'BlackBox SSD · GC · WAF', question: 'Why can one host write cause several writes inside a device?', text: 'Explore logical-to-physical mapping, garbage collection and NAND timing in BlackBox mode. Relate host writes to media work, and calculate write amplification over a consistent measurement interval.', outcome: 'Interpret garbage collection and write-amplification counters.', topics: 'Flash translation layers, overprovisioning, geometry, interval accounting.'},
  {id: 'S2', time: '14:30–15:00', title: 'Flexible Data Placement (FDP)', tag: 'Flexible Data Placement', question: 'What changes when the host communicates data-placement intent?', text: 'Compare the same workload with and without FDP placement hints. Keep capacity, workload and measurement intervals aligned so the result answers a placement question.', outcome: 'Design a controlled placement experiment and interpret its counters.', topics: 'Reclaim units, placement handles, host hints, matched experimental conditions.'},
  {id: 'S3', time: '15:00–15:30', title: 'Zoned Namespaces (ZNS)', tag: 'Zoned Namespaces', question: 'How does a zoned interface change what software must do?', text: 'Walk through zone states, sequential writes, append and reset. Observe the write pointer and an expected invalid operation to understand the interface contract.', outcome: 'Explain zone constraints and verify state transitions.', topics: 'Zone lifecycle, write pointers, append, reset, expected errors.'},
  {id: 'S4', time: '15:30–16:00', title: 'Computational storage', tag: 'Computational storage', question: 'How do we verify work performed at the storage device?', text: 'Follow a device-side compute request and compare its output with a host reference. Examine the program interface and execution limits before interpreting performance.', outcome: 'Verify a computation end to end and identify its execution boundaries.', topics: 'Host/device data flow, program loading, reference outputs, concurrency limits.'},
  {id: 'S5', time: '16:00–16:30', title: 'CXL-attached SSDs', tag: 'CXL-attached flash', question: 'What changes when flash is accessed through a memory interface?', text: 'Connect CXL device discovery to usable guest memory. Examine region creation, readback and counters, distinguishing enumeration from a successful memory-access experiment.', outcome: 'Explain the CXL path and the evidence needed to validate memory access.', topics: 'CXL Type-3 devices, guest kernel support, regions, DAX and memory semantics.'},
  {id: 'S6', time: '16:30–17:00', title: 'Extending FEMU, testing and contributing', tag: 'Development · Community', question: 'How does a small device change become a reusable research artifact?', text: 'Trace a command extension from dispatch to a guest-visible result. Pair a failing baseline with a passing regression, then record source, configuration and results for another researcher.', outcome: 'Describe a bounded extension, its regression test and an artifact handoff.', topics: 'NVMe command dispatch, red/green tests, source pins, contribution workflow and Q&A.'},
];
const layers = [
  ['Your workload', 'Applications · file systems · benchmarks', 'Applications run inside the guest and issue I/O through its operating system.'],
  ['Guest operating system', 'Linux · NVMe driver · CXL support', 'Observe the interfaces and responsibilities visible to the operating system.'],
  ['FEMU on QEMU/KVM', 'Device interfaces · policies · instrumentation', 'Change device behavior and inspect the path from a request to its completion.'],
  ['Emulated device', 'Mapping · garbage collection · media timing', 'Device models implement address mapping, garbage collection and media timing. Performance predictions require calibration against real hardware.'],
];
function Stack() {
  const [selected, setSelected] = useState(2);
  return <div className={styles.stackPanel}>
    <div className={styles.figureLabel}><span>FEMU system architecture</span></div>
    <div className={styles.stack} role="group" aria-label="Explore the FEMU system layers">
      {layers.map(([name, sub], i) => <React.Fragment key={name}>
        {i > 0 && <div className={styles.connector} aria-hidden="true">↓</div>}
        <button type="button" className={`${styles.layer} ${selected === i ? styles.selectedLayer : ''}`} aria-pressed={selected === i} onClick={() => setSelected(i)}>
          <span className={styles.layerNumber}>0{i + 1}</span><span><strong>{name}</strong><small>{sub}</small></span><span aria-hidden="true">↗</span>
        </button>
      </React.Fragment>)}
    </div>
    <p className={styles.layerExplanation} aria-live="polite">{layers[selected][2]}</p>
    <div className={styles.figureFoot}>Select a layer to explore its role.</div>
  </div>;
}
function SectionHeading({title, children}) {
  return <div className={styles.sectionHeading}><h2>{title}</h2>{children && <p>{children}</p>}</div>;
}
export default function Tutorial() {
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState('overview');
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting);
      if (visible.length) setActive(visible[0].target.id);
    }, {rootMargin: '-15% 0px -65% 0px'});
    nav.forEach(([id]) => {const section = document.getElementById(id); if (section) observer.observe(section);});
    return () => observer.disconnect();
  }, []);
  return <LayoutProvider>
    <Head><title>FEMU Tutorial at SIGOPS ATC ’26</title><meta name="description" content="A half-day FEMU tutorial on SSD emulation, placement, zoned storage, computational storage, CXL and reproducible systems research. View the schedule, preparation and team."/><link rel="canonical" href="https://femu-ose.github.io/tutorials/atc26/"/></Head>
    <div className={styles.site}>
      <a className={styles.skip} href="#main-content">Skip to content</a>
      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="FEMU tutorial home"><img src="/img/femu-mark.svg" alt=""/><span>FEMU <small>TUTORIAL</small></span></a>
        <button className={styles.menuButton} type="button" aria-expanded={menu} aria-controls="tutorial-nav" onClick={() => setMenu(!menu)}>{menu ? 'Close' : 'Menu'} <span aria-hidden="true">{menu ? '×' : '+'}</span></button>
        <nav id="tutorial-nav" aria-label="Tutorial" className={`${styles.nav} ${menu ? styles.navOpen : ''}`}>
          {nav.map(([id, label]) => <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined} onClick={() => setMenu(false)}>{label}</a>)}
          <Link to="/" className={styles.projectLink}>FEMU project ↗</Link>
        </nav>
      </header>
      <main id="main-content">
        <section id="top" className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <p className={styles.conference}>SIGOPS ATC ’26</p>
              <h1>FEMU for Storage<br/>Systems Research</h1>
              <p className={styles.heroDescription}>A half-day tutorial on using and extending FEMU, an open-source SSD emulator built on QEMU/KVM. We will cover its architecture, storage interfaces and support for experiments with real operating systems and applications.</p>
              <div className={styles.actions}><a href="#program" className={styles.primary}>View the schedule <span aria-hidden="true">↓</span></a><a href="#prepare" className={styles.secondary}>Prerequisites and setup</a></div>
              <p className={styles.heroNote}>For researchers, students and developers working on storage systems.</p>
            </div>
            <Stack/>
          </div>
        </section>
        <section id="overview" className={styles.section}>
          <div className={styles.overviewGrid}>
            <SectionHeading title="About the tutorial"/>
            <div className={styles.overviewText}><p>FEMU lets researchers study storage devices without needing access to specialized hardware. A guest operating system uses the emulated device through standard interfaces, while researchers can inspect and modify the device implementation, including its flash translation layer, garbage collection and timing model.</p><p>In this tutorial at SIGOPS ATC ’26, we will explain how FEMU works and how to use it in storage research. We will begin with the path of an I/O request, then discuss device-managed flash, Flexible Data Placement, Zoned Namespaces, computational storage and CXL-attached SSDs. The final session will cover extending FEMU and testing a new command.</p><p className={styles.textLinks}><Link to="/manual/concepts/architecture">Read the architecture overview ↗</Link><Link to="/docs/research/cite">Research behind FEMU ↗</Link></p></div>
          </div>
          <div className={styles.audience}><h3>Who should attend?</h3><p>Graduate students beginning storage research; file-system and database researchers exploring device behavior; and developers prototyping storage interfaces or contributing to FEMU. Prior FEMU experience is not required. Familiarity with Linux and basic storage concepts is helpful.</p></div>
        </section>
        <section id="program" className={`${styles.section} ${styles.programSection}`}>
          <div className={styles.programIntro}><SectionHeading title="Tentative schedule">The program combines technical explanations with guided examples. Select a session to read its description.</SectionHeading></div>
          <p className={styles.programNote}>The proposed afternoon schedule is shown below. We will update the times and presenter assignments when the conference program is finalized.</p>
          <div className={styles.schedule}>
            <div className={styles.interlude}><span>13:00–13:15</span><strong>Welcome & orientation</strong><span>Introduction to FEMU and the tutorial</span></div>
            {modules.map((module, i) => <React.Fragment key={module.id}>
              {i === 2 && <div className={`${styles.interlude} ${styles.breakRow}`}><span>14:15–14:30</span><strong>Break</strong><span></span></div>}
              <details className={styles.session}>
                <summary><span className={styles.time}>{module.time}<small>30 minutes</small></span><span className={styles.sessionId}>{module.id}</span><span className={styles.sessionTitle}><strong>{module.title}</strong></span><span className={styles.expand} aria-hidden="true">+</span></summary>
                <div className={styles.sessionBody}><p>{module.text}</p><p className={styles.topics}><strong>Topics:</strong> {module.topics}</p></div>
              </details>
            </React.Fragment>)}
          </div>
          <p className={styles.programNote}>FDP explores placement within a block interface. ZNS, computational storage and CXL change the host/device contract and answer different research questions.</p>
        </section>
        <section id="prepare" className={styles.section}>
          <SectionHeading title="Prerequisites and preparation">We recommend reviewing the requirements below before attending. Detailed installation and access instructions will be provided with the tutorial materials.</SectionHeading>
          <div className={styles.prepGrid}>
            <article className={styles.prepLead}><h3>Background and equipment</h3><ul><li>Comfort with Linux shell commands and SSH.</li><li>Basic understanding of processes, files and block I/O.</li><li>C/C++ familiarity for the extension session.</li><li>A laptop with a terminal and text editor.</li></ul><p>No prior FEMU experience or physical research SSD is required.</p></article>
            <div className={styles.prepOptions}><article><h3>Run locally on Linux</h3><p>The guest labs require an x86-64 Linux host with working KVM. The planned placement exercise reserves at least 20 GiB of available host RAM per active VM, plus disk space for the build, guest image and overlays.</p></article><article><h3>Connect to a remote host</h3><p>A macOS or Windows laptop can connect by SSH to a suitable Linux/KVM machine. We are still determining whether remote machines will be available for participants.</p></article><article><h3>Background reading</h3><p>You can read the architecture and mode guides without a lab machine. Start with the <Link to="/manual/concepts/choosing-a-mode">mode-selection guide</Link> and <Link to="/manual/getting-started/requirements">FEMU requirements</Link>.</p></article></div>
          </div>
          <p className={styles.logisticsNote}>The tutorial date, room and registration information will be added here when available. For questions about participation, please contact us through the <a href="https://groups.google.com/g/femu">FEMU discussion group</a>.</p>
        </section>
        <section id="team" className={`${styles.section} ${styles.teamSection}`}>
          <SectionHeading title="Organizers">The tutorial is organized by the FEMU team at Virginia Tech.</SectionHeading>
          <div className={styles.people}>
            <article><h3><a href="https://huaicheng.github.io/">Huaicheng Li ↗</a></h3><p className={styles.affiliation}>Assistant Professor · Virginia Tech</p><p>Creator and maintainer of FEMU. His research spans operating systems, storage and memory systems, with an emphasis on performance, efficiency and programmability.</p></article>
            <article><h3>Hansen Idden</h3><p className={styles.affiliation}>PhD student · Virginia Tech</p><p>Works on memory and storage systems. Co-author of Cylon, a full-system emulator for CXL-attached SSDs.</p></article>
            <article><h3>Shoaib Asif Qazi</h3><p className={styles.affiliation}>PhD student · Virginia Tech</p><p>Works on storage systems. Co-author of WARP, a study and emulator of SSDs with Flexible Data Placement.</p></article>
          </div>
          <p className={styles.teamNote}>Session-specific presenter assignments will be added with the final program. <a href="https://moatlab.github.io/">Meet MoatLab ↗</a></p>
        </section>
        <section id="resources" className={styles.section}>
          <div className={styles.resourcesGrid}><SectionHeading title="Materials and further reading">We will post the slides and lab instructions here when they are ready. The FEMU manual and source code are available for background reading.</SectionHeading><div className={styles.resourceList}>
            <Link to="/manual/"><span><strong>FEMU Manual</strong><small>Architecture, modes, configuration and development</small></span><span aria-hidden="true">↗</span></Link>
            <a href="https://github.com/MoatLab/FEMU"><span><strong>Source code</strong><small>Explore the public implementation and issue tracker</small></span><span aria-hidden="true">↗</span></a>
            <Link to="/docs/research/cite"><span><strong>Research & citation</strong><small>FEMU and the work behind its interfaces</small></span><span aria-hidden="true">↗</span></Link>
            <Link to="/docs/community"><span><strong>Join the community</strong><small>Ask questions, discuss experiments and contribute</small></span><span aria-hidden="true">↗</span></Link>
          </div></div>
          <p className={styles.releaseNote}>We are testing the lab environment and exercises. The materials will include setup instructions and any known limitations. Recordings are not currently available.</p>
        </section>
        <section id="faq" className={`${styles.section} ${styles.faqSection}`}>
          <SectionHeading title="Frequently asked questions"/>
          <div className={styles.faq}>
            {[
              ['Do I need a physical SSD or CXL device?', 'No physical research SSD or CXL device is required for the emulated-device exercises. A suitable Linux/KVM host is required for full-system execution.'],
              ['Can I participate from a Mac or Windows laptop?', 'Yes, as an SSH client to a suitable Linux/KVM host, or for reading and source exploration. A laptop running macOS alone does not provide the Linux/KVM environment used by the guest labs. Remote lab access arrangements will be announced separately.'],
              ['Will every session include hands-on work?', 'We plan to combine explanations with guided exercises. We will confirm which exercises participants can run themselves once testing of the lab environment is complete.'],
              ['Does emulation predict the exact performance of a real SSD?', 'Performance depends on the model, parameters, host and workload. FEMU makes mechanisms and interfaces observable and configurable. Quantitative predictions for a specific device require calibration and validation against that hardware.'],
              ['Where are the slides, labs and videos?', 'Tutorial materials will be released later. This site currently describes the program and how to prepare. Recordings are not available, and livestream arrangements have not been announced.'],
              ['How can I ask a question or contribute?', <>Use the <a href="https://groups.google.com/g/femu">FEMU discussion group</a> for participation and research questions, or the <a href="https://github.com/MoatLab/FEMU/issues">public issue tracker</a> for reproducible software issues. The <Link to="/docs/community">community guide</Link> explains how to get involved.</>],
            ].map(([q, a]) => <details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}
          </div>
        </section>

      </main>
      <Footer/>
    </div>
  </LayoutProvider>;
}
