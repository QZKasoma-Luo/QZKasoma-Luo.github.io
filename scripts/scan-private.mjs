import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const roots = ['src', 'public', 'dist'];
const patterns = [
  { name: 'email address', re: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi },
  { name: 'North American phone number', re: /(?:\+1[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}|\b\d{3}[-.]\d{3}[-.]\d{4}\b)/g },
  { name: 'private key', re: /BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY/g },
  { name: 'long numeric identifier', re: /\b\d{9,}\b/g },
];

const files = [];
const pdfFiles = [];
async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      await walk(path);
    } else if (/\.pdf$/i.test(entry.name)) {
      // PDF streams are binary; scanning them as UTF-8 produces object-offset
      // false positives. Their extracted text is checked separately.
      pdfFiles.push(path);
    } else if (/\.(?:html|css|js|mjs|ts|astro|md|mdx|ya?ml|json|txt|xml|svg)$/i.test(entry.name)) {
      files.push(path);
    }
  }
}

for (const root of roots) await walk(root);

let findings = 0;
for (const file of files) {
  const text = await readFile(file, 'utf8').catch(() => '');
  for (const { name, re } of patterns) {
    re.lastIndex = 0;
    for (const match of text.matchAll(re)) {
      const sample = match[0].replace(/\s+/g, ' ');
      console.log(`${name}: ${file} — ${sample}`);
      findings++;
    }
  }
}
console.log(`\nScanned ${files.length} text files. PDFs skipped by the binary scanner: ${pdfFiles.length}.`);
console.log(`Potential private-data findings: ${findings}.`);
process.exitCode = findings ? 1 : 0;
