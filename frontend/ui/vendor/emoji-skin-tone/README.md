# skin-tone [![Build Status](https://travis-ci.org/sindresorhus/skin-tone.svg?branch=master)](https://travis-ci.org/sindresorhus/skin-tone)

> Change the skin tone of an emoji πππ»ππΌππ½ππΎππΏ

The [Fitzpatrick scale](https://en.wikipedia.org/wiki/Fitzpatrick_scale#Unicode) is used to specify skin tones for emoji characters which represent humans.


## Install

```
$ npm install --save skin-tone
```


## Usage

```js
const skinTone = require('skin-tone');

skinTone('π', skinTone.BROWN);
//=> 'ππΎ'

// or by using the constant value directly
skinTone('π', 4);
//=> 'ππΎ

skinTone('π', skinTone.WHITE);
//=> 'ππ»'

// can also remove skin tone
skinTone('ππΎ', skinTone.NONE);
//=> 'π'

// just passes it through when not supported
skinTone('π¦', skinTone.DARK_BROWN);
//=> 'π¦'
```


## API

### skinTone(emoji, type)

#### emoji

Type: `string`

Emoji to modify.

#### type

Type: `number`<br>
Values:

- `skinTone.NONE`        | `0`:      *(Removes skin tone)*
- `skinTone.WHITE`       | `1`: π»   *(Fitzpatrick Type-1β2)*
- `skinTone.CREAM_WHITE` | `2`: πΌ   *(Fitzpatrick Type-3)*
- `skinTone.LIGHT_BROWN` | `3`: π½   *(Fitzpatrick Type-4)*
- `skinTone.BROWN`       | `4`: πΎ   *(Fitzpatrick Type-5)*
- `skinTone.DARK_BROWN`  | `5`: πΏ   *(Fitzpatrick Type-6)*


## License

MIT Β© [Sindre Sorhus](https://sindresorhus.com)
