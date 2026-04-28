const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function collectJsFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.git')) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectJsFiles(fullPath, files);
    } else if (entry.isFile() && fullPath.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

const roots = ['src', 'tests', 'scripts'];
const files = roots.flatMap((root) => (fs.existsSync(root) ? collectJsFiles(root) : []));

let hasError = false;
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  if (result.status !== 0) {
    hasError = true;
    process.stderr.write(result.stderr.toString());
  }
}

if (hasError) {
  console.error('Lint failed: syntax check errors found.');
  process.exit(1);
}

console.log(`Lint passed for ${files.length} JavaScript files.`);

