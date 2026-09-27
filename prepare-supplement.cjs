// Encode the twelve complete supplementary figures, without cropping or compositing.
const sharp=require(process.argv[2]||'sharp');
const {join}=require('node:path');
const source=process.argv[3];
if(!source)throw new Error('Provide supplementary PNG directory.');
const names=['spring-planting-hd','spring-node-hd','spring-section-mid-hd','spring-section-bottom-hd','spring-zoning-hd','spring-circulation-hd','rust-section-bb-hd','rust-section-aa-hd','rust-concept-group-hd','rust-circulation-analysis-hd','rust-function-analysis-hd','rust-node-analysis-hd'];
Promise.all(names.map(async name=>{
  const result=await sharp(join(source,name+'.png')).webp({quality:91}).toFile(join(__dirname,'dist/assets',name+'.webp'));
  console.log(JSON.stringify({name,width:result.width,height:result.height,bytes:result.size}));
})).catch(error=>{console.error(error);process.exitCode=1;});
