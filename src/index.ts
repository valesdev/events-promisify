interface Listener {
  func: Function
  once: boolean
}

interface ListenerGroup {
  [key: string]: Listener[]
}

type WalkArrayIterator = (
  listener: Listener,
  key: number,
  callback: (
    error: Error | null,
    result: any
  ) => void
) => void

type WalkArrayCallback = (
  error: Error | null
) => void

export default class EventEmitter {
  private events: ListenerGroup = {}

  /**
   * Listen on events.
   *
   * @param eventName The event name or array of event names
   * @param func The listener function
   * @public
   */
  public on(eventName: string | string[], func: Function): void {
    if (Array.isArray(eventName)) {
      eventName.forEach((el: string) => {
        this.addListener(el, func)
      })
    } else {
      this.addListener(eventName, func)
    }
  }

  /**
   * Listen on events for one-time execution.
   *
   * @param eventName The event name or array of event names
   * @param func The listener function
   * @public
   */
  public once(eventName: string | string[], func: Function): void {
    if (Array.isArray(eventName)) {
      eventName.forEach((el: string) => {
        this.addListener(el, func, true)
      })
    } else {
      this.addListener(eventName, func, true)
    }
  }

  /**
   * Remove listener for events.
   *
   * @param eventName The event name or array of event names
   * @param func The listener function
   * @public
   */
  public off(eventName: string | string[], func: Function): void {
    if (Array.isArray(eventName)) {
      eventName.forEach((el: string) => {
        this.removeListener(el, func)
      })
    } else {
      this.removeListener(eventName, func)
    }
  }

  /**
   * Trigger an events.
   *
   * @param eventName The event name
   * @param args Arguments passed to listeners
   * @public
   */
  public emit(eventName: string, ...args: any[]): Promise<void> {
    if (!(eventName in this.events)) {
      this.events[eventName] = []
    }

    return new Promise<void>((resolve, reject) => {
      this.walkArray(this.events[eventName], (listener: Listener, key: number, callback: (error: Error | null, result: any) => void) => {
        if (!listener) {
          callback(null, null)
          return
        }

        if (typeof listener.func !== 'function') {
          callback(new Error('Invalid listener.'), null)
          return
        }

        // execute listener function
        const ret = listener.func.apply(null, args)

        Promise.resolve(ret).then(
          function (result) {
            if (result instanceof Error) {
              callback(result, null)
            } else {
              callback(null, result)
            }
          },
          function (error) {
            callback(error, null)
          }
        )

        if (listener.once) {
          this.removeListener(eventName, listener.func)
        }
      }, function (error: Error | null) {
        if (error !== null) {
          reject(error)
          return
        }
        resolve()
      })
    })
  }

  private addListener(eventName: string, func: Function, once: boolean = false): void {
    if (typeof eventName !== 'string' || eventName.length <= 0) {
      throw new Error('Invalid event name.')
    }

    if (typeof func !== 'function') {
      throw new Error('Invalid listener.')
    }

    if (!(eventName in this.events)) {
      this.events[eventName] = []
    }

    this.events[eventName].push({ func, once })
  }

  private removeListener(eventName: string, func: Function): void {
    if (typeof eventName !== 'string' || eventName.length <= 0) {
      throw new Error('Invalid event name.')
    }

    if (typeof func !== 'function') {
      throw new Error('Invalid listener.')
    }

    if (!(eventName in this.events)) {
      this.events[eventName] = []
    }

    const index = this.indexOfListeners(this.events[eventName], func)
    if (index !== null) {
      delete this.events[eventName][index]
    }
  }

  private indexOfListeners(listeners: Listener[], func: Function): number | null {
    for (let i = 0; i < listeners.length; i++) {
      if (listeners[i] && listeners[i].func === func) {
        return i
      }
    }
    return null
  }

  private walkArray(array: any[], iterator: WalkArrayIterator, callback: WalkArrayCallback): void {
    if (array.length === 0) {
      callback(null)
      return
    }

    let cur: number = 0

    const resolve = function (result: any) {
      cur++
      if (cur < array.length) {
        // continue walking
        walk()
      } else {
        // end when all elements walked
        callback(null)
      }
    }

    const reject = function (error: Error) {
      // end immediately when error occurred
      callback(error)
    }

    const walk = function () {
      iterator(array[cur], cur, function (error: Error | null, result: any) {
        if (error !== null) {
          reject(error)
          return
        }
        resolve(result)
      })
    }

    walk()
  }
}
