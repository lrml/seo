const submit = document.querySelector('#submit')

//提交表单
submit.onclick = function(){
    //获取搜索框数据
    let queryData = document.querySelector("input[name='searchStr']").value

    //创建Ajax请求
    let xhr = new XMLHttpRequest()

    //发送请求
    xhr.open('get', `http://localhost/seo/search?queryData=${queryData}`, true)
    xhr.send()

    //获取响应
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4 && xhr.status == 200){
            success(xhr.responseText)
        }
        if(xhr.readyState == 4 && xhr.status == 404 || xhr.status == 503){
            fail()
        }
    }

    function success(responseText){
        //服务器返回的数据是字符串，转化成数组
        let response = JSON.parse(responseText)

        //转化后是一个数组
        // console.log(Array.isArray(response))
        
        if(response.status){
            alert('没有找到数据')
            //添加页面出现，查询页面关闭
            addNew = document.getElementById('new')
            addNew.style.display = 'block'
            let result = document.getElementById('result') 
            const showResult = document.querySelectorAll('.description')
            if(result && showResult){
                result.style.display = 'none'
                for(let show of showResult){
                    show.style.display = 'none'
                }
            }
        }else{
            //先展示描述语句
            const showResult = document.querySelectorAll('.description')
            for(let show of showResult){
                show.style.display = 'flex'
            }

            //关闭添加页面
            const addNewInput = document.getElementById('new')
            addNewInput.style.display = 'none'
            
            //展示具体数据
            response.forEach(element => {
                let result = document.getElementById('result')
                //当有数据的时候页面就要出现，防止没有找到时将页面隐藏
                result.style.display = 'block'
                //使用Ajax请求不会刷新页面，因此当重复查询时已有的数据不会被清除，所以此处进行一下判断，如果有子元素则删除子元素
                if(result.childNodes.length > 0){
                    result.removeChild(result.firstElementChild)
                }
                let div = document.createElement('div')
                let a = document.createElement('a')
                let span = document.createElement('span')
                div.className = 'search-result'
                a.href = element.href
                a.innerHTML = element.name
                span.innerHTML = element.keywords
                div.appendChild(a)
                div.appendChild(span)
                result.appendChild(div)
            })
        }
        
    }

    function fail(){
        alert('服务器出现错误')
    }

}


//监听添加表单事项
//此处使用到事件委托，就是在增加表单的时候，不直接给子元素设置点击事件，而是将事件绑定到父元素身上，然后通过e.target进行判断

// const addInput = document.querySelectorAll('.add-input')
// addInput.forEach(element => {
//     element.addEventListener('click', function(){
//         const add = document.getElementById('new')
//         add.insertBefore(this.parentNode.cloneNode(true), add.lastElementChild)
//     }) 
// })

//上述使用传统的方法无法迭代给子元素绑定事件

const addNewInput = document.getElementById('new')
addNewInput.addEventListener('click', function(e){
    //判断节点名称
    //console.log(e.target.nodeName.toLowerCase())

    //使用html5的新特性 data- 来进行判断点击的button是哪一个
    //console.log(e.target.dataset.type)

    //补充data- 的知识
    /* 通过两种方式进行获取：
        - node.getAttribute('data-')
        - node.dataset.(横杠后面的东西，如果多个就是用驼峰命名法) 
    */
   let target = e.target

   //添加表单组件
   if(target.nodeName.toLowerCase() === 'button' && target.dataset.type === 'add'){
       //插入新行
        addNewInput.insertBefore(target.parentNode.cloneNode(true), addNewInput.lastElementChild)
        
        //设置新添加的节点的input值为空
        let inputList = target.parentNode.nextElementSibling.getElementsByTagName('input')
        //得到一个htmlCollection对象，遍历比较麻烦，转化为数组 

        //array.from()：将类数组对象转化为数组，要求是必须有length属性
        Array.from(inputList).forEach(element => {
            element.value = ''
        })

        //移除添加节点
        target.parentNode.removeChild(target)
   }

    //提交表单数据
    //设定值的容器
    let data = {
        'info': [],
        'type': 'addNewInfo',
        'statu': false
    }

   if(target.nodeName.toLowerCase() === 'button' && target.dataset.typeTest === 'submit'){

        //获取所有表单
        function getInput(selector){
            let node = document.querySelectorAll(selector)
            let data = []
            node.forEach(element => {
                if(element.value !== '') data.push(element.value)
            })
            return data
        }

        let name = getInput("input[name='name']")
        let href = getInput("input[name='href']")
        let keywords = getInput("input[name='keywords']")

        if(name.length>0 && href.length>0 && keywords.length>0){
            //判断是否相等
            let flag = name.length == href.length ? name.length == keywords.length ? true : false : false
            console.log(flag)
            if(flag){
                for(let i=0; i<name.length; i++){
                    data.info.push({'name': name[i], 'href': href[i], 'keywords': keywords[i]})
                }
                data.statu = true
            }
            else{
                alert('数据填写不完整')
            }
        }else{
            alert('数据不能为空')
        }
   }

   //发送到后台
   if(data.statu == true){
       const xhr = new XMLHttpRequest()
       
       xhr.open('post', 'http://localhost/seo/add', true)
       xhr.send(JSON.stringify(data))

       xhr.onreadystatechange = function(){
           if(xhr.readyState == 4 && xhr.status == 200){
               response = JSON.parse(xhr.responseText)
               if(response.status == 200){
                   alert('添加数据成功')
               }else{
                   alert('添加数据失败，服务器出现错误')
               }
           }
       }
   }
})