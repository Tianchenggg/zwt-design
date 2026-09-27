// Derive detail views from the high-resolution exhibition illustrations.
// Usage: node prepare-details.cjs /absolute/path/to/sharp
const sharp = require(process.argv[2] || 'sharp');
const { join } = require('node:path');
const base = join(__dirname, 'dist/assets');
const crops = [
  ['spring-redrawn.webp', 'spring-canopy-detail.webp', { left: 210, top: 28, width: 1260, height: 560 }],
  ['spring-redrawn.webp', 'spring-water-detail.webp', { left: 0, top: 556, width: 970, height: 468 }],
  ['spring-redrawn.webp', 'spring-planting-detail.webp', { left: 20, top: 125, width: 520, height: 500 }],
  ['rust-redrawn.webp', 'rust-frame-detail.webp', { left: 472, top: 170, width: 976, height: 685 }],
  ['rust-redrawn.webp', 'rust-water-detail.webp', { left: 0, top: 547, width: 810, height: 539 }],
  ['rust-redrawn.webp', 'rust-planting-detail.webp', { left: 0, top: 0, width: 1240, height: 400 }],
];
Promise.all(crops.map(async ([source, destination, region]) => {
  const result = await sharp(join(base, source)).extract(region).webp({ quality: 91 }).toFile(join(base, destination));
  console.log(destination, result.width, result.height, result.size);
})).catch(error => { console.error(error); process.exitCode = 1; });
