#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function checkEncoding(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);

    // UTF-8 BOM check
    if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
      console.warn(`⚠️  BOM detected in ${filePath}`);
      return false;
    }

    // Try to decode as UTF-8
    const content = buffer.toString('utf8');

    // Check for replacement characters (indicates encoding issues)
    if (content.includes('\uFFFD')) {
      console.error(`❌ Invalid UTF-8 characters in ${filePath}`);
      return false;
    }

    // Re-encode and compare
    const reencoded = Buffer.from(content, 'utf8');
    if (!buffer.equals(reencoded)) {
      console.error(`❌ Encoding mismatch in ${filePath}`);
      return false;
    }

    console.log(`✅ ${filePath} is valid UTF-8`);
    return true;
  } catch (error) {
    console.error(`❌ Error checking ${filePath}: ${error.message}`);
    return false;
  }
}

function checkDirectory(dir, extensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.md']) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let allValid = true;

  for (const file of files) {
    const filePath = path.join(dir, file.name);

    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      if (!checkDirectory(filePath, extensions)) {
        allValid = false;
      }
    } else if (file.isFile() && extensions.some(ext => file.name.endsWith(ext))) {
      if (!checkEncoding(filePath)) {
        allValid = false;
      }
    }
  }

  return allValid;
}

// Run the check
const srcDir = path.join(__dirname, '..', 'src');
console.log('🔍 Checking file encodings...\n');

if (checkDirectory(srcDir)) {
  console.log('\n✅ All files have valid UTF-8 encoding');
  process.exit(0);
} else {
  console.log('\n❌ Some files have encoding issues');
  process.exit(1);
}
