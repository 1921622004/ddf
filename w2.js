// 广度优先异步遍历删除文件
function wideRmdir1(dir, cb) {
  let ary = [dir];
  let temp = ary;
  function walk(index) {
    if (index >= ary.length) {
      return done()
    };
    fs.stat(ary[index], (err, statObj) => {
      let curPath = ary[index];
      if (statObj.isDirectory()) {
        fs.readdir(ary[index], (err, files) => {
          ary = ary.concat(files.map(item => [curPath, item].join('/')));
          walk(++index);
        })
      } else {
        walk(++index);
      }
    });
  }
  walk(0);
  function done() {
    let len = ary.length;
    let index = len - 1;
    function deleteNext(index) {
      if (index < 0) return cb();
      let curPath = ary[index];
      fs.stat(curPath, (err, statObj) => {
        if (err) return;
        if (statObj.isDirectory()) {
          fs.rmdir(curPath, (err) => {
            !err && deleteNext(--index);
          })
        } else {
          fs.unlink(curPath, (err) => {
            !err && deleteNext(--index);
          })
        }
      })
    };
    deleteNext(index);
  }
}

// promise 并发先序删除文件
function rmdirParalleByPromise(dir) {
  return new Promise((resolve, reject) => {
    fs.stat(dir, (err, statObj) => {
      if (statObj.isDirectory()) {
        fs.readdir(dir, (err, files) => {
          let promiseAry = files.map(file => {
            let curPath = [dir, file].join('/');
            return new Promise((res, rej) => {
              rmdirParalleByPromise(curPath).then(res);
            })
          });
          Promise.all(promiseAry).then(() => {
            fs.rmdir(dir, (err) => {
              !err && resolve()
            })
          });
        })
      } else {
        fs.unlink(dir, (err) => {
          if (err) reject(err)
          resolve()
        })
      }
    })
  })
}
