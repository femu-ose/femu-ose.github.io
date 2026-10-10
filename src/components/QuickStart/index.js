import React from 'react';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import styles from './styles.module.css';

/*
 * The shortest path from nothing to a VM with an emulated SSD. The commands
 * are the ones in the FEMU Manual's quick start; tools/check-quickstart.py
 * fails the build if one of them is no longer there.
 */
export const STEPS = [
  {
    title: 'Build FEMU',
    note: '3 to 15 minutes, depending on the number of cores.',
    commands: [
      'git clone https://github.com/MoatLab/FEMU.git',
      'cd FEMU',
      'mkdir build-femu',
      'cd build-femu',
      'cp ../femu-scripts/femu-copy-scripts.sh .',
      './femu-copy-scripts.sh',
      'sudo ./pkgdep.sh',
      './femu-compile.sh',
    ],
  },
  {
    title: 'Make the guest image',
    note: 'One script downloads Ubuntu 24.04 and prepares it for FEMU.',
    commands: ['sudo apt install curl cloud-image-utils', './make-guest-image.sh'],
  },
  {
    title: 'Boot a VM with an emulated SSD',
    note: 'Leave this terminal running.',
    commands: ['./run-blackbox.sh'],
  },
  {
    title: 'See the SSD from a second terminal',
    note: 'The guest lists it as a FEMU BlackBox-SSD Controller.',
    commands: ['./run-guest-ssh.sh sudo nvme list'],
  },
];

const NEEDS =
  'You need an x86_64 Ubuntu or Debian host with KVM, sudo, and about 17 GiB of free RAM.';

function More() {
  return (
    <p className={styles.more}>
      {NEEDS}{' '}
      <Link to="/manual/getting-started/quick-start">
        Step by step, with the output to expect
      </Link>{' '}
      · <Link to="/docs/compatibility">Compatibility</Link>
    </p>
  );
}

/* compact: one code block for the home page; otherwise one block per step. */
export default function QuickStart({compact = false}) {
  if (compact) {
    const lines = STEPS.flatMap((s, i) => [`# ${i + 1}. ${s.title}`, ...s.commands, '']);
    return (
      <div className={styles.quick}>
        <CodeBlock language="bash">{lines.join('\n').trimEnd()}</CodeBlock>
        <More />
      </div>
    );
  }
  return (
    <div className={styles.quick}>
      <ol className={styles.steps}>
        {STEPS.map((s) => (
          <li key={s.title}>
            <p className={styles.stepTitle}>
              <strong>{s.title}.</strong> {s.note}
            </p>
            <CodeBlock language="bash">{s.commands.join('\n')}</CodeBlock>
          </li>
        ))}
      </ol>
      <More />
    </div>
  );
}
