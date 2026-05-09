const sharp = require('sharp');

const sizes = [192, 512];
const source = './public/app-icon.png'; // ベースとなるアイコン画像

async function generateIcons() {
  try {
    for (const size of sizes) {
      await sharp(source)
        .resize(size, size)
        .toFile(`./public/icon-${size}x${size}.png`);
      console.log(`Generated ${size}x${size} icon`);
    }
  } catch (error) {
    console.error('Error generating icons:', error);
  }
} 