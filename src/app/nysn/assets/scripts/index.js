
require(['test', 'nprogress', 'validate'], (t, NProgress, validate) => {

  $('.submit').on('click', function(event) {
    event.preventDefault();
    $('.form').validate();
  });

  NProgress.start();
  setTimeout(function() { NProgress.done(); $('.fade').removeClass('out'); }, 1000);

});