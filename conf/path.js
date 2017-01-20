
import path       from 'path';
import minimist   from  'minimist'          //- 命令行参数解析

export const ROOT_PATH = path.join(__dirname, '../');
export const MOVE_PATH = path.join(__dirname, './');

/**
 * [knownOptions description]     gulp task --env master
 * @type {Object}           默认环境develop
 * @options             命令行参数解析
 * @getVersion            master环境执行
 */

export const knownOptions = {
  string: 'env',
  default: { env: process.env.NODE_ENV || 'develop', name: '' }
};

export const options = minimist(process.argv.slice(2), knownOptions);
export const proTips = '请输入项目名（项目文件夹名）：gulp task --name proname';

/**
 * 主目录
 * @type {Object}   src构建目录，dest生成目录，JSON版本文件
 */
export const paths = {
  src       : `${ROOT_PATH}src/app/${options.name}`,
  dist      : `${ROOT_PATH}dist/${options.name}`,
  common    : `${ROOT_PATH}src/common/`,
  fileName  : 'version.json',
}

/**
 * 雪碧图路径
 */

export const sprite = {
  path    : `${ROOT_PATH}src/common/_sprite/template/`,
  output  : `${ROOT_PATH}dist/${options.name}/common/`,
}

/**
 * 构建文件目录
 * @type {Object}   图片、CSS、JS、替换文件
 */
export const inputPath = {
  images    :   `${paths.src}/assets/images`,
  styles    :   `${paths.src}/assets/styles`,
  scripts   :   `${paths.src}/assets/scripts`,
  sprites   :   `${paths.src}/assets/_sprites`,
  common    :   `${paths.src}/common`,
  files     :   `${paths.src}/components`,
}

/**
 * 编译目录
 * @type {Object}   图片、CSS、JS、输出替换文件
 */
export const outputPath = {
  images    :   `${paths.dist}/assets/images`,
  styles    :   `${paths.dist}/assets/styles`,
  scripts   :   `${paths.dist}/assets/scripts`,
  files     :   `${paths.dist}`,
}
