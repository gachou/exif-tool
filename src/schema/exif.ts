import * as moment from 'moment'

// Disable variable-name check, since ExifTool provides all properties as uppercase
/* tslint:disable:variable-name */

/**
 * Exif-Schema: see http://www.sno.phy.queensu.ca/~phil/exiftool/TagNames/EXIF.html
 */
export interface ExifTags {

  CreateDate?: moment.Moment
  DateTimeOriginal?: moment.Moment
  TimeZoneOffset?: number | number[]
}
