import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.join(__dirname, 'projects');
const DEST_DIR = path.join(__dirname, 'public', 'projects');
const STRUCTURE_FILE = path.join(__dirname, 'public', 'projects-structure.json');

// Folders and files to ignore
const IGNORE_PATTERNS = [
  'node_modules',
  'dist',
  'build',
  '.git',
  '.next',
  'coverage',
  '.env',
  '.env.local',
  '.DS_Store',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  '*.log',
  '.tsbuildinfo'
];

// Language mapping
const LANGUAGE_MAP = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.go': 'go',
  '.py': 'python',
  '.html': 'html',
  '.css': 'css',
  '.json': 'json',
  '.md': 'markdown',
  '.sql': 'sql',
  '.txt': 'text'
};

function shouldIgnore(filePath) {
  const parts = filePath.split(path.sep);
  return parts.some(part => 
    IGNORE_PATTERNS.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return regex.test(part);
      }
      return part === pattern || part.startsWith('.');
    })
  );
}

function getLanguage(filename) {
  const ext = path.extname(filename).toLowerCase();
  return LANGUAGE_MAP[ext] || 'text';
}

function buildStructure(src, basePath = '') {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  const nodes = [];

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const relativePath = basePath ? path.join(basePath, entry.name) : entry.name;

    if (shouldIgnore(srcPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      const children = buildStructure(srcPath, relativePath);
      if (children.length > 0) {
        nodes.push({
          name: entry.name,
          path: relativePath.replace(/\\/g, '/'),
          type: 'folder',
          children
        });
      }
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.go', '.py', '.html', '.css', '.json', '.md', '.sql', '.txt'];
      
      if (codeExtensions.includes(ext) || entry.name === 'README') {
        nodes.push({
          name: entry.name,
          path: relativePath.replace(/\\/g, '/'),
          type: 'file',
          language: getLanguage(entry.name)
        });
      }
    }
  }

  return nodes;
}

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (shouldIgnore(srcPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.go', '.py', '.html', '.css', '.json', '.md', '.sql', '.txt'];
      
      if (codeExtensions.includes(ext) || entry.name === 'README') {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

// Clean destination directory first
if (fs.existsSync(DEST_DIR)) {
  fs.rmSync(DEST_DIR, { recursive: true, force: true });
}

// Build structure and copy files
const projects = fs.readdirSync(SOURCE_DIR).filter(item => {
  const itemPath = path.join(SOURCE_DIR, item);
  return fs.statSync(itemPath).isDirectory() && !item.startsWith('.');
});

const structure = {};

for (const project of projects) {
  const srcPath = path.join(SOURCE_DIR, project);
  const destPath = path.join(DEST_DIR, project);
  
  console.log(`Processing ${project}...`);
  
  // Build folder structure
  structure[project] = {
    name: project,
    path: project,
    type: 'folder',
    children: buildStructure(srcPath)
  };
  
  // Copy files
  copyDirectory(srcPath, destPath);
}

// Write structure JSON
fs.writeFileSync(STRUCTURE_FILE, JSON.stringify(structure, null, 2));

console.log('Projects copied and structure generated successfully!');