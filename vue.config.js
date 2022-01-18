const path = require("path");
const webpack = require("webpack");
function resolve(dir) {
  return path.join(__dirname, dir);
}
module.exports = {
  lintOnSave: false,
  publicPath: "./",
  productionSourceMap: false,
  configureWebpack: {
    plugins: [

      new webpack.ProvidePlugin({
        $:"jquery",
        jQuery:"jquery",
        "windows.jQuery":"jquery",
        Popper: ['popper.js', 'default']

      })

    ],
    module: {
      unknownContextCritical: /^.\/.*$/,
      unknownContextCritical: false
    }
  },
  chainWebpack: config => {
    config.resolve.alias
      .set("@$", resolve("src"))
      .set("@utils", resolve("src/utils"))
      .set("@service", resolve("src/service"))
      .set("@assets", resolve("src/assets"))
      .set("@components", resolve("src/components"))
      .set("@views", resolve("src/views"))
      .set("@mixins", resolve("src/mixins"))
      .set("@layouts", resolve("src/layouts"));
  }
};
