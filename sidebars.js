/**
 * The website's own pages. The FEMU Manual (sidebars-upstream.js) is the
 * canonical documentation; these pages add the getting-started routes, design
 * notes traced through the source, experiment tools, research and community.
 */

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    {
      type: 'category',
      label: 'Get started',
      collapsed: false,
      items: ['start', 'host-resources', 'start-first-experiment', 'troubleshooting'],
    },
    {
      type: 'category',
      label: 'Design notes',
      collapsed: false,
      link: {type: 'doc', id: 'implementation'},
      items: [
        'architecture',
        'policies',
        'timing-model',
        {
          type: 'category',
          label: 'Mode notes',
          link: {type: 'doc', id: 'modes'},
          items: [
            'modes/blackbox',
            'modes/zns',
            'modes/fdp',
            'modes/kv',
            'modes/csd',
            'modes/ocssd',
            'modes/nossd',
            'modes/fidelity',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Experiment tools',
      items: ['configuration-recipes', 'geometry', 'observability'],
    },
    {
      type: 'category',
      label: 'Research',
      items: ['research/cite', 'research/papers', 'research/reproducibility'],
    },
    {
      type: 'category',
      label: 'Community',
      items: ['community', 'community/first-test', 'community/developer-path', 'community/teaching', 'community/contributing', 'community/governance', 'community/licensing'],
    },
  ],
};

export default sidebars;
