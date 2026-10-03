import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

/*
 * A figure set like one in a paper: the image on a white page between thin
 * rules, and a plain caption. Clicking the image opens the full-size SVG.
 */
export default function DesignFigure({src, alt, caption}) {
  const url = useBaseUrl(src);
  return (
    <figure className={styles.figure}>
      <a href={url} target="_blank" rel="noopener" title="Open the full-size figure">
        <img className={styles.image} src={url} alt={alt} loading="lazy" />
      </a>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
