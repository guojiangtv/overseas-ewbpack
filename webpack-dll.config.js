const path = require('path');
const webpack = require('webpack');
const chalk = require('chalk')
const ExtractTextPlugin = require('extract-text-webpack-plugin'); //抽离css
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const HashedChunkIdsPlugin = require('./config/hashedChunkIdsPlugin.js')
const CleanWebpackPlugin = require('clean-webpack-plugin')


//是否是生产环境
const prod = process.env.NODE_ENV === 'production' ? true : false;
//是否是pc编译
const isPc = process.env.PLATFORM == 'pc' ? true : false;
//是否是越南版编译
let isVn = process.env.COUNTRY == 'vietnam' ? true : false;

//webpack配置
const postcssConfigDir = './config/postcss.config.js';
const resolveConfigDir = './config/resolve.config.js';
let baseEntryDir,outputDir,outputPublicDir,entries,dll_manifest_name,entryDir;
if(isPc){
    //PC目录配置
    baseEntryDir = './national-overseas/src/v2/pc/';
    entryDir = baseEntryDir + '**/*.js';
    outputDir = path.resolve(__dirname, './national-overseas/dist/v2/pc/');
    outputPublicDir = '//static.cblive.tv/dist/v2/pc/';
    entries = ['vue','axios','layer','jquery'];
    dll_manifest_name = 'dll_pc_manifest';
}else if(isVn){
    baseEntryDir = './national-overseas/src/vietnam/mobile/';
    entryDir = baseEntryDir + '**/*.js';
    outputDir = path.resolve(__dirname, './national-overseas/dist/vietnam/mobile/');
    outputPublicDir = '//static.cblive.tv/dist/v2/vietnam/mobile/';
    entries = ['vue', 'axios', 'layer'];
    dll_manifest_name = 'dll_vn_manifest';
}else{
    baseEntryDir = './national-overseas/src/v2/mobile/';
    entryDir = baseEntryDir + '**/*.*';
    outputDir = path.resolve(__dirname, './national-overseas/dist/v2/mobile/');
    outputPublicDir = '//static.cblive.tv/dist/v2/mobile/';
    entries = ['vue', 'axios', 'layer'];
    dll_manifest_name = 'dll_manifest';
}


module.exports = {
    /* 输入文件 */
    resolve: require(resolveConfigDir),
    entry: {
        dll: entries
    },
    output: {
        path: outputDir,
        publicPath: outputPublicDir,
        filename: 'js/lib/[name].[chunkhash:8].js',
        library: '[name]_library',
        /*libraryTarget: 'umd'*/
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    postcss: [require( postcssConfigDir )]
                }
            },
            {
                test: /\.js$/,
                enforce: 'pre',
                loader: 'eslint-loader',
                include: path.resolve(__dirname, entryDir),
                exclude: [baseEntryDir + 'js/lib', baseEntryDir + 'js/component'],
                options: {
                    fix: true
                }
            },
            {
                test: /\.js$/,
                loader: 'babel-loader?cacheDirectory=true',
                exclude: ['node_modules', baseEntryDir + 'js/lib', baseEntryDir + 'js/component']
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
                exclude: [baseEntryDir + 'css/lib']
            },
            {
                test: /\.less$/,
                use: ExtractTextPlugin.extract(['css-loader','postcss-loader','less-loader']),
            },
            {
                test: /\.(png|jpg|gif)$/,
                loader: 'url-loader',
                options: {
                    limit: 512,
                    name: function(p){
                        let tem_path
                        if (p.indexOf('/') != -1) {
                            // linux
                            tem_path = p.split(/\/img\//)[1]
                        } else {
                            // win
                            tem_path = p.split(/\\img\\/)[1]
                        }
                        tem_path = tem_path.replace(/\\/g, '/')

                        return 'img/' + tem_path + '?v=[hash:8]'
                    }
                }
            }
        ]
    },
    plugins: [
        // 清除lib内旧版本的库文件，防止后面插入html时错乱
        // 服务器时间的更改会导致文件创建时间不准确
        new CleanWebpackPlugin([
            'css/lib/dll.*.css',
            'css/lib/dll.*.css.map',
            'js/lib/dll.*.js',
            'js/lib/dll.*.js.map'
        ], {
            root: outputDir
        }),
        //keep module.id stable when vender modules does not change
        new HashedChunkIdsPlugin(),
        new webpack.HashedModuleIdsPlugin(),
        new webpack.DllPlugin({
            // 本Dll文件中各模块的索引，供DllReferencePlugin读取使用
            path: './manifest/'+ dll_manifest_name + '.json',
            //当前Dll的所有内容都会存放在这个参数指定变量名的一个全局变量下，注意与参数output.library保持一致
            name: '[name]_library',
            // 指定一个路径作为上下文环境，需要与DllReferencePlugin的context参数保持一致，建议统一设置为项目根目录
            context: __dirname,
        }),
        new ExtractTextPlugin('css/lib/[name].[contenthash:8].css'),
        new webpack.LoaderOptionsPlugin({
            options: {
                postcss: require(postcssConfigDir)
            },
        })

    ]
};


/***** 区分开发环境和生产环境 *****/

if (prod) {
    console.log(chalk.red('当前编译环境：production'));
    module.exports.plugins = module.exports.plugins.concat([
        // 压缩css代码
        new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.css\.*(?!.*map)/g, // 注意不要写成 /\.css$/g
            cssProcessor: require('cssnano'),
            cssProcessorOptions: {
                discardComments: {removeAll: true },
                // 避免 cssnano 重新计算 z-index
 				safe: true,
 				// cssnano通过移除注释、空白、重复规则、过时的浏览器前缀以及做出其他的优化来工作，一般能减少至少 50% 的大小
 				// cssnano 集成了autoprefixer的功能。会使用到autoprefixer进行无关前缀的清理。默认不兼容ios8，会去掉部分webkit前缀，比如flex
 				// 所以这里选择关闭，使用postcss的autoprefixer功能
 				autoprefixer: false
            },
            canPrint: true
        }),
        //压缩JS代码
        new UglifyJsPlugin({
            cache: true,
            parallel: true,
            uglifyOptions: {
                ie8: false,
                output: {
                    comments: false,
                    beautify: false,
                },
                compress: true,
                warnings: false
            }
        }),
    ]);
} else {
    console.log(chalk.red('当前编译环境：dev'));
    module.exports.devtool = 'cheap-module-source-map';

}
