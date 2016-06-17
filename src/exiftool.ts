/*!
 * gachou-core <https://github.com/gachou/gachou-core>
 *
 * Copyright (c) 2016 Nils Knappmeier.
 * Released under the MIT license.
 */

import * as Q from 'q';
import * as cp from 'child_process';
import * as moment from 'moment';
import { ExifToolData } from './schema/index';
export { ExifToolData } from './schema/index';
import { Dates} from './utils/dates';

const debug = require('debug')('exif-tool:core');

export class ExifTool {

    private file: string;

    /**
     *
     * @param {string} file the filename
     */
    constructor(file: string) {
        this.file = file;
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
    public loadTags(tags?: string[]): Q.Promise<ExifToolData> {
        // -g: Print each tag with group-name (like `{ XMP: { HierarchicalSubject: "abc" } }`)
        // -json: Print as JSON
        // -struct: Print arrays as array (even if they only have one element)
        return this.run(['-g', '-json', '-struct']
            .concat((tags || []).map((tag) => `-${tag}`))
            .concat([this.file]))
            .then((output) => {
                    return JSON.parse(output.stdout, function reviver(key: string, value: any) {
                        if (typeof value === 'string') {
                            // TODO: Apply timezone offset
                            return Dates.toDate(<string>value);
                        }
                        return value;
                    })[0];
                }
            );
    }

    public saveTags(tagObject: ExifToolData): Q.Promise<any> {
        let stdinObj: any = {
            SourceFile: this.file,
        };
        // Exiftool only accepts the JSON form 
        // { "EXIF:DateTimeOriginal": ... } 
        // but the ExifToolData is of the form
        // { "EXIF": { "DateTimeOriginal": ... } } 
        // convert here...
        let input: any = tagObject;
        Object.keys(tagObject).forEach((groupName) => {
            let groupObj = input[groupName];
            Object.keys(groupObj).forEach((tagName) => {
                stdinObj[`${groupName}:${tagName}`] = groupObj[tagName];
            });
        });

        // Run exiftool so that it accepts a json input as stdin
        // Use a custom dateformat
        const result = this.run(['-g', '-j=-', '-overwrite_original']);
        const stdin = JSON.stringify(stdinObj, function replacer(key: string, value: any): any {
            // Replace dates with the exiftool string for dates
            // "value" is the result of "toJson()" (in case of Dates)
            // which is useless, because it is a string
            // but "this" is the current object and "this[key]" is the current 
            // property value in raw.
            if (moment.isMoment(this[key])) {
                return Dates.toString(this[key]);
            }
            return value;
        });
        debug('run stdin', stdin);
        result.child.stdin.end(stdin);
        return result;
    }

    /**
     * Low level helper to run the exiftool
     * @param {string[]} args CLI arguments
     * @private
     * @returns {Promise<{stdout,stderr}>} a promise for the output. The child-process is available
     *  through the `.child`-property
     */
    private run(args: string[]): Q.Promise <ProcessOutput> & WithChildProcess {
        debug('run', args);
        const deferred: Q.Deferred<ProcessOutput> = Q.defer<ProcessOutput>();
        const result: Q.Promise<ProcessOutput> & WithChildProcess = deferred.promise;
        const cmdArgs = args.concat([this.file]);
        result.child = cp.execFile(
            'exiftool',
            cmdArgs,
            {
                // Strange compile errors occur, if 'utf8' is written differently (like 'utf-8')
                encoding: 'utf8'
            },
            function (err: Error, stdout: string, stderr: string): void {
                if (err) {
                    return deferred.reject(err);
                }
                deferred.resolve({
                    stdout: stdout,
                    stderr: stderr
                });
            });

        return result;
    }

}

export interface ProcessOutput {
    stdout: string;
    stderr: string;
}

export interface WithChildProcess {
    child?: cp.ChildProcess;
}


