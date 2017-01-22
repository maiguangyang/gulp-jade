'use strict'

import gulp         from  'gulp'
import sass         from  'gulp-sass'           //- SASS
import concat       from  'gulp-concat-dir'     //- 合并
import rename       from  'gulp-rename'         //- 改名
import hash         from  'gulp-hash'           //- md5版本号
import del          from  'del'                 //- 删除
import revReplace   from  'gulp-rev-replace'    //- 路径替换
import minifycss    from  'gulp-minify-css'     //- 压缩CSS
import minifyHTML   from  'gulp-minify-html'    //- 压缩HTML

import babel        from  'gulp-babel'          //- ES6
import uglify       from  'gulp-uglify'         //- JS压缩
import replace      from  'gulp-replace'        //- 替换

import spritesmith  from  'gulp.spritesmith'    //- sprite图片合并
import buffer       from  'vinyl-buffer'
import imagemin     from  'gulp-imagemin'
import merge        from  'merge-stream'
import jade         from  'gulp-jade'


import gulpif       from  'gulp-if'             //- if条件
import minimist     from  'minimist'            //- 命令行参数解析

import plumber      from  'gulp-plumber'        //监听错误
import _            from  'lodash'              //lodash
import fs           from  'fs'              //lodash

import {
    ROOT_PATH,
    proTips,
    paths,
    inputPath,
    outputPath,
    options,
    sprite,

  }  from  './path'

let getVersion = (func) => {
  return gulpif(options.env === 'master', func)
}

/**
 * 压缩jade
 */

gulp.task('jade', ['static'], () => {
  if (_.isEmpty(options.name)) {console.log(proTips); return false;};
  setTimeout(function () {
    let manifest = gulp.src(`${paths.dist}/${paths.fileName}`)          //- hash版本文件
    return gulp.src([`${inputPath.files}/*.jade`])                      //- 读取需要替换的html
    .pipe(jade({pretty: '\t'}))
    .pipe(plumber())
    .pipe(revReplace({manifest: manifest}))                             //- 执行文件内路径替换
    .pipe(getVersion(minifyHTML({comments:true, spare:true})))          //- master环境压缩文件
    .pipe(gulp.dest(`${outputPath.files}`));                            //- 替换后的文件输出的目录
  }, 500);


});


/**
 * 编译SASS
 * @param  {[type]} 'styles'  任务名称
 * @param  {[type]} clean     调用回调函数
 * @return {[type]}
 */
gulp.task('styles', () => {
  if (_.isEmpty(options.name)) {console.log(proTips); return false;};
  del([`${outputPath.styles}/*.css`], {force: true});
  return gulp.src(`${inputPath.styles}/*.scss`)
    .pipe(plumber())
    .pipe(concat({ext:'.css'}))                         //- 根据文件/文件夹名合并
    .pipe(sass( {outputStyle: 'expanded'}))             //- 输出样式格式
    .pipe(hash())                                       //- 文件名加MD5后缀
    .pipe(getVersion(rename({suffix: '.min'})))         //- master环境改名
    .pipe(getVersion(minifycss()))                      //- master环境压缩
    .pipe(gulp.dest(`${outputPath.styles}`))            //- 输出编译后的css文件
    .pipe(hash.manifest(`${paths.fileName}`))           //- JSON版本号
    .pipe(gulp.dest(`${paths.dist}`))                   //- 输出版本号JSON文件

});


/**
 * 合并JS
 * @param  {string} 'styles'  任务名称
 * @param  {[type]} clean     调用回调函数
 * @return {[type]}
 */
gulp.task('mergejs', () => {
  if (_.isEmpty(options.name)) {console.log(proTips); return false;};
  del([`${outputPath.scripts}/*.js`], {force: true});

  let manifest = gulp.src(`${paths.dist}/${paths.fileName}`)          //- hash版本文件

  gulp.src(`${inputPath.scripts}/*.js`)
    .pipe(plumber())
    .pipe(revReplace({manifest: manifest}))                           //- 执行文件内路径替换
    .pipe(concat({ext:'.js'}));                                       //- 根据文件/文件夹名合并
})

/**
 * js babel编译
 */
gulp.task('scripts', ['mergejs'], () => {

    gulp.src(`${inputPath.scripts}/*.js`)
    .pipe(babel())                                                    //- 编译ES6
    .pipe(hash())                                                     //- 文件名加MD5后缀
    .pipe(getVersion(rename({suffix: '.min'})))                       //- master环境改名
    .pipe(getVersion(uglify()))                                       //- master环境压缩
    .pipe(gulp.dest(`${outputPath.scripts}`))                         //- 输出编译后的JS文件
    .pipe(hash.manifest(`${paths.fileName}`))                         //- JSON版本号
    .pipe(gulp.dest(`${paths.dist}`))                                 //- 输出版本号JSON文件


    /**
     * 复制common/libs目录文件到项目目录
     */
    gulp.src([`${paths.common}/scripts/libs/*.js`])
    .pipe(gulp.dest(`${outputPath.scripts}/libs/`));


    /**
     * require config配置文件
     */

     setTimeout(function () {
      let manifest = gulp.src(`${paths.dist}/${paths.fileName}`)          //- hash版本文件
      gulp.src([`${inputPath.common}/scripts/config.js`])
      .pipe(revReplace({manifest: manifest}))                             //- 执行文件内路径替换
      .pipe(hash())
      .pipe(gulp.dest(`${outputPath.scripts}/`))
      .pipe(hash.manifest(`${paths.fileName}`))                         //- JSON版本号
      .pipe(gulp.dest(`${paths.dist}`))                                 //- 输出版本号JSON文件



      /**
       * 替换require里面带.js后缀
      */

      setTimeout(function () {
        let requireFile = JSON.parse(fs.readFileSync(`${paths.dist}/${paths.fileName}`), 'utf8');
        let fileUrl     = `${outputPath.scripts}/${requireFile['config.js']}`;

        let fileRev     = fs.readFile(fileUrl, 'UTF-8', function (err, res) {
          let data = res.replace(/.js/gi, '');
          fs.writeFile(fileUrl, data, 'utf8', (err) => {
            if (err) throw err;
          });
        });

      }, 500);

     }, 500);

});


/**
 * 合并精灵图
 */

gulp.task('sprite', () => {
  if (_.isEmpty(options.name)) {console.log(proTips); return false;};
  gulp.src(`${inputPath.images}/sprites/*.png`)
  .pipe(plumber())
  .pipe(spritesmith({
    imgName : `images/_sprites/sprite.png`,                                    //输出合并图片
    cssName : `../_sprite.scss`,                                               //输出SCSS文件
    padding : 5,                                                               //合并间隔
    cssTemplate: `${sprite.path}/temp.css`                                     //SCSS模板文件
  }))
  .pipe(gulp.dest(`${inputPath.styles}/components/assets`));

});


/**
 * 复制common/libs目录文件到项目目录
 */

gulp.task('libs', () => {
  if (_.isEmpty(options.name)) {console.log(proTips); return false;};
  gulp.src([`${paths.common}/scripts/libs/*.js`])
  .pipe(gulp.dest(`${outputPath.scripts}/libs/`));

});

/**
 * 复制精灵图、图片
 */
gulp.task('move', ['sprite', 'libs'], () => {

    gulp.src([`${inputPath.scripts}/libs/*.js`])
    .pipe(gulp.dest(`${outputPath.scripts}/libs/`));

    gulp.src([`${inputPath.styles}/components/assets/images/_sprites/*.png`])
    .pipe(gulp.dest(`${outputPath.images}/_sprites/`));

    gulp.src([`${inputPath.images}/*.png`, `${inputPath.images}/*.jpg`])
    .pipe(gulp.dest(`${outputPath.images}`));

});


/**
 * 删除当前项目历史文件
 */

gulp.task('del', () => {
  if (_.isEmpty(options.name)) {console.log(proTips); return false;};
  del([`${paths.dist}`], {force: true});
  // del([`${inputPath.styles}/components/assets`], {force: true});
});



/**
 * 静态资源
 */
gulp.task('static', ['styles', 'scripts'], () => {
  console.log('static compile complete');
});


/**
 * 默认任务
 */
gulp.task('default', ['move', 'jade'], () => {
  if (_.isEmpty(options.name)) {console.log(proTips); return false;};
  gulp.watch(`${inputPath.styles}/**/*.scss`, ['jade']);
  gulp.watch(`${inputPath.scripts}/*.js`, ['jade']);
  gulp.watch(`${inputPath.files}/**/*.jade`, ['jade']);

});