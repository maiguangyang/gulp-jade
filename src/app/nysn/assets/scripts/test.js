
require(['jquery'], function($){
  let test = {
    name : 'test',
    say () {
      console.log('test Say1');
    },
  }

  return {
    test : test,
  }
})