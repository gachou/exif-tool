const ExifTool = require('../').ExifTool
const fs = require('fs')

fs.writeFileSync('copy.jpg', fs.readFileSync('with-xmp-identifier.jpg'))
const exiftool = new ExifTool('./copy.jpg');
// Load tags
exiftool.loadTags(['XMP:Identifier', 'EXIF:DateTimeOriginal'])
  .then((tags) => console.log('original', tags))

  // Store different tags
  .then(() => exiftool.saveTags({
    XMP: {
      Identifier: 'changed-id'
    },
    EXIF: {
      DateTimeOriginal: new Date()
    }
  }))

  // Load stored tags
  .then(() => exiftool.loadTags(['XMP:Identifier', 'EXIF:DateTimeOriginal']))
  .done((tags) => console.log('modified tags', tags));


