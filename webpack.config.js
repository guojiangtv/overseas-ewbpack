const path = require('path');
const webpack = require('webpack');
const HappyPack = require('happypack');
const glob = require('glob');//路径模式匹配模块glob
const fs = require('fs');
const chalk = require('chalk');
const os = require('os');
const HappyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length});
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const htmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HashedChunkIdsPlugin = require('./config/hashedChunkIdsPlugin.js');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const HtmlWebpackIncludeJsPlugin = require('./config/htmlWebpackIncludeJsPlugin.js');
const CleanWebpackPlugin = require('clean-webpack-plugin');



//是否是生产环境
let prod = process.env.NODE_ENV === 'production' ? true : false;
//是否是pc编译
let isPc = process.env.PLATFORM == 'pc' ? true : false;
//是否是越南版编译
let isVn = process.env.COUNTRY == 'vietnam' ? true : false;

//webpack配置
let postcssConfigDir = './config/postcss.config.js';
let resolveConfigDir = './config/resolve.config.js';


//忽略不必要编译的文件
let entryIgnore = require('./entryignore.json');
let baseEntryDir,entryDir,outputDir,outputPublicDir,basePageEntry,basePageOutput,cleanDir,cleanOptions,dll_manifest_name,browserSyncBaseDir,entryFile,entries={},inlineSource,basePath='./national-overseas/';

if(isPc){
    //pc版目录配置
    console.log('***********************PC编译*************************');
    baseEntryDir = basePath+ 'src/v2/pc/';
    entryDir = baseEntryDir + '**/*.js';
    outputDir = path.resolve(__dirname, basePath+ 'dist/v2/pc/');
    outputPublicDir = '//static.cblive.tv/dist/v2/pc/';
    basePageEntry = basePath+ 'html/src/pc/';
    basePageOutput = browserSyncBaseDir =basePath+ 'html/dist/pc/';
    //clean folder
    cleanDir = [
        path.resolve(__dirname,  basePath+'dist/v2/pc/js'),
        path.resolve(__dirname,  basePath+'dist/v2/pc/css'),
    ];
    inlineSource = [
        `${baseEntryDir}js/components/monitor/globalMonitor.js`
    ];
    dll_manifest_name = 'dll_pc_manifest';
    //入口js文件配置以及公共模块配置
}else if(isVn){
    console.log('***********************越南版编译*************************');
    baseEntryDir = basePath+ 'src/vietnam/mobile/';
    entryDir = baseEntryDir + 'js/**/*.js';
    outputDir = path.resolve(__dirname, basePath+ 'dist/vietnam/mobile/');
    outputPublicDir = '//static.joylive.tv/dist/vietnam/mobile/';
    basePageEntry = basePath+ 'html/src/vietnam/mobile/';
    basePageOutput = basePath+ 'html/dist/vietnam/mobile/';
    browserSyncBaseDir = basePath + 'html/dist/'
    //clean folder
    cleanDir = [
        path.resolve(__dirname,  basePath+'dist/vietnam/mobile/css'),
        path.resolve(__dirname,  basePath+'dist/vietnam/mobile/js')
    ];
    inlineSource = [
        `${baseEntryDir}js/components/flexible.js`,
        `${baseEntryDir}js/components/monitor/globalMonitor.js`
    ];
    dll_manifest_name = 'dll_vn_manifest';
    //入口js文件配置以及公共模块配置
}else{
    //触屏版目录配置
    console.log('***********************触屏版编译*************************');
    baseEntryDir = basePath+ 'src/v2/mobile/';
    entryDir = baseEntryDir + 'js/**/*.*';
    outputDir = path.resolve(__dirname, basePath+ 'dist/v2/mobile/');
    outputPublicDir = '//static.joylive.tv/dist/v2/mobile/';
    basePageEntry = basePath+ 'html/src/mobile/';
    basePageOutput = browserSyncBaseDir =basePath+ 'html/dist/mobile/';
    //clean folder
    cleanDir = [
        path.resolve(__dirname,  basePath+'dist/v2/mobile/css'),
        path.resolve(__dirname,  basePath+'dist/v2/mobile/js'),
    ];
    inlineSource = [
        `${baseEntryDir}js/components/flexible.js`,
        `${baseEntryDir}js/components/monitor/globalMonitor.js`
    ];
    dll_manifest_name = 'dll_manifest';
}
cleanOptions={
    root:outputDir,
    exclude:[
        'lib'
    ]
};
//入口js文件配置以及公共模块配置
entries = entryFile ? baseEntryDir+'js/'+ entryFile+'.js' : getEntry(entryDir)
entries.manifest = ['service']


console.log(entries);

module.exports = {
    cache: true,
    resolve: require(resolveConfigDir),
    entry: entries,
    output: {
        path: outputDir,
        publicPath: outputPublicDir,
        filename: "js/[name].[chunkhash:8].js",
        chunkFilename: 'js/[name]-chunk.[chunkhash:8].js'
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                enforce: "pre",
                loader: "tslint-loader",
                options: { fix: true }
            },
            {
                test: /\.ts?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
                options: {
                    appendTsSuffixTo: [/\.vue$/]
                }
            },
            {
                test: /\.vue$/,
                loader: "vue-loader",
                options: {
                    postcss: [require(postcssConfigDir)]
                }
            },
            {
                test: /\.ejs$/,
                use: "happypack/loader?id=ejs"
            },
            {
                test: /\.js$/,
                enforce: "pre",
                use: "happypack/loader?id=js",
                include: path.resolve(__dirname, entryDir),
                exclude: [baseEntryDir + "js/lib", baseEntryDir + "js/components"]
            },
            {
                test: /\.js$/,
                use: "happypack/loader?id=babel",
                exclude: [
                    "node_modules",
                    baseEntryDir + "js/lib",
                    baseEntryDir + "js/components"
                ]
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader", "postcss-loader"]
            },
            {
                test: /\.less$/,
                use: ExtractTextPlugin.extract([
                    "css-loader",
                    "postcss-loader",
                    "less-loader"
                ])
            },
            {
                test: /\.(png|jpg|gif)$/,
                loader: "url-loader",
                options: {
                    limit: 5120,
                    name: function(p) {
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
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
                loader: "file-loader"
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader",
                        options: {
                            minimize: true
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new HappyPack({
            id: "ejs",
            threadPool: HappyThreadPool,
            loaders: ["ejs-loader"]
        }),
        new HappyPack({
            id: "js",
            threadPool: HappyThreadPool,
            loaders: [
                {
                    loader: "eslint-loader",
                    options: {
                        fix: true
                    }
                }
            ]
        }),
        new HappyPack({
            id: "babel",
            threadPool: HappyThreadPool,
            loaders: ["babel-loader?cacheDirectory=true"]
        }),
        //浏览器同步刷新
        new BrowserSyncPlugin({
            host:'http://localhost',
            port: 9000,
            server: { baseDir: [browserSyncBaseDir] }
        }),
        new HashedChunkIdsPlugin(),
        new webpack.HashedModuleIdsPlugin(),
        new webpack.DllReferencePlugin({
            // 指定一个路径作为上下文环境，需要与DllPlugin的context参数保持一致，建议统一设置为项目根目录
            context: __dirname,
            // 指定manifest.json
            manifest: require("./manifest/" + dll_manifest_name + ".json"),
            // 当前Dll的所有内容都会存放在这个参数指定变量名的一个全局变量下，注意与DllPlugin的name参数保持一致
            name: "dll_library"
        }),

        new ExtractTextPlugin("css/[name].[contenthash:8].css"),
        new webpack.LoaderOptionsPlugin({
            options: {
                postcss: require(postcssConfigDir)
            }
        }),

        // 提取公共模块
        new webpack.optimize.CommonsChunkPlugin({
            name:'manifest',
            chunks: 'manifest',
            minChunks: Infinity //公共模块最小被引用的次数
        }),
        new HtmlWebpackIncludeAssetsPlugin({
            assets: [getLatestFile('js/lib/dll.js')],
            append: false
        }),
        new HtmlWebpackIncludeJsPlugin({
            js: [{
                path: inlineSource,
                inject: 'inline' // 插入方式，内联
            }]
        })
    ]
};
function getLatestFile (path) {
    let newPath = path.replace(/\./g, '.**.')
    let latestFile = ''
    let latestFileMtime = 0

    glob.sync(outputDir + '/' + newPath).forEach(function (file) {
        let fileInfo = fs.statSync(file)
        let fileMtime = +new Date(fileInfo.mtime)

        latestFile = fileMtime > latestFileMtime ? file : latestFile
        latestFileMtime = fileMtime > latestFileMtime ? fileMtime : latestFileMtime
    })
    return latestFile.replace(/^.*\/(js\/|css\/)/ig, '$1')
}

/***** 生成组合后的html *****/
var pages = entryFile? basePageEntry+entryFile+'.ejs':getEntry(basePageEntry + '**/*.ejs');
for (var pathname in pages) {
    var conf = {
        // html模板文件输入路径
        template: path.resolve(__dirname, basePageEntry + pathname + '.js'),
        // html文件输出路径
        filename: path.resolve(__dirname, basePageOutput + pathname + '.html'),
        inject: true,
        cache: true, //只改动变动的文件
        minify: {
            removeComments: true,
            collapseWhitespace: false
        }
    };
    //根据chunks提取页面js,css和公共verdors
    if (pathname in module.exports.entry) {
        conf.chunks = [pathname,'manifest'];
    }

    module.exports.plugins.push(new htmlWebpackPlugin(conf));
}


/**
 * [获取文件列表(仅支持js和ejs文件)：输出正确的js和html路径]
 * @param  {[type]} globPath [description]
 * @return {[type]}          [description]
 */
function getEntry(globPath) {
    let entries = {}
    glob.sync(globPath).forEach(function(entry) {
        //排出相关入口文件
        if(entry.indexOf('layouts') == -1 && entry.indexOf('lib') == -1 && entry.indexOf('common') == -1 && entry.indexOf('components') == -1 && entry.indexOf('.vue') == -1 && entry.indexOf('d.ts') == -1){
            //判断是js文件还是ejs文件
            let isEjsFile = entry.indexOf('.ejs') !== -1;
            let dirArr = isEjsFile ?
            entry.split(basePageEntry)[1].split('.ejs')[0]:
            entry.split('/js/')[1].split('.')[0] ;
            // 排除忽略列表中的文件
            if (entryIgnore.indexOf(dirArr) == -1) {
                entries[dirArr] = entry;
            }

        }
    });

    return entries;
}

/***** 区分开发环境和生产环境 *****/

if (prod) {
    console.log(chalk.red('当前编译环境：production'));
    module.exports.plugins = module.exports.plugins.concat([
        new CleanWebpackPlugin(cleanDir, cleanOptions),
        //压缩css代码
        new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.css\.*(?!.*map)/g, //注意不要写成 /\.css$/g
            cssProcessor: require('cssnano'),
            cssProcessorOptions: {
                discardComments: { removeAll: true },
                // 避免 cssnano 重新计算 z-index
                safe: true,
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
    let file = './entry.txt'
    fs.access(file, (err) => {
        if(err){
            console.log(chalk.red('编译入口文件不存在，将执行全部文件编译。'))
            return false
        }
        fs.readFile(file,function(err,data){
            if(err){
                console.log('read error',err)
                return false
            }
            if(data.toString()){//将buffer对象转换为字符串
                console.log(chalk.yellow('编译文件目录为：'+data.toString()))
            } else{
                console.log(chalk.red('执行全部文件编译'))
            }
        })
    });
    module.exports.devtool = 'inline-source-map';
}
