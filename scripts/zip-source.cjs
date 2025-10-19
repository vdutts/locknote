const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const OUTPUT_PATH = path.join(process.cwd(), 'locknote-source.zip');
const SOURCE_DIR = process.cwd();

// Files and directories to exclude
const EXCLUDE_PATTERNS = [
  'node_modules',
  'dist',
  '.git',
  '.cache',
  'locknote-source.zip',
  '*.zip',
  '.DS_Store',
  'Thumbs.db'
];

function shouldExclude(filePath) {
  const relativePath = path.relative(SOURCE_DIR, filePath);
  return EXCLUDE_PATTERNS.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(relativePath);
    }
    return relativePath.startsWith(pattern) || relativePath === pattern;
  });
}

async function createZip() {
  return new Promise((resolve, reject) => {
    // Create output stream
    const output = fs.createWriteStream(OUTPUT_PATH);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    output.on('close', () => {
      const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      console.log(`✅ Source code packaged successfully!`);
      console.log(`📦 File: locknote-source.zip`);
      console.log(`📊 Size: ${sizeInMB} MB (${archive.pointer()} bytes)`);
      console.log(`📍 Location: ${OUTPUT_PATH}`);
      resolve();
    });

    archive.on('error', (err) => {
      console.error('❌ Error creating zip:', err);
      reject(err);
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('⚠️ Warning:', err);
      } else {
        reject(err);
      }
    });

    // Pipe archive data to the file
    archive.pipe(output);

    // Add all files and directories
    console.log('📦 Packaging source code...');
    
    archive.glob('**/*', {
      cwd: SOURCE_DIR,
      ignore: EXCLUDE_PATTERNS,
      dot: true // Include hidden files like .gitignore
    });

    // Finalize the archive
    archive.finalize();
  });
}

// Run the script
createZip().catch((err) => {
  console.error('Failed to create zip:', err);
  process.exit(1);
});
