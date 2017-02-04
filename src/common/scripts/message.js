
define(() => {


  let createMessage = (text, type, t) => {
    let message     = document.body;
    let parent      = document.createElement("div");
    let child       = document.createElement("div");
    let btn         = document.createElement("button");
    let inner       = document.createElement("div");

    let isMessage   = document.getElementById("messenger");

    let className   = type ? `message ${type}` : 'message';

    parent.id       = 'messenger';

    child.setAttribute('class', className);


    btn.setAttribute('type', 'button');
    btn.setAttribute('class', 'message-close');
    btn.innerHTML   = '×';
    btn.onclick = function () {
      this.parentNode.removeChild(this);
      console.log(this.parentNode);
    }

    inner.setAttribute('class', 'message-inner');
    inner.innerHTML = text;

    parent.appendChild(child);
    child.appendChild(btn);
    child.appendChild(inner);

    if (isMessage) {
      isMessage.appendChild(child);
    }
    else {
      message.appendChild(parent);
    }

    timeout(child, t);
  }


  /**
   * 出现、消失时间
   */

  function timeout (item, t) {
    let count = t ? t : 3;
    let timeout = function (item, count) {
      let timer = setTimeout(function () {
        if (0 >= count) {
          // item.style.opacity = 0;
          // item.parentNode.removeChild(item);
          clearTimeout(timer);
          return false;
        }
        else {
          count --;
          timeout(item, count);
        }

      }, 1000);
    }
    timeout(item, count);
  }



  /**
   * return
   */

  return createMessage;

});