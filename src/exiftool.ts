/*!
 * exiftool <https://github.com/gachou/exiftool>
 *
 * Copyright (c) 2016 Nils Knappmeier.
 * Released under the MIT license.
 */

import * as cp from 'child_process'
import * as moment from 'moment'
import { ExifToolData } from './schema/index'

export { ExifToolData } from './schema/index'
import { Dates } from './utils/dates'
import exifToolPath = require('dist-exiftool')

const debug = require('debug')('exif-tool:core')

export class ExifTool {

  private file: string

  /**
   *
   * @param {string} file the filename
   */
  constructor (file: string) {
    this.file = file
  }

  /**
   * Returns a number of tags from the file, optionally filterd by a list of
   * tags provided as first argument. The result is a nested JavaScript-object
   * for example, if `['Composite:Aperture','XMP:HierarchicalSubject']` is provided
   * as `tags`, the  result is something like
   *
   * ```js
   * {
   *    XMP: { HierarchicalSubject: ['Places|Darmstadt|Prinz-Georgs-Garten'] },
   *    Composite: { Aperture: 4.7 }
   * }
   * ```
   *
   * @param [tags] a list of interesting tags (like `Composite:Aperture`)
   *   a complete list of tags can be found at. Default is `[]` for: Get all possible tags
   *   http://www.sno.phy.queensu.ca/~phil/exiftool/TagNames/index.html
   * @returns a promise resolving to an object that is structured like the output of `exiftool -g -j -struct`.
   */
  public async loadTags (tags?: string[]): Promise<ExifToolData> {
    // -g: Print each tag with group-name (like `{ XMP: { HierarchicalSubject: "abc" } }`)
    // -json: Print as JSON
    // -struct: Print arrays as array (even if they only have one element)
    const output = await this.run(['-g', '-json', '-struct'].concat((tags || []).map((tag) => `-${tag}`)))

    const exifData = JSON.parse(output.stdout, function reviver (key: string, value: any) {
      if (typeof value === 'string') {
        // TODO: Apply timezone offset
        return Dates.toDate(value)
      }
      return value
    })

    return exifData[0]
  }

  public saveTags (tagObject: ExifToolData): Promise<any> {
    let stdinObj: any = {
      SourceFile: this.file
    }
    // Exiftool only accepts the JSON form
    // { "EXIF:DateTimeOriginal": ... }
    // but the ExifToolData is of the form
    // { "EXIF": { "DateTimeOriginal": ... } }
    // convert here...
    let input: any = tagObject
    Object.keys(tagObject).forEach((groupName) => {
      let groupObj = input[groupName]
      Object.keys(groupObj).forEach((tagName) => {
        stdinObj[`${groupName}:${tagName}`] = groupObj[tagName]
      })
    })

    // Replace dates with the exiftool string for dates
    // "value" is the result of "toJson()" (in case of Dates)
    // which is useless, because it is a string
    // but "this" is the current object and "this[key]" is the current
    // property value in raw.
    const stdin = JSON.stringify(stdinObj, function (key, value) {
      if (moment.isMoment(this[key])) {
        return Dates.toString(this[key])
      } else {
        return value
      }
    })
    debug('run stdin', stdin)
    // Run exiftool so that it accepts a json input as stdin
    // Use a custom dateformat
    return this.run(['-g', '-j=-', '-overwrite_original'], stdin)
  }

  /**
   * Low level helper to run the exiftool
   * @param {string[]} args CLI arguments
   * @param {string=} input optional input to pass to stdin of the child process
   * @private
   * @returns {Promise<{stdout,stderr}>} a promise for the output. The child-process is available
   *  through the `.child`-property
   */
  private run (args: string[], input?: string): Promise<ProcessOutput> {
    debug('run', args)
    return new Promise<ProcessOutput>((resolve, reject) => {
      const cmdArgs = args.concat([this.file])
      const child = cp.execFile(exifToolPath, cmdArgs, { encoding: 'utf8' }, (err, stdout, stderr) => {
        if (err) {
          reject(err)
        }
        resolve({ stdout, stderr })
      })
      if (input) {
        child.stdin.end(input)
      }
    })
  }

}

export interface ProcessOutput {
  stdout: string
  stderr: string
}
