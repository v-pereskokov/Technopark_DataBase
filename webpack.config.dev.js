module.exports = {
  entry: [
    'babel-polyfill',
    './src/index.js'
  ],

  output: {
    filename: 'built/bundle.js'
  },

  devtool: 'sourcemap',

  module: {
    loaders: [{
      test: /\.js?$/,
      exclude: /(node_modules)/,
      loader: 'babel-loader'
    }]
  }
};
