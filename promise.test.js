const { MyPromise } = require("./promise");

function newPromise() {
  let res, rej;
  const promise = new MyPromise(function(_res, _rej) {
    res = _res;
    rej = _rej;
  });

  return [promise, res, rej];
}

describe("testing MyPromise", () => {
  it("new", () => {
    let res, rej;
    function construct(_res, _rej) {
      res = _res;
      rej = _rej;
    }
    new MyPromise(construct);

    expect(res).toEqual(expect.any(Function));
    expect(rej).toEqual(expect.any(Function));
  });

  it("reject from initializer exception", async () => {
    const err = new Error("mock");
    function construct() {
      throw err;
    }

    let cought;
    let promise = new MyPromise(construct);
    try {
      await promise;
    } catch (e) {
      cought = e;
    }

    expect(cought).toBe(err);
  });

  it("then after resolve", async () => {
    const [promise, res, rej] = newPromise();
    const v = {};
    res(v);
    expect(await promise).toBe(v);
  });

  it("then before resolve", async () => {
    const [promise, res, rej] = newPromise();

    const v = {};
    setTimeout(() => res(v), 100);
    expect(await promise).toBe(v);
  });

  it("catch after reject", async () => {
    const [promise, res, rej] = newPromise();
    const v = {};
    rej(v);

    let err;
    try {
      await promise;
    } catch (_err) {
      err = _err;
    }

    expect(err).toBe(v);
  });

  it("then returns a new promise", async () => {
    const [promise, res, rej] = newPromise();
    const v = {};
    res(123);

    expect(await promise.then(() => v)).toBe(v);
  });

  it("callback return a thenable", async () => {
    const [promise, res, rej] = newPromise();
    const v = {};
    res(123);

    const thenable = { then: r => r(v) };

    expect(
      await promise.then(() => thenable).then(v => (v.then ? "thenable" : v))
    ).toBe(v);
  });
});
