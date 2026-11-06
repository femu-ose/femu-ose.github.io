import React, {useEffect, useState} from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import LayoutProvider from '@theme/Layout/Provider';
import Footer from '@theme/Footer';
import styles from './styles.module.css';

const nav = [['overview', 'Overview'], ['program', 'Program'], ['prepare', 'Prepare'], ['team', 'Team'], ['resources', 'Resources'], ['faq', 'FAQ']];
const modules = [
  {id: 'S0', time: '13:15–13:45', title: 'Follow one I/O through the stack', tag: 'Architecture · NoSSD', question: 'What happens between a guest write and its completion?', text: 'Trace the path from a Linux application through the guest NVMe driver to FEMU. Use NoSSD as a baseline without NAND media timing, then verify that the returned bytes match the original data.', outcome: 'Explain the I/O path and verify an exact readback match.', topics: 'QEMU/KVM, guest and host boundaries, NVMe queues, data verification.'},
  {id: 'S1', time: '13:45–14:15', title: 'Look inside a flash SSD', tag: 'BlackBox SSD · GC · WAF', question: 'Why can one host write cause several writes inside a device?', text: 'Explore logical-to-physical mapping, garbage collection and NAND timing in BlackBox mode. Relate host writes to media work, and calculate write amplification over a consistent measurement interval.', outcome: 'Interpret garbage collection and write-amplification counters.', topics: 'Flash translation layers, overprovisioning, geometry, interval accounting.'},
  {id: 'S2', time: '14:30–15:00', title: 'Give the device placement information', tag: 'Flexible Data Placement', question: 'What changes when the host communicates data-placement intent?', text: 'Compare the same workload with and without FDP placement hints. Keep capacity, workload and measurement intervals aligned so the result answers a placement question.', outcome: 'Design a controlled placement experiment and interpret its counters.', topics: 'Reclaim units, placement handles, host hints, matched experimental conditions.'},
  {id: 'S3', time: '15:00–15:30', title: 'Move storage responsibility to the host', tag: 'Zoned Namespaces', question: 'How does a zoned interface change what software must do?', text: 'Walk through zone states, sequential writes, append and reset. Observe the write pointer and an expected invalid operation to understand the interface contract.', outcome: 'Explain zone constraints and verify state transitions.', topics: 'Zone lifecycle, write pointers, append, reset, expected errors.'},
  {id: 'S4', time: '15:30–16:00', title: 'Bring computation to the data', tag: 'Computational storage', question: 'How do we verify work performed at the storage device?', text: 'Follow a device-side compute request and compare its output with a host reference. Examine the program interface and execution limits before interpreting performance.', outcome: 'Verify a computation end to end and identify its execution boundaries.', topics: 'Host/device data flow, program loading, reference outputs, concurrency limits.'},
  {id: 'S5', time: '16:00–16:30', title: 'Explore memory-semantic storage', tag: 'CXL-attached flash', question: 'What changes when flash is accessed through a memory interface?', text: 'Connect CXL device discovery to usable guest memory. Examine region creation, readback and counters, distinguishing enumeration from a successful memory-access experiment.', outcome: 'Explain the CXL path and the evidence needed to validate memory access.', topics: 'CXL Type-3 devices, guest kernel support, regions, DAX and memory semantics.'},
  {id: 'S6', time: '16:30–17:00', title: 'Extend FEMU and make it reproducible', tag: 'Development · Community', question: 'How does a small device change become a reusable research artifact?', text: 'Trace a command extension from dispatch to a guest-visible result. Pair a failing baseline with a passing regression, then record source, configuration and results for another researcher.', outcome: 'Describe a bounded extension, its regression test and an artifact handoff.', topics: 'NVMe command dispatch, red/green tests, source pins, contribution workflow and Q&A.'},
];
const layers = [
  ['Your workload', 'Applications · file systems · benchmarks', 'Run real software in the guest and ask a concrete systems question.'],
  ['Guest operating system', 'Linux · NVMe driver · CXL support', 'Observe the interfaces and responsibilities visible to the operating system.'],
  ['FEMU on QEMU/KVM', 'Device interfaces · policies · instrumentation', 'Change device behavior and inspect the path from a request to its completion.'],
  ['Emulated device', 'Mapping · garbage collection · media timing', 'Control the model and understand which properties require hardware calibration.'],
];
function Stack() {
  const [selected, setSelected] = useState(2);
  return <div className={styles.stackPanel}>
    <div className={styles.figureLabel}><span>THE EXPERIMENT, END TO END</span><span aria-hidden="true">0{selected + 1} / 04</span></div>
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
function SectionHeading({number, label, title, children}) {
  return <div className={styles.sectionHeading}><p className={styles.eyebrow}>{number} / {label}</p><h2>{title}</h2>{children && <p>{children}</p>}</div>;
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
    <Head><title>FEMU Tutorial | Explore the Full Storage Stack</title><meta name="description" content="A half-day FEMU tutorial on SSD emulation, placement, zoned storage, computational storage, CXL and reproducible systems research. Explore the program, preparation and team."/><link rel="canonical" href="https://femu-ose.github.io/tutorials/atc26/"/></Head>
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
              <p className={styles.heroEyebrow}><span/> ATC26 EDITION · HALF-DAY TUTORIAL</p>
              <h1>Explore the full<br/>storage stack.<br/><em>Then change it.</em></h1>
              <p className={styles.heroDescription}>From a single I/O to new device interfaces. Learn to use FEMU to understand, evaluate and extend storage systems on commodity hardware.</p>
              <div className={styles.actions}><a href="#program" className={styles.primary}>Explore the program <span aria-hidden="true">↓</span></a><a href="#prepare" className={styles.secondary}>Plan your participation ↗</a></div>
              <p className={styles.heroNote}>For systems researchers, developers and students.</p>
            </div>
            <Stack/>
          </div>
          <div className={styles.facts}>
            <div><strong>7 sessions</strong><span>Architecture to extension</span></div>
            <div><strong>4-hour program</strong><span>Includes welcome and break</span></div>
            <div><strong>Full-system emulation</strong><span>Real guest software, configurable devices</span></div>
            <div><strong>Event details forthcoming</strong><span>Date, venue and registration to be announced</span></div>
          </div>
        </section>
        <section id="overview" className={styles.section}>
          <div className={styles.overviewGrid}>
            <SectionHeading number="01" label="THE TUTORIAL" title="A device you can inspect. A system you can change."/>
            <div className={styles.overviewText}><p>Emerging storage hardware is difficult to obtain, and commercial devices expose only part of their behavior. FEMU brings the device into software: a real guest operating system interacts with an emulated SSD whose interfaces, internal policies and timing model can be studied and modified.</p><p>This tutorial connects those device mechanisms to the software above them. Follow an I/O, explain media work, compare placement strategies, explore new interfaces and turn a small implementation change into a reproducible experiment.</p><p className={styles.textLinks}><Link to="/manual/concepts/architecture">Read the architecture overview ↗</Link><Link to="/docs/research/cite">Research behind FEMU ↗</Link></p></div>
          </div>
          <div className={styles.outcomes}>
            <article><span>UNDERSTAND</span><h3>Follow the mechanism</h3><p>Connect guest behavior to NVMe queues, flash mapping, garbage collection and device timing.</p></article>
            <article><span>EVALUATE</span><h3>Ask a controlled question</h3><p>Choose the right interface and baseline. Interpret results with consistent configurations and measurement intervals.</p></article>
            <article><span>EXTEND</span><h3>Make an idea testable</h3><p>Trace a bounded change through the device and guest, verify it, and capture enough evidence to reproduce it.</p></article>
          </div>
          <div className={styles.audience}><h3>Who should attend?</h3><p>Graduate students beginning storage research; file-system and database researchers exploring device behavior; and developers prototyping storage interfaces or contributing to FEMU. Prior FEMU experience is not required. Familiarity with Linux and basic storage concepts is helpful.</p></div>
        </section>
        <section id="program" className={`${styles.section} ${styles.programSection}`}>
          <div className={styles.programIntro}><SectionHeading number="02" label="PROGRAM" title="One afternoon. A path through the stack.">Each session connects a research question to a mechanism and an observable outcome. Expand a session for its scope.</SectionHeading><span className={styles.badge}>Tentative agenda</span></div>
          <p className={styles.programNote}>Illustrative 13:00–17:00 schedule. Final times, timezone and session assignments will be announced with the event details. Hands-on availability depends on the released environment.</p>
          <div className={styles.schedule}>
            <div className={styles.interlude}><span>13:00–13:15</span><strong>Welcome & orientation</strong><span>Research questions, workflow and community</span></div>
            {modules.map((module, i) => <React.Fragment key={module.id}>
              {i === 2 && <div className={`${styles.interlude} ${styles.breakRow}`}><span>14:15–14:30</span><strong>Break</strong><span>Pause, compare notes and ask questions</span></div>}
              <details className={styles.session}>
                <summary><span className={styles.time}>{module.time}<small>30 minutes</small></span><span className={styles.sessionId}>{module.id}</span><span className={styles.sessionTitle}><small>{module.tag}</small><strong>{module.title}</strong></span><span className={styles.expand} aria-hidden="true">+</span></summary>
                <div className={styles.sessionBody}><h3>{module.question}</h3><p>{module.text}</p><div className={styles.sessionOutcome}><strong>Learning outcome</strong><p>{module.outcome}</p></div><p className={styles.topics}><strong>Topics:</strong> {module.topics}</p></div>
              </details>
            </React.Fragment>)}
          </div>
          <p className={styles.programNote}>FDP explores placement within a block interface. ZNS, computational storage and CXL change the host/device contract and answer different research questions.</p>
        </section>
        <section id="prepare" className={styles.section}>
          <SectionHeading number="03" label="BEFORE YOU JOIN" title="Arrive ready to explore.">Choose how you will participate. Environment and access instructions will accompany the tutorial release.</SectionHeading>
          <div className={styles.prepGrid}>
            <article className={styles.prepLead}><span className={styles.eyebrow}>KNOWLEDGE</span><h3>Bring curiosity and a terminal.</h3><ul><li>Comfort with Linux shell commands and SSH.</li><li>Basic understanding of processes, files and block I/O.</li><li>C/C++ familiarity for the extension session.</li><li>A laptop with a terminal and text editor.</li></ul><p>No prior FEMU experience or physical research SSD is required.</p></article>
            <div className={styles.prepOptions}><article><h3>Run locally on Linux</h3><p>The guest labs require an x86-64 Linux host with working KVM. The planned placement exercise reserves at least 20 GiB of available host RAM per active VM, plus disk space for the build, guest image and overlays.</p></article><article><h3>Connect to a remote host</h3><p>A macOS or Windows laptop can connect by SSH to a suitable Linux/KVM machine. Organizer-provided remote capacity is not yet confirmed; do not assume a hosted seat is included.</p></article><article><h3>Study the concepts first</h3><p>You can read the architecture and mode guides without a lab machine. Start with the <Link to="/manual/concepts/choosing-a-mode">mode-selection guide</Link> and <Link to="/manual/getting-started/requirements">FEMU requirements</Link>.</p></article></div>
          </div>
          <div className={styles.logistics}><div><span>DATE & VENUE</span><strong>To be announced</strong></div><div><span>REGISTRATION</span><strong>Not yet announced</strong></div><div><span>REMOTE ACCESS</span><strong>Capacity to be confirmed</strong></div><div><span>QUESTIONS</span><a href="https://groups.google.com/g/femu">Ask the FEMU community ↗</a></div></div>
        </section>
        <section id="team" className={`${styles.section} ${styles.teamSection}`}>
          <SectionHeading number="04" label="PEOPLE" title="Meet the tutorial team.">Organized by researchers working across storage emulation, memory systems and host/device interfaces at Virginia Tech.</SectionHeading>
          <div className={styles.people}>
            <article><div className={styles.initials} aria-hidden="true">HL</div><p className={styles.personRole}>FACULTY ORGANIZER</p><h3><a href="https://huaicheng.github.io/">Huaicheng Li ↗</a></h3><p className={styles.affiliation}>Assistant Professor · Virginia Tech</p><p>Creator and maintainer of FEMU. His research spans operating systems, storage and memory systems, with an emphasis on performance, efficiency and programmability.</p></article>
            <article><div className={styles.initials} aria-hidden="true">HI</div><p className={styles.personRole}>TUTORIAL ORGANIZER</p><h3>Hansen Idden</h3><p className={styles.affiliation}>PhD student · Virginia Tech</p><p>Works on memory and storage systems. Co-author of Cylon, a full-system emulator for CXL-attached SSDs.</p></article>
            <article><div className={styles.initials} aria-hidden="true">SQ</div><p className={styles.personRole}>TUTORIAL ORGANIZER</p><h3>Shoaib Asif Qazi</h3><p className={styles.affiliation}>PhD student · Virginia Tech</p><p>Works on storage systems. Co-author of WARP, a study and emulator of SSDs with Flexible Data Placement.</p></article>
          </div>
          <p className={styles.teamNote}>Session-specific presenter assignments will be added with the final program. <a href="https://moatlab.github.io/">Meet MoatLab ↗</a></p>
        </section>
        <section id="resources" className={styles.section}>
          <div className={styles.resourcesGrid}><SectionHeading number="05" label="CONTINUE EXPLORING" title="Start with the project. Materials will follow.">Tutorial slides, lab bundles, VM instructions and recordings are not being released on this page yet.</SectionHeading><div className={styles.resourceList}>
            <Link to="/manual/"><span><strong>FEMU Manual</strong><small>Architecture, modes, configuration and development</small></span><span aria-hidden="true">↗</span></Link>
            <a href="https://github.com/MoatLab/FEMU"><span><strong>Source code</strong><small>Explore the public implementation and issue tracker</small></span><span aria-hidden="true">↗</span></a>
            <Link to="/docs/research/cite"><span><strong>Research & citation</strong><small>FEMU and the work behind its interfaces</small></span><span aria-hidden="true">↗</span></Link>
            <Link to="/docs/community"><span><strong>Join the community</strong><small>Ask questions, discuss experiments and contribute</small></span><span aria-hidden="true">↗</span></Link>
          </div></div>
          <div className={styles.releaseNotice}><span className={styles.statusDot}/><div><strong>Tutorial release in preparation</strong><p>The final lab environment and selected exercises are still being validated. Release-specific prerequisites, supported workflows and known limitations will be published with the materials.</p></div></div>
        </section>
        <section id="faq" className={`${styles.section} ${styles.faqSection}`}>
          <SectionHeading number="06" label="QUESTIONS" title="A few things to know."/>
          <div className={styles.faq}>
            {[
              ['Do I need a physical SSD or CXL device?', 'No physical research SSD or CXL device is required for the emulated-device exercises. A suitable Linux/KVM host is required for full-system execution.'],
              ['Can I participate from a Mac or Windows laptop?', 'Yes, as an SSH client to a suitable Linux/KVM host, or for reading and source exploration. A laptop running macOS alone does not provide the Linux/KVM environment used by the guest labs. Remote lab access arrangements will be announced separately.'],
              ['Will every session include hands-on work?', 'The planned program combines explanations and guided exercises. The final hands-on offering will be published after the lab environment is validated; the tentative agenda is a scope guide, not an assurance that every exercise is ready.'],
              ['Does emulation predict the exact performance of a real SSD?', 'Performance depends on the model, parameters, host and workload. FEMU makes mechanisms and interfaces observable and configurable. Quantitative predictions for a specific device require calibration and validation against that hardware.'],
              ['Where are the slides, labs and videos?', 'Tutorial materials will be released later. This site currently describes the program and how to prepare. Recordings are not available, and livestream arrangements have not been announced.'],
              ['How can I ask a question or contribute?', <>Use the <a href="https://groups.google.com/g/femu">FEMU discussion group</a> for participation and research questions, or the <a href="https://github.com/MoatLab/FEMU/issues">public issue tracker</a> for reproducible software issues. The <Link to="/docs/community">community guide</Link> explains how to get involved.</>],
            ].map(([q, a]) => <details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}
          </div>
        </section>
        <section className={styles.closing}><p className={styles.eyebrow}>FROM UNDERSTANDING TO CONTRIBUTION</p><h2>Bring a research question.<br/>Find the layer you can change.</h2><div className={styles.actions}><a className={styles.primary} href="#program">Revisit the program ↑</a><a className={styles.secondary} href="https://groups.google.com/g/femu">Join the conversation ↗</a></div></section>
      </main>
      <Footer/>
    </div>
  </LayoutProvider>;
}
