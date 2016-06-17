import { ExifTool, ExifToolData  } from '../index';
import * as moment from 'moment';
import * as fs from 'fs';

fs.writeFileSync('copy.jpg', fs.readFileSync('with-xmp-identifier.jpg'));
const exiftool = new ExifTool('./copy.jpg');
// Load tags
exiftool.loadTags(['XMP:Identifier', 'EXIF:DateTimeOriginal'])
    .then((tags: ExifToolData) => console.log('original', tags))

    // Store different tags
    .then(() => exiftool.saveTags({
        XMP: {
            Identifier: 'changed-id'
        },
        EXIF: {
            DateTimeOriginal: moment()
        }
    }))

    // Load stored tags
    .then(() => exiftool.loadTags(['XMP:Identifier', 'EXIF:DateTimeOriginal']))
    .done((tags: ExifToolData) => console.log('modified tags', tags));


