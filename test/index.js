const EventEmitter = require('../dist/events-promisify.cjs')

const ee = new EventEmitter()

ee.on('event-a', function (arg1, arg2) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      console.log(arg1 + arg2)
      resolve('foo')
    }, 1e3)
  })
})

ee.on(['event-a', 'event-b'], function (arg1, arg2) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (arg2 === 0) {
        reject(new Error('Division by zero!'))
        return
      }
      console.log(arg1 / arg2)
      resolve('bar')
    }, 2e3)
  })
})

ee.emit('event-a', 11, 22)
  .then(function () {
    console.debug('event-a finished')
  })
  .catch(function (error) {
    console.debug('event-a failed:', error)
  })

ee.emit('event-b', 10, 0)
  .then(function () {
    console.debug('event-b finished')
  })
  .catch(function (error) {
    console.debug('event-b failed:', error)
  })
