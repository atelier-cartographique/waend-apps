
const { resolve } = require('path');
const { readdirSync } = require('fs');
const webpack = require('webpack');

// const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
// const ExtractTextPlugin = require("extract-text-webpack-plugin");


const ROOT = resolve(__dirname);
// const BUNDLE_ENTRY_PATH = resolve(ROOT, 'js/dashboard/src/index.js');
const BUNDLE_ENTRY_PATH = resolve(ROOT, 'src/index.ts');
const WAEND_ALIAS_ROOT = resolve(ROOT, '../waend/');
const OUTPUT_DIR = resolve(ROOT, 'dist');

console.log(`ROOT ${ROOT}`);
console.log(`BUNDLE_ENTRY_PATH ${BUNDLE_ENTRY_PATH}`);
console.log(`OUTPUT_DIR ${OUTPUT_DIR}`);
console.log(`WAEND_ALIAS_ROOT ${WAEND_ALIAS_ROOT}`);



const WAEND_ALIAS = readdirSync(WAEND_ALIAS_ROOT).reduce((acc, dir) => {
    acc[`waend/${dir}`] = resolve(WAEND_ALIAS_ROOT, dir);
    console.log(`"waend/${dir}" : "${acc[`waend/${dir}`]}"`);
    return acc;
}, {})

module.exports = {
    context: ROOT,
    entry: {
        bundle: BUNDLE_ENTRY_PATH,
    },

    output: {
        path: OUTPUT_DIR,
        publicPath: '/',
        filename: '[name].js',
        chunkFilename: '[id].[hash].chunk.js'
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
            }
        ]
    },
    // plugins: [
    //     new webpack.optimize.UglifyJsPlugin(),
    // ]
    devtool: 'inline-source-map',
};


