const webpack = require('webpack');
const path = require('path');

const BUILD_DIR = path.resolve(path.join(__dirname, 'lib'));
const APP_DIR = path.resolve(path.join(__dirname, 'src'));
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

const libraryName = 'scroll-spy';
let plugins = [], outputFile;

if (process.env.NODE_ENV === 'production') {
  plugins.push(new UglifyJsPlugin({minimize: true}));
  outputFile = libraryName + '.min.js';
} else {
  outputFile = libraryName + '.js';
}

const config = {
  devtool: 'source-map',
  entry: path.join(APP_DIR + '/scroll-spy.js'),
  output: {
	path: BUILD_DIR,
	filename: 'scroll-spy.js',
	library: 'scroll-spy',
	libraryTarget: 'umd'
  },
  module: {
	loaders: [
	  {
		test: /\.js$/,
		loaders: ['babel-loader'],
		exclude: /node_modules/
	  }
	]
  },
  resolve: {
	alias: {
	  angular: path.resolve(path.join(__dirname, 'node_modules', 'angular'))
	}
  },
  plugins: plugins
};

module.exports = config;
