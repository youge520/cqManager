//导入模块
const express = require('express');
//导入自己lib中的dbHelper
const dbHelper = require('./lib/dbHelper');
const multer  = require('multer')

const upload = multer({ dest: 'views/imgs/' })

const path = require('path')

var bodyParser = require('body-parser')
 

//实例化服务器
const app = express();

//托管静态资源
app.use(express.static('views'));

app.use(bodyParser.urlencoded({ extended: false }))

// 路由1 英雄列表 带分页  到查询
app.get('/heroList',(req,res) => {
    //接收数据
    const pagenum = req.query.pagenum;

    const pagesize = req.query.pagesize;
    const query = req.query.query;
    //获取所有数据
    dbHelper.find('cqlist', {} , result => {
        result = result.reverse();
        //检索出符合查询条件的数据
        const temArr = result.filter(v => {
            if(v.heroName.indexOf(query) != -1 || v.skillName.indexOf(query) != -1){
                return true;
            }
        })
        //返回的数据
        let list = [];
        //计算起始索引
        const startIndex = (pagenum - 1) * pagesize;
        //计算结束索引
        const endIndex = startIndex + pagesize;
        // 获取当前这一页的数据
        for(let i = startIndex;i< endIndex;i++){
            if(temArr[i]){
                list.push(temArr[i]);
            }
        }
        //获取总页数（向上取整）
        const totalPage = Math.ceil(temArr.length / pagesize);
        // 返回数据
        res.send({
            totalPage,
            list
        })
    })

})

//路由2  英雄详情
app.get('/heroDetail',(req,res) => {
    //获取id
    const id = req.query.id;
    // 根据id查询数据
    dbHelper.find('cqlist',{ _id: dbHelper.ObjectId(id) }, result => {
        //返回查询的数据
        res.send(result[0]);
    })
})

//路由3 英雄新增
app.post('/heroAdd', upload.single('heroIcon'), (req,res) => {
    //打印数据
    //获取数据
    
    const heroName = req.body.heroName;
    const skillName = req.body.skillName;
    // 图片本地地址 托管静态资源的时候 views已经设置 访问时不需要
    const heroIcon = path.join('imgs',req.file.filename);
    console.log(req.file);
    console.log(heroIcon);
    
    
    //保存到数据库中
    dbHelper.insertOne('cqlist',{
        heroName,
        heroIcon,
        skillName
    }, result => {
        res.send({
            msg: '新增成功',
            code: 200
        })
    })
})

//路由四  英雄修改
app.post('/heroUpdate', upload.single('heroIcon'), (req,res) => {
    //打印数据
    //获取数据
    const id = req.body.id;
    const heroName = req.body.heroName;
    const skillName = req.body.skillName;
    //修改的数据
    let updataData = {
        heroName,
        skillName
    }
    //判断是否有图片
    if(req.file){
        // 图片本地地址 托管静态资源的时候 views已经设置 访问时不需要
        const heroIcon = path.join('imgs',req.file.filename);
        updataData.heroIcon = heroIcon;
    }
    // res.send(req.file)
    //保存到数据库中
    dbHelper.updateOne('cqlist',{_id: dbHelper.ObjectId(id)},updataData, result => {
        res.send({
            msg: '修改成功',
            code: 200
        })
    })
})

//路由5 英雄删除
app.get('/heroDelete',(req,res) => {
    //获取id
    const id = req.query.id;
    //删除数据
    dbHelper.deleteOne('cqlist',{
        _id: dbHelper.ObjectId(id)
    }, result => {
        res.send({
            msg: '删除成功',
            code: 200
        })
    })
})

//路由 6 登录页面
app.post('/register',(req,res) => {
    //查询
    dbHelper.find('userlist',{
        username: req.body.username
    }, result => {
        //判断
        if(result.length === 0){
            //可以注册，保存
            dbHelper.updateOne('userlist',req.body , result => {
                req.send({
                    msg: '恭喜你注册成功',
                    code: 200
                })
            })
        }else{
            req.send({
                msg: '该账号已被注册，重新注册吧',
                code: 400
            })
        }
    })
})

//开启监听
app.listen(4396)