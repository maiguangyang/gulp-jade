/**
 * Marquee 轮播
 */

class Marquee {

  constructor (height, time, dom, item, pos) {
    this.index  = 0;
    this.height = height || $(dom).children(item).height();
    this.time   = time || 2000;
    this.len    = $(dom).children(item).length * 2 || 0;
    this.ul     = $(dom) || '';
    this.pos    = pos || 'left';
    this.aspect = ('top' === this.pos || 'bottom' === this.pos ) ? 'heigth' : 'width';
  }

  init () {
    this.ul
    .append(this.ul.html())
    .css({
      [this.aspect] : this.len * this.height,
      [this.pos]    : -this.len * this.height / 2
    });

    setInterval(() => {
      this.index = parseInt(this.ul.css(this.pos)) - this.height;
      this.showCurrent(this.index);
    }, this.time);

  }

  showCurrent(index) {
    if (this.ul.is(':animated')){
      return;
    }

    this.ul.animate({[this.pos]: index}, 500, () => {
      if (index === 0) {
        this.ul.css(this.pos, -this.len * this.height / 2);
      }
      else if (index === (1 - this.len) * this.height) {
        this.ul.css(this.pos, (1 - this.len / 2) * this.height);
      }
    });
  }
}