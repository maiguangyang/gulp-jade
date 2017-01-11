/**
 * 首页
 */

const prot = location.protocol;
const api = `${prot}//nysn-api.61qt.cn`;
const cdn = `${prot}//nysn-cdn.61qt.cn`;

let [isPhone, isCaptcha, isDynamic, isRespCaptcha] = [false, false, false, false];

let basc = {
  ajax (url, type, data, successFun, errFunc) {
    $.ajax({
      url  : url,
      type : type ? type : 'get',
      data : data ? data : '',
    })
    .done((res) => {
      return successFun ? successFun(res) : function () {};
    })
    .fail((err) => {
      return errFunc ? errFunc(err) : function () {};
    })
  }
}


//倒计时
let count = $.cookie('count') || 0;
let countdown = function () {
  let t = setTimeout(function () {
    if (0 >= count || !count) {
      if (isCaptcha) {
        $('.dynamic').addClass('ok');
        $('.dynamic button').html('获取动态码');
      }

      clearTimeout(t);
      return false;
    }

    $('.dynamic').removeClass('ok')
    $('.dynamic button').html(`（${count}s）重新获取`);
    count --;
    $.cookie('count', count);
    countdown();

  }, 1000);
};


$(function () {

  if (0 < $.cookie('count')) {
    countdown();
  }

  /**
   * 用户名
   */
  let user_token = $.cookie('phone');
  if (user_token) {
    $('#username').html(user_token);
  }
  else {
    $('#username').on('click', function(event) {
      event.preventDefault();
      // $('body').addClass('mask');
      // $('.modal').show();
    });
  }

  $('.close').on('click', function(event) {
    event.preventDefault();
    $('body').removeClass('mask');
    $('.modal').hide();
  });



  /**
   * 手机号码
   */

  $('.phone').on('input onpropertychange', function(event) {
    event.preventDefault();
    if((/^1[34578]\d{9}$/.test($(this).val())) && 4 === $('.input-captcha').val().length){
      isCaptcha = true;
      $('.dynamic').addClass('ok');
    }
    else {
      isCaptcha = false;
      $('.dynamic').removeClass('ok');
    }

  });

  /**
   * 图片验证码
   */

  $('.input-captcha').on('input onpropertychange', function(event) {
    event.preventDefault();
    if((/^1[34578]\d{9}$/.test($('.phone').val())) && 4 === $(this).val().length){
      isCaptcha = true;
      $('.dynamic').addClass('ok');
    }
    else {
      isCaptcha = false;
      $('.dynamic').removeClass('ok');
    }
  });

  /**
   * 短信验证码
   */
  $('.input-dynamic').on('input onpropertychange', function(event) {
    event.preventDefault();
    if(6 === $(this).val().length && true === isCaptcha){
      isDynamic = true;
      $('.submit').addClass('ok');
    }
    else {
      isDynamic = false;
      $('.submit').removeClass('ok');
    }
  });


  /**
   * 获取手机验证码
   */
  $('.dynamic').on('click', 'button', function(event) {
    event.preventDefault();
    /* Act on the event */
    if (isCaptcha) {
      let data = {
        captcha : $('.input-captcha').val(),
        type    : 'login',
        phone   : $('.phone').val(),
      }

      basc.ajax(`${api}/common/sms`, 'get', data, (res) => {
        if (0 === data.code) {
          isRespCaptcha = true;
          count = 60;
          countdown();
          return false;
        }
        isRespCaptcha = false;
      }, (err) => {
        console.log("error");
      });
    }
  });



  /**
   * 提交登录注册
   */
  $('.submit').on('click', function(event) {
    event.preventDefault();
    let phone     = $('.phone');
    let captcha   = $('.input-captcha');
    let dynamic   = $('.input-dynamic');

    if(!phone.val()){
      alert("请输入11位手机号码");
      phone.val('');
      phone.focus();
      return false;
    }

    if(!(/^1[34578]\d{9}$/.test(phone.val()))){
      alert("请输入正确手机号");
      phone.val('');
      phone.focus();
      return false;
    }

    if (captcha.val().length <= 0 ) {
      alert("请输入验证码");
      captcha.val('');
      captcha.focus();
      return false;
    }

    if (dynamic.val().length <= 0 ) {
      alert("请输入短信验证码");
      dynamic.val('');
      dynamic.focus();
      return false;
    }

    let data = {
      phone       : phone.val(),
      verify_code : dynamic.val(),
    }

    basc.ajax(`${api}/login`, 'post', data, (res) => {
      let data = res.data;
      if (0 === res.code) {
        $.cookie('JWT_USER_TOKEN', data.token, {expires: 1});
        $.cookie('phone', data.user.phone, {expires: 1});
        alert('登录成功');

        setTimeout(function () {
          window.location.reload();
        }, 1000);

      }
      else {
        alert(data.msg);
      }

    }, (err) => {
      console.log("error");
    });

  });


  /**
   * 验证码
   */
  // $('.captcha img')
  // .attr({
  //   src: `${api}/common/captcha?t=${Date.parse(new Date())}`,
  // })
  // .on('click', function (event) {
  //   event.preventDefault();
  //   $(this).attr('src', `${api}/common/captcha?t=${Date.parse(new Date())}`);
  // });


  /**
   * activity_rule        规则
   * pc_schedule_img      日程
   * pc_award_img         奖项
   */


  // basc.ajax(`${api}/config/website_config`, 'get', '', (res) => {
  //   if (0 === res.code) {
  //     let data = res.data;

  //     try {
  //       data = JSON.parse(data.value);
  //     }
  //     catch (err) {
  //       data = {};
  //     }

  //     let activity_rule   = data.activity_rule ? `<div class=item.activity_rule><img src=${cdn}/${data.activity_rule}></div>` : '';
  //     let pc_schedule_img = data.pc_schedule_img ? `<div class=item.pc_schedule_img><img src=${cdn}/${data.pc_schedule_img}></div>` : '';
  //     let pc_award_img    = data.pc_award_img ? `<div class=item.pc_award_img><img src=${cdn}/${data.pc_award_img}></div>` : '';
  //     let html = activity_rule + pc_schedule_img + pc_award_img;
  //     $('.img-groups').html(html);

  //   }

  // }, (err) => {
  //   alert(err.msg);
  // });

})