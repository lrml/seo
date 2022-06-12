const express = require('express')
const app = express()
const path = require('path')
const { MongoClient } = require("mongodb")



app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1')
    next()
})

//使用bodyParser中间件解析前台传过来的数据
//先不使用bodyParser中间件，使用req.on
// app.use(express.bodyParser())

// app.get('/seo', (req,res) => {
//     console.log('有seo请求')
// })

app.get('/seo/search', (req,res) => {
    //获取get请求所携带的数据，使用req.query
    //console.log(req.query.queryData)
    
    // mongoClient.connect('mongodb://localhost:27017', function(err, db){
    //     if(err){
    //         console.log(err)
    //     }else{
    //         seo = db.db('seo')
    //         seo.collection('fakeNews').find({}).toArray(function(err, result){
    //             if(err) throw err
                
    //             db.close()
    //         })
            
    //     }
    // })

    let url = 'mongodb://localhost:27017'
    let client = new MongoClient(url)

    async function getData(){
        try {
            //连接数据库
            await client.connect()
            const db = client.db('seo')
            const fakeNews = db.collection('fakeNews')

            //查询返回
            //此处使用or操作符，根据名称或者关键词进行查询
            return await fakeNews.find(
                {
                    $or:[
                        {"name": req.query.queryData}, {"keywords": req.query.queryData}
                    ]
                }
            ).toArray()
        } catch (error) {
            console.log('连接数据失败')
            await client.close()
        }
    }

    getData().then(result => {
        
        if(result.length > 0){
            res.send(result)
        }else{
            res.send({"status": 404})
        }
    }).catch(error => {
        console.log(error)
    })
})

//处理post请求时要使用app.post而不是get
app.post('/seo/add', (req,res) => {
    console.log('添加信息')

    //两种方法获取post过来的数据，res.on 和安装 bodyparser插件
    // req.on相应事件
    req.on('data', function(data){
        newInfo = JSON.parse(data).info
        async function writeData(){
            try {
                //连接数据库
                let url = 'mongodb://localhost:27017'
                let client = new MongoClient(url)
                await client.connect()
                const db = client.db('seo')
                const fakeNews = db.collection('fakeNews')
    
                //查询返回
                return await fakeNews.insertMany(newInfo)
            } catch (error) {
                console.log('连接数据失败')
                await client.close()
            }
        }
    
        writeData().then(result => {
            console.log(result)
            res.send({'status': 200})
        }).catch(error => {
            console.log(error)
        })
    })

})

app.listen(80)