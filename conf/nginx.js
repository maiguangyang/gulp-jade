

import path       from 'path';

export const LOG_PATH      = './logs';
export const MODULES       = [
  {
    type      : 'domain',
    dist      : path.join(__dirname, '../dist/nysn/'),
    domain    : 'www.test.com',
  },
];