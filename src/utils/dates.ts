import * as moment from 'moment'

/**
 * Manage conversion of exif-datestrings to Date and back
 */
export namespace Dates {
  /**
   * Date format to pass to exiftool
   */
  const momentFormats = ['YYYY:MM:DD HH:mm:ssZZ', 'YYYY:MM:DD HH:mm:ss']

  /**
   * Return the date represented by the string, or undefined if it is no date.
   * @param dateString
   */
  export function toDate (dateString: string): moment.Moment | string {
    const result = moment(dateString, momentFormats, true)
    if (result.isValid()) {
      return result
    } else {
      return dateString
    }
  }

  /**
   * Format a moment-object with the same format string as it was parsed.
   * @param aMoment
   * @returns {string}
   */
  export function toString (aMoment: moment.Moment): string {
    const format = aMoment.creationData().format
    return aMoment.format(format as string)
  }
}
