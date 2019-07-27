export default class EventEmitter {
  constructor () {
    this._events = {}
  }

  /**
   * Listen on events.
   *
   * @param eventName {String|Array<String>} The event name or array of event names
   * @param func {Function} The listener function
   * @public
   */
  on (eventName, func) {
    if (Array.isArray(eventName)) {
      eventName.forEach(el => {
        this.addListener(el, func, false)
      })
    } else {
      this.addListener(eventName, func, false)
    }
  }

  /**
   * Listen on events for one-time execution.
   *
   * @param eventName {String|Array<String>} The event name or array of event names
   * @param func {Function} The listener function
   * @public
   */
  once (eventName, func) {
    if (Array.isArray(eventName)) {
      eventName.forEach(el => {
        this.addListener(el, func, true)
      })
    } else {
      this.addListener(eventName, func, true)
    }
  }

  /**
   * Remove listener for events.
   *
   * @param eventName {String|Array<String>} The event name or array of event names
   * @param func {Function} The listener function
   * @public
   */
  off (eventName, func) {
    if (Array.isArray(eventName)) {
      eventName.forEach(el => {
        this.removeListener(el, func)
      })
    } else {
      this.removeListener(eventName, func)
    }
  }

  /**
   * Trigger an events.
   *
   * @param eventName {String} The event name
   * @param args {...any} Arguments passed to listeners
   * @returns {Promise<any>}
   * @public
   */
  emit (eventName, ...args) {
    if (!(eventName in this._events)) {
      this._events[eventName] = []
    }

    return new Promise((resolve, reject) => {
      this.walkArray(this._events[eventName], (listener, key, callback) => {
        if (!listener) {
          callback(null)
          return
        }

        if (typeof listener.func !== 'function') {
          callback(new Error('Invalid listener.'))
          return
        }

        // execute listener function
        const ret = listener.func(...args)

        Promise.resolve(ret).then(
          function (result) {
            if (result instanceof Error) {
              callback(result)
              return
            }
            callback(null, result)
          },
          function (error) {
            callback(error)
          }
        )

        if (listener.once) {
          this.removeListener(eventName, listener.func)
        }
      }, error => {
        if (error) {
          reject(error)
          return
        }
        resolve()
      })
    })
  }

  addListener (eventName, func, once = false) {
    if (typeof eventName !== 'string' || !eventName.length) {
      throw new Error('Invalid event name.')
    }

    if (!(eventName in this._events)) {
      this._events[eventName] = []
    }

    if (typeof func !== 'function') {
      throw new Error('Invalid listener.')
    }

    this._events[eventName].push({ func, once })
  }

  removeListener (eventName, func) {
    if (typeof eventName !== 'string' || !eventName.length) {
      throw new Error('Invalid event name.')
    }

    if (!(eventName in this._events)) {
      this._events[eventName] = []
    }

    if (typeof func !== 'function') {
      throw new Error('Invalid listener.')
    }

    const index = this.indexOfListeners(this._events[eventName], func)
    if (index !== -1) {
      delete this._events[eventName][index]
    }
  }

  indexOfListeners (listeners, func) {
    for (let i = 0; i < listeners.length; i++) {
      if (listeners[i] && listeners[i].func === func) {
        return i
      }
    }
    return -1
  }

  walkArray (array, iteratee, callback) {
    let cur = 0
    const results = []

    const resolve = function (result) {
      results.push(result)
      cur++
      if (cur < array.length) {
        // continue walking
        walk()
      } else {
        // end when all elements walked
        callback(null, results)
      }
    }

    const reject = function (error) {
      // end immediately when error occurred
      callback(error, results)
    }

    const walk = function () {
      iteratee(array[cur], cur, function (error, result) {
        if (error) {
          reject(error)
          return
        }
        resolve(result)
      })
    }

    walk()
  }
}
