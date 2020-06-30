const webpack = require("webpack"); // eslint-disable-line no-unused-vars
const path = require("path");
const fs = require('fs-extra');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');

function getFoundryConfig() {
    const configPath = path.resolve(process.cwd(), 'foundryconfig.json');
    let config;

    if (fs.existsSync(configPath)) {
        config = fs.readJSONSync(configPath);
    }
    return config;
}

module.exports = (env, argv) => {
    const config = {
        context: __dirname,
        entry: {
            main: "./src/conan2d20.ts",
        },
        mode: "none",
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: 'ts-loader',
                },
                {
                    test: /\.scss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader?url=false'
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true
                            }
                        }
                    ]
                }
            ],
        },
        plugins: [
            // new CleanWebpackPlugin(),
            new CopyWebpackPlugin([
                { from: 'static' },
                { from: 'system.json' }
            ], {
                writeToDisk: true
            }),
            new WriteFilePlugin(),
            new MiniCssExtractPlugin({
                filename: 'styles/conan2d20.css'
            })
        ],
        resolve: {
            extensions: ['.tsx', '.ts', '.js']
        },
        output: {
            path: path.join(__dirname, 'dist'),
            filename: "[name].bundle.js"
        }
    };

    const foundryConfig = getFoundryConfig();
    if (foundryConfig !== undefined)
        config.output.path = path.join(foundryConfig.dataPath, 'systems', foundryConfig.systemName);

    if (argv.mode === 'production') {
        console.log();
    } else {
        config.devtool = 'inline-source-map';
        config.watch = true;
    }

    return config;
};
