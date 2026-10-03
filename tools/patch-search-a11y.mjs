// Small, version-checked accessibility patch for the pinned search theme.
// Remove when upstream supplies the label and equivalent keyboard behavior.
import {readFileSync, writeFileSync, rmSync} from 'node:fs';

const root = new URL('../node_modules/@easyops-cn/docusaurus-search-local/', import.meta.url);
const {version} = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
if (version !== '0.55.3') {
  throw new Error(`Review the search accessibility patch for version ${version}`);
}
const file = new URL('dist/client/client/theme/SearchBar/SearchBar.jsx', root);
const original = readFileSync(file, 'utf8');
let source = original;
const edits = [
  ['autoselect: true,', 'autoselect: true,\n            tabAutocomplete: false,'],
  ['.on("autocomplete:closed", () => {\n            searchBarRef.current?.blur();\n        });',
    '.on("autocomplete:closed", () => {\n            // Preserve keyboard focus when dismissing suggestions.\n        });'],
  ['<button className={styles.searchClearButton} onClick={onClearSearch}>',
    '<button type="button" aria-label="Clear search" title="Clear search" className={styles.searchClearButton} onClick={onClearSearch}>'],
  ['search.current?.autocomplete.setVal("");\n    }, [location.pathname',
    'search.current?.autocomplete.setVal("");\n        searchBarRef.current?.focus();\n    }, [location.pathname'],
  ['.on("autocomplete:closed", () => {',
    `.on("autocomplete:cursorchanged", () => {
            // Correct the library's scroll calculation after it moves the cursor.
            requestAnimationFrame(() => {
                const id = searchBarRef.current?.getAttribute("aria-activedescendant");
                const active = id && document.getElementById(id);
                const menu = active?.closest('[class*="dropdownMenu"]');
                if (!menu?.clientHeight) return;
                const itemBox = active.getBoundingClientRect();
                const menuBox = menu.getBoundingClientRect();
                if (itemBox.bottom > menuBox.bottom) {
                    menu.scrollTop += itemBox.bottom - menuBox.bottom;
                } else if (itemBox.top < menuBox.top) {
                    menu.scrollTop -= menuBox.top - itemBox.top;
                }
            });
        })
        .on("autocomplete:closed", () => {`],
];
for (const [before, after] of edits) {
  if (source.split(after).length === 2) continue;
  if (source.split(before).length !== 2) {
    throw new Error('Search clear-button source changed; review before patching.');
  }
  source = source.replace(before, after);
}
const pageFile = new URL('dist/client/client/theme/SearchPage/SearchPage.jsx', root);
const pageOriginal = readFileSync(pageFile, 'utf8');
let pageSource = pageOriginal;
for (const [before, after] of [
  ['<div className="container margin-vert--lg">', '<main className="container margin-vert--lg">'],
  ['</section>\n      </div>', '</section>\n      </main>'],
]) {
  if (pageSource.split(after).length === 2) continue;
  if (pageSource.split(before).length !== 2) {
    throw new Error('Search page source changed; review the main landmark patch.');
  }
  pageSource = pageSource.replace(before, after);
}
if (source !== original || pageSource !== pageOriginal) {
  writeFileSync(file, source);
  writeFileSync(pageFile, pageSource);
  // Bundlers treat installed packages as immutable, so invalidate their caches.
  for (const bundler of ['rspack', 'webpack']) {
    rmSync(new URL(`../node_modules/.cache/${bundler}`, import.meta.url), {recursive: true, force: true});
  }
}
console.log('Search accessibility patch verified.');
