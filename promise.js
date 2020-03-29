const PENDING = 1;
const RESOLVED = 2;
const REJECTED = 3;

class MyPromise {
  constructor(initializer) {
    this._state = PENDING;
    this._value = undefined;
    this._onRsolve = [];
    this._onReject = [];
    this._timer = 0;

    if (initializer) {
      try {
        initializer(this._resolve.bind(this), this._reject.bind(this));
      } catch (err) {
        this._reject(err);
      }
    }
  }

  then(onResolve, onReject) {
    if (onReject) this.catch(onReject);

    if (this._state == REJECTED) return;
    if (typeof onResolve != "function") return;
    const promise = new MyPromise();
    this._onRsolve.push([onResolve, promise]);
    this._call();
    return promise;
  }

  catch(onReject) {
    if (this._state == RESOLVED) return;
    if (typeof onReject != "function") return;
    const promise = new MyPromise();
    this._onReject.push([onReject, promise]);
    this._call();
    return promise;
  }

  _resolve(value) {
    this._onReject.length = 0;
    if (this._state != PENDING) return;
    this._state = RESOLVED;
    this._value = value;
    this._call();
  }

  _reject(value) {
    this._onRsolve.length = 0;
    if (this._state != PENDING) return;
    this._state = REJECTED;
    this._value = value;
    this._call();
  }

  _call() {
    if (this._state == PENDING) return;
    if (this._timer) return;
    this._timer = setTimeout(() => this._run(), 0);
  }

  _run() {
    clearTimeout(this._timer);
    this._timer = 0;
    if (this._state == RESOLVED) {
      for (const [cb, promise] of this._onRsolve) {
        if (typeof cb == "function") {
          try {
            const value = cb(this._value);
            if (value && typeof value.then == "function") {
              value.then(
                v => promise._resolve(v),
                v => promise._reject(v)
              );
            } else {
              promise._resolve(value);
            }
          } catch (err) {
            promise._reject(err);
          }
        } else {
          promise._resolve(this._value);
        }
      }
      return;
    }

    if (this._state == REJECTED) {
      for (const [cb, promise] of this._onReject) {
        if (typeof cb == "function") {
          try {
            promise._resolve(cb(this._value));
          } catch (err) {
            promise._reject(err);
          }
        } else {
          promise._reject(this._value);
        }
      }
      return;
    }
  }
}

module.exports = {
  MyPromise
};
