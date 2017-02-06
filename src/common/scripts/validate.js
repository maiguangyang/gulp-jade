define(['jquery', 'message'], ($, createMessage) => {

  let formValid = {

    itemEach: function (item) {
      let isStatus = true;

      item.children().each(function(index, el) {
        let e = $(el);

        let required = e.attr('required');
        let validate = e.attr('validate');

        /**
         * 判断必填项
         */
        if (required != undefined) {
          if (0 >= e.val().length) {
            let tips    = `${e.attr('name')}不能为空`;
            let objTip  = e.attr('tips');

            if (objTip != undefined) {
              objTip  = JSON.parse(objTip);
              if (objTip.tips) {
                tips = objTip.tips;
              }
            }

            createMessage(`${tips}`, 'error', 2);
            isStatus = false;
          }
        }

        /**
         * 正则验证
         */
        if (validate != undefined) {
          if (0 < e.val().length ) {
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
              }
            }

            //全局正则规则
            else if (regName != undefined) {
              if (isValiDate[regName]) {
                let isVali = isValiDate[regName](e.val());
                if (true !== isVali) {
                  isStatus = false;
                }

                switch(isVali) {
                  case 'regexp':
                    createMessage(`${tips}`, 'error', 2);
                    break;
                  case 'length':
                    createMessage(`${regName}长度已超出`, 'error', 2);
                    break;
                }
              }

            }
          }

        }
      });

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
    emall (value) {
      console.log(value);
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