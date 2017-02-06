
define(['jquery', 'message'], ($, createMessage) => {

  let count   = 3;
  let state   = false;

  /**
   * 错误重新请求3次
   */
  let reset = (url, type, data, dataType, headers, timeout, success, errFunc) => {
    let t = setTimeout(function () {
      if (0 < count) {
        state = false;
        count --;

        http(url, type, data, dataType, headers, timeout, (res) => {
          return success ? success(res) : function () {};
        }, (err) => {
          return errFunc ? errFunc(err) : function () {};
        });

      }
      else {
        clearTimeout(t);
        count = 3;
        state = false;
        return false;
      }


    }, timeout);
  };

  /**
   * ajax
   */
  let http = (url, type, data, dataType, headers, timeout, success, errFunc) => {

    if (false === state) {
      timeout         = timeout || 10000;
      state           = true;
      $.support.cors  = true;

      $.ajax({
        url       : url,
        type      : type || 'get',
        dataType  : dataType || 'json',
        data      : data || '',
        headers   : headers || '',
        timeout   : timeout,
      })
      .success(() => {
        state = false;
        return success ? success(res) : function () {};
      })
      .error((err, errType) => {
        createMessage(`Status: ${err.status} ${err.statusText}` || '请求失败...', 'error', 3);
        reset(url, type, data, dataType, headers, timeout, success, errFunc);
      });
    }
    else {
      console.log('正在处理中...');
    }

  };

  return http;
});