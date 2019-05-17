### eslint对vue组件的监视及自动修改设置
在vscode的setting.json文件中添加以下内容
```
"eslint.autoFixOnSave": true,
"eslint.validate": [
    "javascript",{
        "language": "vue",
        "autoFix": true
    },
    "html",
    "vue"
],
```
### 海外版前端自动化编译构建工具使用说明
此工具仅适用于海外前后端分离项目，之前的php项目仍就采用之前的gulp编译并手动发布  
此项目采用非覆盖式编译，公共js文件打包成一个dll.js，common.js采用ES6 Module形式，项目中用到哪个方法直接import 引入该方法即可
```js
import {showLoading} from 'common'
```
项目中已引入typescript编译，可参考累充活动cumulativeRecharge  

git clone此项目后  
yarn install安装必要的项目依赖和开发依赖包  

主项目文件在海外gitlab上，需要配置host 107.150.99.209 gitlab.cblive.tv  
访问地址https://gitlab.cblive.tv   
git clone git@gitlab.cblive.tv:root/national-overseas.git

主项目文件下载完后 先建立自己的开发分支 feature/***  在自己的分支上开发

发测试和线上同国内项目相同

### 注意点
在ejs文件中直接引入图片时，需用require形式
```
<img src='${require("../../../../src/v2/mobile/img/recharge/index/Telkomsel.png")}' alt="">
```

建议在overseas-webpack文件夹下建立trunk文件夹并拉取已下svn地址 ，用于查看提交文件列表  
html文件夹        https://10.0.0.15/svn/develop/website/trunk/cblive/web/html  
static_cblive    https://10.0.0.15/svn/develop/website/trunk/static_cblive

#### mobile端编译命令
yarn dll    打包公共文件生成dll.js  
yarn watch  开发编译，监测文件变化  
yarn build  打包  
yarn deploy 压缩打包  
#### 越南版mobile端编译命令  都加上vn_前缀
yarn vn_dll
#### 中东版mobile端编译命令  都加上arb_前缀
yarn arb_dll
#### pc端编译命令 都加上pc_前缀
yarn pc_dll

#### yeoman工具使用方法
yeoman已集成到项目脚手架中
执行`yarn new`命令可启动yeoman，填写英文名称，项目名称，项目标题，选择项目模板pc或mobile，即可自动生成相应的文件

#### 海外项目中mockjs使用方法
在前后端分离开发模式下，为了方便前端自己模拟数据，引入mockjs库，目前已在项目脚手架中安装。

#### mockjs使用方法

*  在mock文件夹中新建js文件，文件中需引入mockjs
*  编辑文件
```js
import Mock from 'mockjs';

Mock.mock('/worldcup/userrank', {
    'errno': 0,
    'msg': '',
    'data|10':[
        {
            'uid|+1'      : 123,
            'nickname' : 'ruby',
            'headPic'  : 'http://fpoimg.com/200x200',
            'rank'     : 1,     //用户排名
            'points|+1'   : 1000,   //用户积分
            'isFollow|0-1' : 1       //0:未关注 1:已关注
        }
    ]
});
```
Mock能自动拦截页面js中发出的ajax请求，并将模拟的数据作为请求结果返回  
至于如何模拟自己想要的数据可参考[语法规范](https://github.com/nuysoft/Mock/wiki/Syntax-Specification)

*  在项目js文件中引入自己模拟的数据文件
```js
//mock数据
import '../../../../../mock/worldcup.js';
```
当本地开发完要发测试时需在项目js文件中注释掉引入的模拟数据文件
