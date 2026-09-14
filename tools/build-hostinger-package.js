/**
 * Hostinger Production Deployment Packager
 * Universal QR & Barcode Generator Suite
 * 
 * Automatically compiles and packages all production runtime assets into
 * dist/hostinger_deploy.zip, strictly excluding internal research, prompts,
 * and planning documents.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');
const OUTPUT_ZIP = path.join(DIST_DIR, 'hostinger_deploy.zip');

// Load in-repo JSZip without needing node_modules
const jszipCode = fs.readFileSync(path.join(PROJECT_ROOT, 'js/vendor/jszip.min.js'), 'utf8');
const sandbox = { 
  module: {}, 
  exports: {}, 
  setTimeout, 
  clearTimeout, 
  setImmediate: typeof setImmediate !== 'undefined' ? setImmediate : setTimeout, 
  clearImmediate: typeof clearImmediate !== 'undefined' ? clearImmediate : clearTimeout,
  Buffer 
};
vm.createContext(sandbox);
vm.runInContext(jszipCode, sandbox);
const JSZip = sandbox.module.exports || sandbox.JSZip || sandbox.exports;

// Whitelisted top-level production files
const ROOT_WHITELIST = [
  'index.html',
  '404.html',
  '.htaccess',
  'robots.txt',
  'sitemap.xml',
  'llms.txt',
  'llms-full.txt',
  'site.webmanifest',
  'README.md'
];

// Production subdirectories to include
const DIRS_WHITELIST = [
  'css',
  'js',
  'assets',
  'pages'
];

function getAllFiles(dir, baseDir = '') {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.join(baseDir, entry.name).replace(/\\/g, '/');

    // Ignore hidden or scratch files
    if (entry.name.startsWith('.') && entry.name !== '.htaccess') continue;
    if (entry.name.endsWith('.md') && entry.name !== 'README.md') continue;

    if (entry.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, relPath));
    } else {
      results.push({ fullPath, relPath });
    }
  }

  return results;
}

async function buildPackage() {
  console.log('================================================================');
  console.log('🚀 Building Hostinger Production Release Package');
  console.log('================================================================\n');

  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  const zip = new JSZip();
  let totalFiles = 0;
  let totalBytes = 0;

  // 1. Add Whitelisted Root Files
  console.log('📦 Packaging root production files:');
  for (const file of ROOT_WHITELIST) {
    const filePath = path.join(PROJECT_ROOT, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath);
      zip.file(file, content);
      totalFiles++;
      totalBytes += content.length;
      console.log(`  + ${file} (${(content.length / 1024).toFixed(1)} KB)`);
    } else {
      console.warn(`  ⚠️ WARNING: Expected file ${file} was not found!`);
    }
  }

  // 2. Add Whitelisted Directories
  for (const dirName of DIRS_WHITELIST) {
    const dirPath = path.join(PROJECT_ROOT, dirName);
    if (!fs.existsSync(dirPath)) continue;

    console.log(`\n📁 Packaging /${dirName}:`);
    const files = getAllFiles(dirPath, dirName);
    for (const f of files) {
      const content = fs.readFileSync(f.fullPath);
      zip.file(f.relPath, content);
      totalFiles++;
      totalBytes += content.length;
      console.log(`  + ${f.relPath} (${(content.length / 1024).toFixed(1)} KB)`);
    }
  }

  // 3. Generate ZIP Archive
  console.log('\n⏳ Compressing archive with DEFLATE level 9...');
  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  fs.writeFileSync(OUTPUT_ZIP, zipBuffer);
  const zipSizeMb = (zipBuffer.length / (1024 * 1024)).toFixed(2);
  const rawSizeMb = (totalBytes / (1024 * 1024)).toFixed(2);

  console.log('\n================================================================');
  console.log('✅ Hostinger Deployment Package Created Successfully!');
  console.log('================================================================');
  console.log(`📁 Target File:   ${OUTPUT_ZIP}`);
  console.log(`📊 File Count:    ${totalFiles} files`);
  console.log(`📦 Uncompressed:  ${rawSizeMb} MB`);
  console.log(`🗜️  ZIP Size:      ${zipSizeMb} MB (${zipBuffer.length} bytes)`);
  console.log('\n👉 HOSTINGER UPLOAD INSTRUCTIONS:');
  console.log('1. Log into your Hostinger hPanel dashboard.');
  console.log('2. Navigate to "Websites" -> [Your Domain] -> "File Manager".');
  console.log('3. Open the "public_html" directory.');
  console.log('4. Click the "Upload" icon and upload "dist/hostinger_deploy.zip".');
  console.log('5. Right-click "hostinger_deploy.zip" and select "Extract".');
  console.log('6. Choose the root "public_html/" folder and confirm.');
  console.log('7. Delete "hostinger_deploy.zip" after extraction.');
  console.log('8. Your website is immediately live with HTTPS and LiteSpeed caching!\n');
}

buildPackage().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
