// Keep the image self-contained so a saved invoice can be exported offline.
export async function prepareLogo(file) {
  if (!file.size || file.size > 5 * 1024 * 1024) throw new Error('Kies een afbeelding van maximaal 5 MB.');
  const bytes = new Uint8Array(await file.slice(0,8).arrayBuffer());
  const png = [137,80,78,71,13,10,26,10].every((value,index)=>bytes[index]===value);
  const jpeg = bytes[0]===255 && bytes[1]===216 && bytes[2]===255;
  if (!png && !jpeg) throw new Error('Kies een PNG- of JPG-bestand.');
  let bitmap;
  try { bitmap=await createImageBitmap(file); }
  catch { throw new Error('Deze afbeelding kan niet worden geopend. Kies een ander bestand.'); }
  try {
    const canvas=document.createElement('canvas');
    let scale=Math.min(1,384/bitmap.width,192/bitmap.height);
    while (true) {
      canvas.width=Math.max(1,Math.round(bitmap.width*scale));
      canvas.height=Math.max(1,Math.round(bitmap.height*scale));
      const ctx=canvas.getContext('2d');
      ctx.imageSmoothingQuality='high';
      ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
      const logo=canvas.toDataURL('image/png');
      if (logo.length<=48000 && logo.startsWith('data:image/png;base64,')) return logo;
      if (canvas.width<=1 && canvas.height<=1) throw new Error('Kies een andere afbeelding.');
      scale*=0.75;
    }
  } finally { bitmap.close(); }
}
