//引入插件
var gulp     = require('gulp'),
cleanCss     = require('gulp-clean-css'),
uglify       = require('gulp-uglify'),
less         = require('gulp-less'),
plumber      = require('gulp-plumber'), // less报错时不退出watch
clean        = require('gulp-clean'),
fs           = require('fs'), //获取真实路径
runSequence  = require('run-sequence'),
rev          = require('gulp-rev-params'),
revCollector = require('gulp-rev-collector-params'),
gulpif       = require('gulp-if'),
changed      = require('gulp-changed'),
debug        = require('gulp-debug'),
postcss      = require('gulp-postcss'),
autoprefixer = require('autoprefixer'),
sourcemaps   = require('gulp-sourcemaps');

// 任务处理的文件路径配置
var m_src = {
        js: fs.realpathSync('./national-overseas/src/mobile/js') + '/**/*.js',
        css: fs.realpathSync('./national-overseas/src/mobile/css') + '/**/*',
        img: './national-overseas/src/mobile/img/**',
        base: './national-overseas/src/mobile/'
    },
    m_dist = {
        jscss: [
            fs.realpathSync('./national-overseas/dist/mobile/js') + '/**/*.js',
            fs.realpathSync('./national-overseas/dist/mobile/css') + '/**/*.css'
        ]
    },
    m_output = './national-overseas/dist/mobile';

//定义句柄状态为未发布
var isRelease = false;

/******************************** mobile ****************************/

//清除dist目录中的js和css文件 不常用
gulp.task('clean', function() {
    return gulp.src(m_dist.jscss, { read: false })
        .pipe(clean({ force: true }));
})

//处理js 压缩 混淆 添加版本号
gulp.task('scripts', function() {
    return gulp.src(m_src.js, { base: m_src.base })
        .pipe(gulpif(!isRelease, changed(m_output)))
        .pipe(gulpif(isRelease, sourcemaps.init()))
        .pipe(gulpif(isRelease, uglify()))
        .on('error', errorHandler)
        .pipe(gulpif(isRelease, rev()))
        .pipe(debug({ title: 'js:' }))
        .pipe(gulpif(isRelease, sourcemaps.write('./maps')))
        .pipe(gulp.dest(m_output))
        .pipe(gulpif(isRelease, rev.manifest()))
        .pipe(gulpif(isRelease, gulp.dest('./rev/mobile/js/')));
});

gulp.task('less', function() {
    return gulp.src(m_src.css, { base: m_src.base })
        .pipe(gulpif(!isRelease, changed(m_output, {extension: '.css'})))
        .pipe(sourcemaps.init())
        .pipe(less()).on('error', errorHandler)
        .pipe(sourcemaps.write())
        .pipe(plumber())
        .pipe(postcss([autoprefixer()]))
        .pipe(gulpif(isRelease, cleanCss()))
        .pipe(gulpif(isRelease, rev()))
        .pipe(debug({ title: 'css:' }))
        .pipe(gulp.dest(m_output))
        .pipe(gulpif(isRelease, rev.manifest()))
        .pipe(gulpif(isRelease, gulp.dest('./rev/mobile/css/')));
});

gulp.task('images', function() {
    return gulp.src(m_src.img, { base: m_src.base })
        .pipe(gulpif(!isRelease, changed(m_output)))
        .pipe(gulpif(isRelease, rev()))
        // .pipe(tiny())
        .pipe(gulp.dest(m_output))
        .pipe(gulpif(isRelease, rev.manifest()))
        .pipe(gulpif(isRelease,gulp.dest('./rev/mobile/img/')));
});

gulp.task('rev', function() {
    //为php模板添加版本号
    gulp.src(['./rev/mobile/**/*.json', '../../cblive/web/protected/modules/mobile/views/**/*.php'])
        .pipe(revCollector({replaceReved: true}))
        .pipe(gulp.dest(fs.realpathSync('../../cblive/web/protected/modules/mobile/views/')));
    //为css中图片添加版本号
    gulp.src(['./rev/mobile/img/*.json', './national-overseas/dist/mobile/css/*'])
        .pipe(revCollector({replaceReved: true}))
        .pipe(gulp.dest(fs.realpathSync('./national-overseas/dist/mobile/css/')));
    //为js中图片添加版本号
    gulp.src(['./rev/mobile/img/*.json', './national-overseas/dist/mobile/js/*'])
        .pipe(revCollector({replaceReved: true}))
        .pipe(gulp.dest(fs.realpathSync('./national-overseas/dist/mobile/js/')));
});


// 测试以及线上环境 ,每次发布的时候会对所有的文件添加新版本号
gulp.task('release', function() {
    //更改句柄为发布状态
    isRelease = true;
    return runSequence(
        ['images', 'less', 'scripts'], ['rev']
    );
});

//本地开发环境
gulp.task('dev', function() {
    return runSequence(
        ['images', 'less', 'scripts'],
        function() {
            var less_watcher = gulp.watch(m_src.css, ['less']);
            less_watcher.on('change', function(event) {
                console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
            })
            var js_watcher = gulp.watch(m_src.js, ['scripts']);
            js_watcher.on('change', function(event) {
                console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
            })
        }
    );
});

//默认执行gulp dev命令
gulp.task('default', ['dev'])



/*错误处理*/
function errorHandler(error) {
    console.log(error.toString());
    this.emit('end');
}
