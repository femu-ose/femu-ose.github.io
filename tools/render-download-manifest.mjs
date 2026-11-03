// Describe only the public research downloads. Keep output deterministic so a
// saved manifest identifies artifact bytes independently of the build time.
import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
import {readFile, readdir, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
// The commit the downloads were last checked against (check-recipes.py).
const pin = JSON.parse(await readFile(path.join(root, 'content/recipes-pin.json'), 'utf8'));
const groups = {
  configs: 'configuration',
  patches: 'implementation patch',
  tutorials: 'tutorial patch',
  tools: 'analysis tool',
};
const artifacts = [];
for (const [directory, kind] of Object.entries(groups)) {
  const folder = path.join(root, 'static', directory);
  // A group may be empty (git does not track empty folders).
  if (!existsSync(folder)) continue;
  async function visit(folder, relative) {
    const entries = await readdir(folder, {withFileTypes: true});
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
      const child = path.join(folder, entry.name);
      const artifactPath = `${relative}/${entry.name}`;
      if (entry.isDirectory()) {
        await visit(child, artifactPath);
        continue;
      }
      if (!entry.isFile()) throw new Error(`Unexpected non-file download: ${artifactPath}`);
      const data = await readFile(child);
      artifacts.push({path: artifactPath, kind, bytes: data.length,
        sha256: createHash('sha256').update(data).digest('hex')});
    }
  }
  await visit(folder, directory);
}
const manifest = {
  format_version: 1,
  implementation_reference: pin.commit,
  path_base: 'Paths are relative to the website base URL.',
  artifacts,
};
await writeFile(path.join(root, 'static/downloads.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote downloads.json for ${artifacts.length} public research artifacts.`);
