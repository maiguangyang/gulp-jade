'use strict'

import _            from  'lodash'              //lodash
import fs           from  'fs'
import gulp         from  'gulp'
import gulpWatch    from  'gulp-watch'
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
import autoprefixer from 'gulp-autoprefixer'
import gulpSequence from  'gulp-sequence'

import {
  ROOT_PATH,
  proTips,
  paths,
  inputPath,
  outputPath,
  options,
  sprite,
}  from  './path'

import { requireWriteFile } from './func'

let getVersion = (func) => {
  return gulpif(options.env === 'master', func)
}


const watchOption = {
  ignoreInitial: false,
  verbose: true
}

/**
 * 编译Html
 */
gulp.task('html', () => {
  return setHtml();
});

/**
 * 编译SASS
 */
gulp.task('css', () => {
  return setStyles();
});

/**
 * 编译Js
 */
gulp.task('js', ['libs'], (cb) => {
  setTimeout(function () {
    requireWriteFile(outputPath.scripts);
  }, 1000);
  return setScript();
});


// Html文件函数
function setHtml (url = `${inputPath.files}/*.jade`, path = '') {
  if (_.isEmpty(options.name)) {console.log(proTips); return false;};
  let manifest = gulp.src(`${paths.dist}/${paths.fileName}`);
  return gulp.src(url)
  .pipe(jade({pretty: '\t'}))
  .pipe(plumber())
  .pipe(getVersion(minifyHTML({comments:true, spare:true})))      //- master环境压缩文件
  .pipe(revReplace({manifest: manifest}))                         //- 执行文件内路径替换
  .pipe(gulp.dest(`${outputPath.files}`));                        //- 替换后的文件输出的目录
}


// Css文件函数
function setStyles (url = `${inputPath.styles}/*.scss`, path = '') {
  let manifest = gulp.src(`${paths.dist}/${paths.fileName}`);
  return gulp.src(url)
  .pipe(plumber())
  .pipe(autoprefixer({
    browsers: ['ie 6-8', 'Firefox <= 20', '> 5%', 'last 2 versions', 'iOS 7'],
    cascade: false
  }))
  .pipe(sass({outputStyle: 'expanded'}))                   //- 输出样式格式
  .pipe(revReplace({manifest: manifest}))
  .pipe(getVersion(rename({suffix: '.min'})))         //- master环境改名
  .pipe(getVersion(minifycss()))                      //- master环境压缩
  .pipe(hash())

  .pipe(gulp.dest(`${outputPath.styles}`))            //- 输出编译后的css文件
  .pipe(hash.manifest(`${paths.fileName}`))           //- JSON版本号
  .pipe(gulp.dest(`${paths.dist}`))                   //- 输出版本号JSON文件
}


// Js文件函数
function setScript (url = `${inputPath.scripts}/*.js`, path = '') {

  return gulp.src(url)
  .pipe(plumber())
  .pipe(babel())
  .pipe(getVersion(rename({suffix: '.min'})))                       //- master环境改名
  .pipe(getVersion(uglify()))                                       //- master环境压缩
  .pipe(hash())                                                     //- 编译ES6

  .pipe(gulp.dest(`${outputPath.scripts}`))                         //- 输出版本号JSON文件
  .pipe(hash.manifest(`${paths.fileName}`))                         //- JSON版本号
  .pipe(gulp.dest(`${paths.dist}`))                                 //- 输出版本号JSON文件

}



/**
 * 监听文件改变
 */
gulp.task('watchStyles', ['css', 'js', 'html'], () => {

  // Html文件
  let url = `${inputPath.files}/*.jade`;
  gulpWatch(url, watchOption, (file) => {
    let filePath = _.get(file, 'history');
    if (!_.isEmpty(filePath)) {
      let fileName = filePath[filePath.length - 1].replace(/\\/gi, '/');
      let path = fileName.match(/src(\S*)\//)[1];

      setHtml(fileName, path);
    }
  });

  // 版本号文件
  gulpWatch(`${paths.dist}/${paths.fileName}`, () => {
    setHtml();
  });


  // 样式文件
  let cssUrl = `${inputPath.styles}/*.scss`;
  gulpWatch(cssUrl, (file) => {
    let filePath = _.get(file, 'history');
    if (!_.isEmpty(filePath)) {
      let fileName = filePath[filePath.length - 1].replace(/\\/gi, '/');
      let path = fileName.match(/src(\S*)\//)[1];

      setStyles(fileName, path);
    }
  });


  // js文件
  let jsUrl = `${inputPath.scripts}/*.js`;
  gulpWatch(jsUrl, (file) => {
    let filePath = _.get(file, 'history');
    if (!_.isEmpty(filePath)) {
      let fileName = filePath[filePath.length - 1].replace(/\\/gi, '/');
      let path = fileName.match(/src(\S*)\//)[1];

      setScript(fileName, path);
    }
  });

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

  gulp.src(`${paths.common}/scripts/*.js`)
  .pipe(babel())                                                    //- 编译ES6
  .pipe(hash())                                                     //- 文件名加MD5后缀
  .pipe(getVersion(rename({suffix: '.min'})))                       //- master环境改名
  .pipe(getVersion(uglify()))                                       //- master环境压缩
  .pipe(gulp.dest(`${outputPath.scripts}/libs/`))                   //- 输出编译后的JS文件

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
    .pipe(hash())
    .pipe(gulp.dest(`${outputPath.images}/_sprites/`))
    .pipe(hash.manifest(`${paths.fileName}`))
    .pipe(gulp.dest(`${paths.dist}`));

    gulp.src([`${inputPath.images}/*.png`, `${inputPath.images}/*.jpg`])
    .pipe(hash())
    .pipe(gulp.dest(`${outputPath.images}`))
    .pipe(hash.manifest(`${paths.fileName}`))
    .pipe(gulp.dest(`${paths.dist}`));

});


/**
 * 删除当前项目历史文件
 */

gulp.task('del', (cb) => {
  if (_.isEmpty(options.name)) {console.log(proTips); return false;};
  return del([`${paths.dist}`, `${paths.dist}/${paths.fileName}`], {force: true}, cb);
  // del([`${inputPath.styles}/components/assets`], {force: true});
});


/**
 * 默认任务
 */
gulp.task('default', gulpSequence('del', 'move', 'watchStyles'));