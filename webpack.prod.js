const {merge} = require("webpack-merge")
const baseConf = require("./webpack.config");

module.exports = merge(baseConf, {
    mode: "production"
});