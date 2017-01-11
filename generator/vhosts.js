import 'colors';

import _                    from 'lodash';
import fs                   from 'fs-extra';
import path                 from 'path';
import handlebars           from 'handlebars';
import {LOG_PATH, MODULES}  from '../conf/nginx'


handlebars.registerHelper('compare', function (lvalue, operator, rvalue, options) {
  let operators;
  let result;

  if (3 > arguments.length) {
    throw new Error('Handlerbars Helper "compare" needs 2 parameters');
  }

  if (undefined === options) {
    options  = rvalue;
    rvalue   = operator;
    operator = '===';
  }

  operators = {
    '==' (l, r) {
      return l == r;
    },
    '===' (l, r) {
      return l === r;
    },
    '!=' (l, r) {
      return l != r;
    },
    '!==' (l, r) {
      return l !== r;
    },
    '<' (l, r) {
      return l < r;
    },
    '>' (l, r) {
      return l > r;
    },
    '<=' (l, r) {
      return l <= r;
    },
    '>=' (l, r) {
      return l >= r;
    },
    'typeof' (l, r) {
      return typeof l == r;
    },
  };

  if (!operators[operator]) {
    throw new Error(`Handlerbars Helper 'compare' doesn't know the operator ${operator}`);
  }

  result = operators[operator](lvalue, rvalue);
  return result ? options.fn(this) : options.inverse(this);
});

handlebars.registerHelper('domain', function (value) {
  if (_.isString(value)) {
    return value;
  }

  if (_.isArray(value)) {
    return value.join(' ');
  }
});

const ROOT_PATH   = path.join(__dirname, '../');

const TMPL_FILE   = path.join(ROOT_PATH, 'generator/templates/vhosts/nginx.conf.hbs');
const OUTPUT_FILE = path.join(ROOT_PATH, 'vhosts/nginx.conf');

let template = fs.readFileSync(TMPL_FILE, 'utf-8');
let fn       = handlebars.compile(template);

let exists = [];
let datas  = MODULES
.filter((row) => {
  if (-1 !== _.indexOf(exists, row.domain)) {
    console.error(`Module ${row.domain} is already exists.`.red);
    return false;
  }

  if (!_.isString(row.domain) && !_.isArray(row.domain)) {
    console.error('Module domain must be a string or array'.red);
    return false;
  }

  if ('proxy' === row.type) {
    if (!(_.isArray(row.entries) && row.entries.length > 0)) {
      console.error('Entries must be a array, and size not less than 1.'.red);
      return false;
    }

    if (!(_.isString(row.proxy) && /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.exec(row.proxy))) {
      console.warn('Proxy is requied, and must be proxy ip address. it would auto set proxy to 127.0.0.1'.yellow);
      row.proxy = '127.0.0.1';
    }

    if (!_.isNumber(row.proxyPort)) {
      console.warn('Proxy port is requied, and must be a number it would auto set proxy port to 3030'.yellow);
      row.proxyPort = 3030;
    }
  }

  if (_.isArray(row.domain)) {
    _.forEach(row.domain, function (domain) {
      console.log(`Server config ${domain} is ok.\n`.green);
    });
  }
  else {
    console.log(`Server config ${row.domain} is ok.\n`.green);
  }

  exists.push(row.domain);
  return true;
})
.map((row) => {
  if (_.isArray(row.entries)) {
    return Object.assign({}, row, {
      division: row.entries.join('|'),
    });
  }

  return row;
});

let logsDir = path.join(ROOT_PATH, LOG_PATH);
fs.ensureDirSync(logsDir);

let source = fn({
  logsDir   : logsDir,
  modules   : datas,
});

fs.ensureDir(OUTPUT_FILE.replace(path.basename(OUTPUT_FILE), ''));
fs.writeFileSync(OUTPUT_FILE, source);

console.log(`Nginx config file ${OUTPUT_FILE} is generated successfully`.green);
console.log('Remember reload/restart yr nginx server.'.yellow);
