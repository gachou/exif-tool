/*!
 * gachou-default-plugins <https://github.com/gachou/gachou-default-plugins>
 *
 * Copyright (c) 2016 Nils Knappmeier.
 * Released under the MIT license.
 */

import { expect } from 'chai';
import * as path from 'path';
import * as qfs from 'q-io/fs';
import * as moment from 'moment';
const imageTestData = require('image-testdata');
// Note: Include compiled JS-file like a client-module would do
import { ExifTool, ExifToolData } from '../index';

const target = path.join(__dirname, '..', 'tmp');

describe('the exif-tool', function () {
    beforeEach(function (): Q.Promise<any> {
        return qfs.removeTree(target)
            .catch(() => {
                return;
            })
            .then(() => qfs.makeTree('tmp'));
    });

    describe('the loadTags-function', function () {
        it('should retrieve distinct tags when tag names are provided', function (): Promise<any> {
            return imageTestData('with-xmp-identifier.jpg', target)
                .then((image: string) => {
                    return new ExifTool(image).loadTags(['EXIF:DateTimeOriginal', 'EXIF:TimeZoneOffset']);
                })
                .then((result: ExifToolData) => {
                    // Make sure that only CreateDate is returned
                    expect(Object.keys(result.EXIF)).to.deep.equal(['DateTimeOriginal']);
                    expect(result.EXIF.DateTimeOriginal.format('YYYYMMDD-HHmmss')).to.deep.equal('20110623-161545');
                });
        });

        it('should retrieve all tags when no tag names are provided', function (): Promise<any> {
            return imageTestData('with-xmp-identifier.jpg', target)
                .then((image: string) => {
                    return new ExifTool(image).loadTags();
                })
                .then((result: ExifToolData) => {
                    expect(result.EXIF.DateTimeOriginal.format('YYYYMMDD-HHmmss')).to.deep.equal('20110623-161545');
                    expect(result.XMP.HierarchicalSubject).to.deep.equal(['Places|Darmstadt|Prinz-Georgs-Garten']);
                    expect(result.XMP.Identifier).to.equal('gachou-12345');
                    // TODO: Add more tags here and to the schema
                });
        });
    });

    describe('the saveTags-function', function () {

        it('should store tags into the image', function (): Promise<any> {
            let image: string = null;
            return imageTestData('with-xmp-identifier.jpg', target)
                .then((img: string) => {
                    image = img;
                })
                .then(() => new ExifTool(image).saveTags({
                    EXIF: {
                        DateTimeOriginal: moment('2011-01-23T20:15:45'),
                        TimeZoneOffset: 2
                    }
                }))
                .then((result: any) => {
                    return console.log(result);
                })
                .then(() => new ExifTool(image).loadTags())
                .then((result: ExifToolData) => {
                    // Check if the tags really have been stored
                    expect(result.EXIF.TimeZoneOffset).to.deep.equal(2);
                    expect(result.EXIF.DateTimeOriginal.format('YYYYMMDD-HHmmss')).to.deep.equal('20110123-201545');
                });
        });
    });
});
