
define(['http'], (http) => {

  let test = {
    name : 'test',
    say () {
      console.log('test Say2');
    },

    get () {
      http('http://www.test.com/common/sms', '', '', '', '', 3000, (res) => {
        console.log(res);
      }, (err) => {
        console.log(err);
      });
    }
  };


  return test;
})