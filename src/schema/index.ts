import { XMPTags } from './xmp';
import { ExifTags } from './exif';

/**
 * Schema for the data returned and accepted by exiftool
 * http://www.sno.phy.queensu.ca/~phil/exiftool/TagNames/
 *
 */
export interface ExifToolData {
    XMP?: XMPTags;
    EXIF?: ExifTags;

}



