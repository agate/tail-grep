const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  devtool: 'source-map',
  entry: './src/client/index.js',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.(scss|sass|css)$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: 'file-loader?name=[name].[ext]',
        exclude: /node_modules/,
      },
      {
        test: /\.(pug|jade)$/,
        use: [ 'raw-loader', 'pug-html-loader' ],
        exclude: /node_modules/,
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.json', '.css', '.scss', '.sass']
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: '../analysis/analysis.html',
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/client/index.pug'),
      hash: true,
      inject: true
    }),
  ],
  devServer: {
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true
      }
    }
  }
}
