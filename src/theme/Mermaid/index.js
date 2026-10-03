import React, {useId, useState} from 'react';
import Mermaid from '@theme-original/Mermaid';

export default function ReadableDiagram(props) {
  const [expanded, setExpanded] = useState(false);
  const regionId = useId();
  const title = props.value.match(/^\s*accTitle\s*:\s*(.+)$/m)?.[1]?.trim()
    || 'Design diagram';
  return (
    <div className="diagram-frame">
      <button type="button" className="button button--secondary button--sm"
        aria-controls={regionId} aria-pressed={expanded}
        aria-label={`${expanded ? 'Fit diagram' : 'Enlarge diagram'}: ${title}`}
        onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Fit diagram' : 'Enlarge diagram'}
      </button>
      {expanded && <p className="scroll-hint">Scroll horizontally to explore the diagram.</p>}
      <div id={regionId} className={`diagram-scroll${expanded ? ' is-expanded' : ''}`}
        role="region" aria-label={title} tabIndex={0}>
        <Mermaid {...props} />
      </div>
    </div>
  );
}
