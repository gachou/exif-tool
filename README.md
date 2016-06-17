# exif-tool 

[![NPM version](https://badge.fury.io/js/exif-tool.svg)](http://badge.fury.io/js/exif-tool)
     [![Travis Build Status](https://travis-ci.org/gachou/exif-tool.svg?branch=master)](https://travis-ci.org/gachou/exif-tool)
   [![Coverage Status](https://img.shields.io/coveralls/gachou/exif-tool.svg)](https://coveralls.io/r/gachou/exif-tool)


> A exif-tool wrapper with typings


# Installation

```
npm install exif-tool
```

 
## Usage

The following example demonstrates how to use this module:

```js
const ExifTool = require('exif-tool').ExifTool
const fs = require('fs')

fs.writeFileSync('copy.jpg', fs.readFileSync('with-xmp-identifier.jpg'));
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
```

This will generate the following output

```
original { SourceFile: './copy.jpg',
  EXIF: 
   { DateTimeOriginal: 
      { [Number: 1308838545000]
        _isAMomentObject: true,
        _i: '2011:06:23 16:15:45',
        _f: 'YYYY:MM:DD HH:mm:ss',
        _strict: true,
        _isUTC: false,
        _pf: [Object],
        _locale: [Object],
        _d: Thu Jun 23 2011 16:15:45 GMT+0200 (CEST),
        _isValid: true } },
  XMP: { Identifier: 'gachou-12345' } }
modified tags { SourceFile: './copy.jpg',
  EXIF: 
   { DateTimeOriginal: 
      { [Number: 1466185413000]
        _isAMomentObject: true,
        _i: '2016:06:17 19:43:33',
        _f: 'YYYY:MM:DD HH:mm:ss',
        _strict: true,
        _isUTC: false,
        _pf: [Object],
        _locale: [Object],
        _d: Fri Jun 17 2016 19:43:33 GMT+0200 (CEST),
        _isValid: true } },
  XMP: { Identifier: 'changed-id' } }
```

##  API-reference

<a name="ExifTool"></a>
### ExifTool
**Kind**: global class  

* [ExifTool](#ExifTool)
  * [new ExifTool(file)](#new_ExifTool_new)
  * [.loadTags([tags])](#ExifTool+loadTags) ⇒

<a name="new_ExifTool_new"></a>
#### new ExifTool(file)

| Param | Type | Description |
| --- | --- | --- |
| file | <code>string</code> | the filename |

<a name="ExifTool+loadTags"></a>
#### exifTool.loadTags([tags]) ⇒
Returns a number of tags from the file, optionally filterd by a list of
tags provided as first argument. The result is a nested JavaScript-object
for example, if `['Composite:Aperture','XMP:HierarchicalSubject']` is provided
as `tags`, the  result is something like

```js
{
   XMP: { HierarchicalSubject: ['Places|Darmstadt|Prinz-Georgs-Garten'] },
   Composite: { Aperture: 4.7 }
}
```

**Kind**: instance method of <code>[ExifTool](#ExifTool)</code>  
**Returns**: a promise resolving to an object that is structured like the output of `exiftool -g -j -struct`.  

| Param | Description |
| --- | --- |
| [tags] | a list of interesting tags (like `Composite:Aperture`)   a complete list of tags can be found at. Default is `[]` for: Get all possible tags   http://www.sno.phy.queensu.ca/~phil/exiftool/TagNames/index.html |




## License

`exif-tool` is published under the MIT-license. 
See [LICENSE.md](LICENSE.md) for details.

## Release-Notes
 
For release notes, see [CHANGELOG.md](CHANGELOG.md)
 
## Contributing guidelines

See [CONTRIBUTING.md](CONTRIBUTING.md).