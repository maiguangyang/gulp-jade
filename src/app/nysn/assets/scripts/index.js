
require(['test', 'nprogress'], (t, NProgress) => {

  NProgress.start();
  setTimeout(function() { NProgress.done(); $('.fade').removeClass('out'); }, 1000);

})