const webpackCommon = require("./webpack.common");
const path = require("path");

module.exports = {
  ...webpackCommon,
  devtool: "inline-source-map",
  mode: "development",
  devServer: {
    port: 3000,
  },
};
