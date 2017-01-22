import _            from  'lodash'
import gulp         from  'gulp'
import hash         from  'gulp-hash'
import del          from  'del'
import fs           from  'fs'
import {paths, outputPath}  from  './path'

export let requireWriteFile = function (url) {
  let results = {};

  let files = fs.readdirSync(url);

  files.forEach(function (path) {
    let fileName = path.replace(/.js/gi, '');

    let arr =  _.split(fileName, '-');

    if (0 < arr.length - 1) {
      results[arr[arr.length - 2]] = `${outputPath.require}/${fileName}`;
    }
    else if (0 > path.indexOf('.js')) {

      let libPath = fs.readdirSync(`${url}/${path}`);

      libPath.forEach(function (file) {
        let fileName = file.replace(/.js/gi, '');

        results[fileName] = `${outputPath.require}/${path}/${fileName}` ;
      });

    }
  });

  let str = JSON.stringify(results);

  results = `require.config({
    paths : ${str},
  });`;

  let confPath = `${outputPath.scripts}/config.js`;


  /**
   * 写入config文件
   */

  fs.writeFile(`${confPath}`, results, 'utf8', (err) => {
    if (err) throw err;
  });


  /**
   * config hash改名
   */

  gulp.src(confPath)
  .pipe(hash())
  .pipe(gulp.dest(`${outputPath.scripts}/`))
  .pipe(hash.manifest(`${paths.fileName}`))                         //- JSON版本号
  .pipe(gulp.dest(`${paths.dist}`))                                 //- 输出版本号JSON文件

  del([`${confPath}`], {force: true});
}