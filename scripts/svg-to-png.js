const sharp = require('sharp');

async function convertSvgToPng() {
  try {
    await sharp('./public/app-icon.svg')
      .png()
      .toFile('./public/app-icon.png');
    console.log('Successfully converted SVG to PNG');
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
  }
}

convertSvgToPng(); 