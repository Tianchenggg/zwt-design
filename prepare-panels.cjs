// Convert complete, independent drawings without cropping or merging their composition.
// Usage: node prepare-panels.cjs /absolute/path/to/sharp /absolute/path/to/panels
const sharp = require(process.argv[2] || 'sharp');
const { join } = require('node:path');
const source = process.argv[3];
if (!source) throw new Error('Provide the directory containing the six panel PNGs.');
const names = ['spring-plan-hd', 'spring-pavilion-hd', 'spring-concept-hd', 'rust-plan-hd', 'rust-water-left-hd', 'rust-water-right-hd'];
Promise.all(names.map(async name => {
  const result = await sharp(join(source, name + '.png')).webp({ quality: 90 }).toFile(join(__dirname, 'dist/assets', name + '.webp'));
  console.log(name, result.width, result.height, result.size);
})).catch(error => { console.error(error); process.exitCode = 1; });
