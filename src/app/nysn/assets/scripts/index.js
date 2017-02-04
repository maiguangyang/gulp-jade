
require(['test', 'nprogress'], (t, NProgress) => {
  window.aa = t;
  NProgress.start();
  setTimeout(function() { NProgress.done(); $('.fade').removeClass('out'); }, 1000);

})