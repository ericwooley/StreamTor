require('babel/register');

module.exports = [
  require('./webpack-config')({
    server: true,
    devserver: true
  })
];
