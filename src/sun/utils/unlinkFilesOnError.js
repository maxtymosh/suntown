const fs = require('fs')

const unlinkFiles = files => {
  files.forEach(paths => {
    paths.forEach(path => {
      if(!fs.existsSync(path)){
        return
      }
      fs.unlinkSync(path)
    })
  });
}

module.exports = unlinkFiles;