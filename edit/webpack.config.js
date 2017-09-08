
const { resolve } = require('path');
const { readdirSync } = require('fs');
const webpack = require('webpack');

// const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const ExtractTextPlugin = require("extract-text-webpack-plugin");


const ROOT = resolve(__dirname);
const BUNDLE_ENTRY_PATH = resolve(ROOT, 'src/index.ts');
const STYLE_ENTRY_PATH = resolve(ROOT, 'style/style.js');
const WAEND_ALIAS_ROOT = resolve(ROOT, '../waend/');
const OUTPUT_DIR = resolve(ROOT, 'dist');

console.log(`ROOT ${ROOT}`);
console.log(`BUNDLE_ENTRY_PATH ${BUNDLE_ENTRY_PATH}`);
console.log(`STYLE_ENTRY_PATH ${STYLE_ENTRY_PATH}`);
console.log(`OUTPUT_DIR ${OUTPUT_DIR}`);
console.log(`WAEND_ALIAS_ROOT ${WAEND_ALIAS_ROOT}`);



const WAEND_ALIAS = readdirSync(WAEND_ALIAS_ROOT).reduce((acc, dir) => {
    acc[`waend/${dir}`] = resolve(WAEND_ALIAS_ROOT, dir);
    // console.log(`"waend/${dir}" : "${acc[`waend/${dir}`]}"`);
    return acc;
}, {})

module.exports = {
    context: ROOT,
    entry: {
        bundle: BUNDLE_ENTRY_PATH,
        style: STYLE_ENTRY_PATH,
    },

    output: {
        path: OUTPUT_DIR,
        publicPath: '/',
        filename: '[name].js',
        chunkFilename: '[id].[hash].chunk.js',
        library: 'bundle',
        libraryExport: 'main',
        libraryTarget: 'var',
    },

    resolve: {
        alias: WAEND_ALIAS,
        // proj4 module declaration is not consistent with its ditribution
        mainFields: ["browser", "main", /* "module" */],
        extensions: ['.ts', '.js'],
    },

    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader',
            },
            {
                enforce: 'pre',
                test: /\.ts$/,
                use: "source-map-loader"
            },
            {
                test: /\.ts$/,
                loaders: [
                    {
                        loader: 'babel-loader',
                    },
                    {
                        loader: 'ts-loader',
                    }
                ],
            },


            /**
             * Style
             */
            // CSS
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            },

            // LESS
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader!less-loader"
                })
            },

            //fonts
            {
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                loader: 'file-loader',
                options: {
                    // publicPath: '/client/assets/edit/'
                }
            },

            //images
            {
                test: /\.(jpg|png|svg)$/,
                loader: 'file-loader',
                options: {
                    // publicPath: '/client/assets/edit/'
                }
            }
        ]
    },
    // plugins: [
    //     new webpack.optimize.UglifyJsPlugin(),
    // ]
    plugins: [
        new ExtractTextPlugin("[name].css"),
    ],
    devtool: 'inline-source-map',
};


