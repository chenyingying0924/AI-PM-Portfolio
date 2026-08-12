const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV || 'production',
  entry: path.resolve(__dirname, 'src/index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
  },
  target: 'web',
  resolve: {
    modules: [
      path.resolve(__dirname, 'node_modules'),
      '/Users/chenyingying/node_modules',
    ],
    extensions: ['.js'],
  },
  devtool: 'source-map',
  performance: { hints: false },
};
