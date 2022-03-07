# events-promisify

[![Version](https://img.shields.io/npm/v/events-promisify.svg)](https://www.npmjs.com/package/events-promisify)
[![Downloads](https://img.shields.io/npm/dm/events-promisify.svg)](https://npmcharts.com/compare/events-promisify?minimal=true)
[![License](https://img.shields.io/npm/l/events-promisify.svg)](https://www.npmjs.com/package/events-promisify)

Just another JavaScript EventEmitter for Promise.

## Installation

### Node.js

```sh
$ npm install --save events-promisify
```

### Browser via CDN

```html
<script src="https://cdn.jsdelivr.net/npm/events-promisify/dist/index.umd.js"></script>
```

## Usage

```js
import EventEmitter from 'events-promisify'

const ee = new EventEmitter()

ee.on('event-a', function () {
  /**
   * listener can return a Promise instance
   * all listeners will be executed serially
   */
  return new Promise(function (resolve, reject) {
    /** resolve asynchronously */
    setTimeout(function () {
      resolve('the result')
    }, 1e3)
    /**
     * ...or reject with an Error instance
     * will cause the emitter rejected immediately
     */
    // reject(new Error('Failed!'))
  })
})

ee.once(['event-a', 'event-b'], function (arg1, arg2) {
  /** ...or return anything */
  return `foo ${arg1} bar ${arg2}`
})

ee.on('event-b', function () {
  /**
   * ...or throw an Error instance
   * also will cause the emitter rejected immediately
   */
  throw new Error('Failed!')
})

ee.emit('event-a', 11, 22)
  .then(function (results) {
    /** event finished */
  })
  .catch(function (error) {
    /** event failed with error */
  })
```

## API

### `ee.on(<eventName>, <func>)`

Listen on events.

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `eventName` | String\|String[] | The event name or array of event names. | (required) |
| `func` | Function | The listener function. | (required) |

- Returns: `void`

### `ee.once(<eventName>, <func>)`

Listen on events for one-time execution.

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `eventName` | String\|String[] | The event name or array of event names. | (required) |
| `func` | Function | The listener function. | (required) |

- Returns: `void`

### `ee.off(<eventName>, <func>)`

Remove listener for events.

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `eventName` | String\|String[] | The event name or array of event names. | (required) |
| `func` | Function | The listener function. | (required) |

- Returns: `void`

### `ee.emit(<eventName>, [...args])`

Listen on events.

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `eventName` | String | The event name. | (required) |
| `args` | ...any | Arguments passed to listeners. | |

- Returns: `Promise<any>`

## License

[MIT](http://opensource.org/licenses/MIT)
