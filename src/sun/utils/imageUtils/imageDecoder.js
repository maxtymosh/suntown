const crypto = require('crypto');
const fs = require('fs');
const isBase64 = require('is-base64');

module.exports = (path, base64, src = crypto.randomBytes(10).toString('hex')) => {
  const rawImage = JSON.parse(base64);
  console.log(rawImage.src.length)
    if(!rawImage.src.includes('suntown')){
      console.log('call match')
      const imageObject = JSON.parse(base64);
      const rawBinaryJson = imageObject;
      const rawBinary = rawBinaryJson.src.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(rawBinary, 'base64')
      fs.writeFile(path+'/'+src, buffer, (err, result) => {
        if(err) throw new Error(err);
      })
	const serverPath = path.slice(11);
      return {...imageObject, src: `https://suntown-ukraine.com/${serverPath}/${src}`}
    } else {
      return rawImage
    }
  
}
