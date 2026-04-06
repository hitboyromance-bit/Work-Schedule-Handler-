const fs = require('fs');
const path = require('path');

function collectFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.git')) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, files);
    } else if (entry.isFile() && fullPath.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

const roots = ['src', 'tests', 'scripts'];
const files = roots.flatMap((root) => (fs.existsSync(root) ? collectFiles(root) : []));

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const normalized = content
    .split('\n')
    .map((line) => line.replace(/\s+$/g, ''))
    .join('\n')
    .replace(/\n*$/g, '\n');

  fs.writeFileSync(file, normalized);
}

console.log(`Format complete for ${files.length} JavaScript files (trim trailing whitespace).`);

