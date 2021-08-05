const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    entry: {
        content: {
          import: "./src/contentScript/content.tsx"
        },
        action: {
          import: "./src/action/action.tsx"
        }
    },
    output: {
        path: path.resolve(__dirname, "out"),
        filename: "[name].js"
    },
    resolve: {
      extensions: [".js", ".ts", ".tsx"]
    },
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin({
        extractComments: false,
      })],
    },
    module: {
        rules: [
          {
            test: /(.tsx|.ts)$/,
            exclude: /(node_modules)/,
            use: [{
              loader: "babel-loader",
              options: {
                presets: ["@babel/preset-react"]
              }
            },
            {
             loader: "ts-loader"
            }]
          },
          {
            test: /.css$/,
            use: ["style-loader", "css-loader"]
          }
        ]
      }
};
