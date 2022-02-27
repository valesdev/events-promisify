import EventEmitter from '../src/index'

test('Global Test', async () => {

  const ee = new EventEmitter()

  ee.on('event-a', function (arg1: number, arg2: number) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        console.log(arg1 + arg2)
        resolve('foo')
      }, 1e3)
    })
  })

  ee.on(['event-a', 'event-b'], function (arg1: number, arg2: number) {
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

  const [ret1, ret2] = await Promise.all([
    ee.emit('event-a', 11, 22)
      .then(function () {
        return 'event-a finished'
      })
      .catch(function (error: Error) {
        return `event-a failed: ${error.message}`
      }),
    ee.emit('event-b', 10, 0)
      .then(function () {
        return 'event-b finished'
      })
      .catch(function (error: Error) {
        return `event-b failed: ${error.message}`
      })
  ])

  expect(ret1).toBe('event-a finished')
  expect(ret2).toBe('event-b failed: Division by zero!')

})
