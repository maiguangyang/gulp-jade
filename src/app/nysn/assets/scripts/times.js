
let timer;

function getRTime(){
  let EndTime = new Date('2017/02/12 00:00:00');
  let NowTime = new Date();
  let t       = EndTime.getTime() - NowTime.getTime();

  if (NowTime.getTime() >= EndTime.getTime()) {
    $('.prompt').hide();
    $('.btn-enroll').css('display', 'block');
    clearInterval(timer);
    return false;
  }
  else {
    $('.btn-enroll').css('display', 'none');
    $('.prompt').show();

    let d = Math.floor(t / 1000 / 60 / 60 / 24);
    let h = Math.floor(t / 1000 / 60 / 60 % 24);
    let m = Math.floor(t / 1000 / 60 % 60);
    let s = Math.floor(t / 1000 % 60);

    let [html, dHtml, hHtml, mHtml] = ['', '', '', ''];

    dHtml = forHtml(d + '');
    hHtml = forHtml(h + '');
    mHtml = forHtml(m + '');

    $('.times span.d').html(dHtml);
    $('.times span.h').html(hHtml);
    $('.times span.m').html(mHtml);
  }
}

function forHtml(str) {
  let html = '';
  if (0 < str.length) {
    if (1 === str.length) {
      str = `0${str}`;
    }

    for (var i = 0; i < str.length; i++) {
      html += `<span>${str[i]}</span>`;
    }
  }

  return html;
}

timer = setInterval(getRTime,1000);