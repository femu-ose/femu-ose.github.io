import React, {useEffect, useId, useRef, useState} from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import useBaseUrl from '@docusaurus/useBaseUrl';
import downloads from '@site/static/downloads.json';

const artifactPaths = new Map([['downloads.json', 'downloads.json'],
  ...downloads.artifacts.map(artifact => [artifact.path.split('/').pop(), artifact.path])]);

function DocumentationLink(props) {
  const base = useBaseUrl('/');
  const prefix = `${base}assets/files/`;
  const filename = typeof props.href === 'string' && props.href.startsWith(prefix)
    ? props.href.slice(prefix.length).replace(/-([a-f0-9]{8,64})(\.[^.]+)$/, '$2')
    : null;
  if (artifactPaths.has(filename)) {
    // Static serving can send Content-Disposition with the URL's filename,
    // overriding download=. Use the stable public path as well as the name.
    return <a {...props} href={`${base}${artifactPaths.get(filename)}`}
      download={filename} target={undefined} />;
  }
  const Anchor = MDXComponents.a;
  return <Anchor {...props} />;
}

function ScrollableTable(props) {
  const ref = useRef(null);
  const hintId = useId();
  const [overflows, setOverflows] = useState(false);
  const [label, setLabel] = useState('Table');
  useEffect(() => {
    const element = ref.current;
    const table = element.firstElementChild;
    const caption = table.querySelector('caption')?.textContent.trim();
    const headings = [...table.querySelectorAll('thead th')]
      .map(header => header.textContent.trim()).filter(Boolean);
    setLabel(caption || (headings.length ? `Table: ${headings.join(', ')}` : 'Table'));
    const update = () => setOverflows(element.scrollWidth > element.clientWidth + 1);
    const observer = new ResizeObserver(update);
    observer.observe(element);
    observer.observe(table);
    update();
    return () => observer.disconnect();
  }, []);
  return (
    <div className="table-frame">
      {overflows && <p id={hintId} className="scroll-hint">Scroll horizontally to see all columns.</p>}
      <div ref={ref} className="table-scroll" role={overflows ? 'region' : undefined}
        aria-label={overflows ? label : undefined}
        aria-describedby={overflows ? hintId : undefined}
        tabIndex={overflows ? 0 : undefined}>
        <table {...props} />
      </div>
    </div>
  );
}

export default {...MDXComponents, a: DocumentationLink, table: ScrollableTable};
