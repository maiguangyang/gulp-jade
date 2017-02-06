
define(['jquery'], ($) => {


  let createMessage = (text, type, t) => {

    let className   = type ? `message ${type}` : 'message';
    let isMessage   = $('#messenger');
    let html        = '';

    let item = `<div class='${className}'>
        <button type='button' class='message-close'>×</button>
        <div class='message-inner'>${text}</div>
      </div>`

    if (0 < isMessage.length) {
      html = item;

      isMessage.append(html);
    }
    else {
      html = `<div id='messenger'>
        ${item}
      </div>`;

      $('body').append(html);
    }

    timeout(t);

    /**
     * 点击关闭移除
     */
    $('.message-close').on('click', function(event) {
      event.preventDefault();
      let item = $('.message');
      $(this).parent().remove();
    });
  }


  /**
   * 出现、消失时间
   */

  function timeout (t) {
    let count = t ? t : 3;
    let timeout = function (count) {
      let timer = setTimeout(function () {
        if (0 >= count) {
          $('.message').eq(0).css('opacity', 0);
          setTimeout(() => {
            $('.message').eq(0).remove();
          }, 500);
          clearTimeout(timer);
          return false;
        }
        else {
          count --;
          timeout(count);
        }

      }, 1000);
    }
    timeout(count);
  }

  /**
   * return
   */
  return createMessage;

});