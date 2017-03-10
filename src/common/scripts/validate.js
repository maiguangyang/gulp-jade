define(['jquery', 'message'], ($, createMessage) => {

  let formValid = {

    onChange () {
      let item = $(this);
      let _this = this;

      for (let i in this.nodeList) {
        let elem = this.nodeList[i];
        item.find(elem).each(function(index, el) {
          $(el)
          .on('keyup', function(event) {
            event.preventDefault();
            if ($(this).parent().hasClass(_this.nodeState.error)) {
              $(this).parent().removeClass(_this.nodeState.error);
            }
          })
          .on('focus', function(event) {
            event.preventDefault();
            $(this).parent().addClass(_this.nodeState.focus);
          })
          .on('blur', function(event) {
            event.preventDefault();
            $(this).parent().removeClass(_this.nodeState.focus);
          });
        });
      };

    },

    nodeList: ['input', 'textarea', 'select'],
    nodeState: {
      error  : 'in-error',
      focus  : 'in-focus',
      success: ''
    },

    itemEach: function (item) {
      let _this = this;

      let nodeState = false;

      for (let i in this.nodeList) {
        let elem = this.nodeList[i];
        if (false === nodeState) {
          item.find(elem).each(function(index, el) {
            let v = _this.validFunc(el);
            if (false === v) {
              nodeState = true;
              return false;
            }
          });
        }
      }

      if (false === nodeState) {
        return true;
      }

      return false;

    },

    validFunc (el) {
      let isStatus = true;

      let e = $(el);
      e.parent().removeClass(this.nodeState.error);
      let required = e.attr('required');
      let validate = e.attr('validate');

      /**
       * 判断必填项
       */
      if (required != undefined) {
        if (null === e.val() || 0 >= e.val().length) {
          let tips    = `${e.attr('name')}不能为空`;
          let objTip  = e.attr('tips');

          if (objTip != undefined) {
            objTip  = JSON.parse(objTip);
            if (objTip.tips) {
              tips = objTip.tips;
            }
          }

          e.focus();
          e.parent().addClass(this.nodeState.error);

          createMessage(`${tips}`, 'error', 2);
          isStatus = false;
          return false;
        }
      }

      /**
       * 正则验证
       */
      if (validate != undefined) {

        if (null === e.val() || 0 < e.val().length ) {
          let pattern = e.attr('pattern');
          let regName = e.attr('name');
          let tips    = `${regName}格式不正确`;

          //是否自定义正则提示
          let objTip  = e.attr('tips');
          if (objTip != undefined) {
            objTip  = JSON.parse(objTip);
            if (objTip.patt) {
              tips = objTip.patt;
            }
          }

          //是否自定义正则
          if (pattern != undefined) {
            let patt = new RegExp(pattern);
            if(false === patt.test(e.val())) {
              isStatus = false;
              createMessage(`${tips}`, 'error', 2);
              return false;
            }
          }

          //全局正则规则
          else if (regName != undefined) {
            if (isValiDate[regName]) {
              let isVali = isValiDate[regName](e.val());
              switch(isVali) {
                case 'regexp':
                  createMessage(`${tips}`, 'error', 2);
                  break;
                case 'length':
                  createMessage(`${regName}长度已超出`, 'error', 2);
                  break;
              }

              if (true !== isVali) {
                isStatus = false;
                e.focus();
                e.parent().addClass(this.nodeState.error);
                return false;
              }
            }

          }
        }
      }

      return isStatus;

    },

    validate: function () {
      return this.itemEach($(this));
    }
  }


  $.fn.extend(formValid);


  /**
   * 正则规则
   */

  let isValiDate = {
    email (value) {
      if (!/^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test(value)) {
        return 'regexp';
      }
      return true;
    },

    phone (value) {
      if (!/^1[34578]\d{9}$/.test(value)) {
        return 'regexp';
      }
      return true;
    },

    username (value) {
      if (!/^[\u4E00-\uFA29]+$/i.test(value)) {
        return 'regexp';
      }

      if (3 < (value || '').length) {
        return 'length';
      }

      return true;
    },
  }

  return isValiDate;
})