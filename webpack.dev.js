const path = require("path");

const {merge} = require("webpack-merge");
const baseConf = require("./webpack.config");

module.exports = merge(baseConf, {
    mode: "development",
    devServer: {
        contentBase: path.resolve(__dirname, 'out'),
        watchContentBase: true,
    }
});