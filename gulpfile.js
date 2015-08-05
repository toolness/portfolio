require('babel/register');

// This file is tiny because we want to be able to use ES6 in our gulpfile.
// So we'll delegate to...

require('./src/gulpfile');
