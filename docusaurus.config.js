// @ts-check
// Site configuration. See https://docusaurus.io/docs/api/docusaurus-config
//
// The URL is kept in one place near the top, so a custom domain later is a
// one-line change.

import {themes as prismThemes} from 'prism-react-renderer';

// Keep syntax colors legible against the GitHub theme's light background.
const codeColors = {
  '#999988': '#68685b',
  '#e3116c': '#c80b5e',
  '#36acaa': '#087570',
  '#00a4db': '#006d91',
  '#d73a49': '#c42f40',
};
const readableLightCodeTheme = {
  ...prismThemes.github,
  styles: prismThemes.github.styles.map(rule => ({
    ...rule,
    style: {...rule.style, color: codeColors[rule.style.color] || rule.style.color},
  })),
};

// The site source is not yet in a public repository. Keep corrections open
// through the public FEMU issue tracker until a public edit target exists.
function correctionUrl(permalink) {
  const query = new URLSearchParams({
    title: `Documentation correction: ${permalink}`,
    body: `Page: ${permalink}\n\nWhat needs correction?\n\nSuggested change:\n\nSource or reproduction steps:\n`,
  });
  return `https://github.com/MoatLab/FEMU/issues/new?${query}`;
}

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'FEMU',
  tagline: 'NVMe SSD emulation for storage systems research',
  favicon: 'img/femu-mark.svg',

  future: {v4: true},

  // Served at https://femu-ose.github.io/. A custom domain later only changes
  // FEMU_SITE_URL; the site is served from the root either way.
  url: process.env.FEMU_SITE_URL || 'https://femu-ose.github.io',
  baseUrl: process.env.FEMU_BASE_URL || '/',
  // GitHub Pages serves dir/index.html; trailing slashes avoid a redirect.
  trailingSlash: true,

  organizationName: 'femu-ose',
  projectName: 'femu-ose.github.io',

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',

  i18n: {defaultLocale: 'en', locales: ['en']},

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  themes: [
    '@docusaurus/theme-mermaid',
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: 'filename',
        language: 'en',
        indexDocs: true,
        indexBlog: false,
        indexPages: false,
        docsRouteBasePath: ['/docs', '/manual'],
        docsPluginIdForPreferredVersion: 'default',
        explicitSearchResultPath: true,
        searchResultLimits: 8,
      },
    ],
  ],

  // Cookieless page-view counts (GoatCounter); see the module for details.
  clientModules: ['./src/page-views.js'],

  plugins: [
    // The FEMU Manual: hw/femu/docs mirrored at a pinned commit by
    // tools/sync-upstream-docs.py. Pages carry their own edit URL upstream.
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'upstream',
        path: 'docs-upstream',
        routeBasePath: 'manual',
        sidebarPath: './sidebars-upstream.js',
        // Keep upstream file names in URLs (tutorials/02-gc-and-waf); the
        // sync tool writes the sidebar from the manual's chapters.txt, so
        // the prefix is not needed for ordering.
        numberPrefixParser: false,
      },
    ],
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: ({permalink}) => correctionUrl(permalink),
          showLastUpdateTime: true,
        },
        blog: {
          showReadingTime: true,
          blogTitle: 'News',
          blogDescription: 'Releases, features and community notes',
          editUrl: ({permalink}) => correctionUrl(permalink),
          onInlineTags: 'throw',
          onInlineAuthors: 'throw',
          // Few posts so far: the index itself is the list, so no sidebar.
          blogSidebarCount: 0,
          feedOptions: {type: ['rss', 'atom'], xslt: true},
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/femu-social-card.png',
      mermaid: {
        theme: {light: 'neutral', dark: 'dark'},
        options: {
          flowchart: {nodeSpacing: 25, rankSpacing: 28},
        },
      },
      colorMode: {
        defaultMode: 'light',
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'FEMU',
        logo: {alt: '', src: 'img/femu-mark.svg'},
        items: [
          {to: '/docs/start', label: 'Get started', position: 'left'},
          {
            type: 'docSidebar',
            sidebarId: 'manual',
            docsPluginId: 'upstream',
            label: 'Manual',
            position: 'left',
          },
          {to: '/docs/research/cite', label: 'Research', position: 'left'},
          {to: '/docs/community', label: 'Community', position: 'left'},
          {to: '/blog', label: 'News', position: 'left'},
          {
            href: 'https://github.com/MoatLab/FEMU',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'light',
        // The NSF full-color logo, required on award recipients' websites
        // (NSF Policy on Brand Standards). It sits beside the award text only,
        // never in a partner strip, so it acknowledges support without
        // implying endorsement. File: nsf.gov/policies/brand, official logo.
        logo: {
          alt: 'U.S. National Science Foundation',
          src: 'img/nsf/nsf-logo.png',
          href: 'https://www.nsf.gov/awardsearch/show-award/?AWD_ID=2550145',
          width: 48,
        },
        // One line of links (a "simple" footer), not columns.
        links: [
          {label: 'Get started', to: '/docs/start'},
          {label: 'Manual', to: '/manual'},
          {label: 'Cite FEMU', to: '/docs/research/cite'},
          {label: 'Community', to: '/docs/community'},
          {label: 'Mailing list', href: 'https://groups.google.com/g/femu'},
          {label: 'Governance', to: '/docs/community/governance'},
          {label: 'Licensing', to: '/docs/community/licensing'},
          {label: 'News', to: '/blog'},
          {label: 'RSS', href: 'pathname:///blog/rss.xml'},
          {label: 'GitHub', href: 'https://github.com/MoatLab/FEMU'},
        ],
        // NSF requires this acknowledgement and disclaimer on project web
        // pages (PAPPG 24-1, Chapter XI.E.4.a and b). Keep it in the footer so
        // it is on every page, not on one About page.
        copyright:
          'This material is based upon work supported by the U.S. National Science ' +
          'Foundation under Award No. <a href="https://www.nsf.gov/awardsearch/show-award/?AWD_ID=2550145">2550145</a>. ' +
          'Any opinions, findings and conclusions or recommendations expressed ' +
          'in this material are those of the author(s) and do not necessarily ' +
          'reflect the views of the National Science Foundation.<br/>' +
          `FEMU is open source under the GNU GPL v2.0 or later; this site's own pages are CC BY 4.0. ` +
          'Page views are counted with <a href="https://www.goatcounter.com">GoatCounter</a>, without cookies. ' +
          `© ${new Date().getFullYear()} MoatLab.`,
      },
      prism: {
        theme: readableLightCodeTheme,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['c', 'bash', 'ini', 'json', 'diff'],
      },
    }),
};

export default config;
