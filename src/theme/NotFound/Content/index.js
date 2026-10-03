import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

export default function NotFoundContent({className}) {
  const searchUrl = useBaseUrl('/search');
  const reportUrl = 'https://github.com/MoatLab/FEMU/issues/new?' +
    new URLSearchParams({
      title: 'Broken documentation link',
      body: 'Broken URL:\n\nWhere you found the link:\n\nWhat you expected to find:\n',
    });

  return (
    <main className={clsx('container', styles.content, className)}>
      <p className={styles.code}>404</p>
      <Heading as="h1">Page not found</Heading>
      <p>This address does not match a page in the FEMU website. Search the
        documentation or continue with one of these guides.</p>
      <form action={searchUrl} method="get" className={styles.search}>
        <label htmlFor="missing-page-search">Search the documentation</label>
        <div className={styles.searchControls}>
          <input id="missing-page-search" name="q" type="search" required
            placeholder="Try gc_policy, ZNS, or first experiment" />
          <button className="button button--primary" type="submit">Search</button>
        </div>
      </form>
      <ul className={styles.guides}>
        <li><Link to="/docs/start">Get started</Link>
          <span>Build FEMU and launch your first device.</span></li>
        <li><Link to="/docs/policies">Mapping, GC, and cache policies</Link>
          <span>Find supported policies and their interactions.</span></li>
        <li><Link to="/manual/reference/properties">Property reference</Link>
          <span>Look up property names, defaults, and source locations.</span></li>
      </ul>
      <p>Following a link from a paper or tutorial? <Link to={reportUrl}>
        Report the broken link</Link> and include where you found it.</p>
    </main>
  );
}
