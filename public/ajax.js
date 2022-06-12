// 原始封装Ajax

let ajax = function(dict){
    let xhr = new XMLHttpRequest()

    xhr.open(dict.method, dict.url, true)
    if(dict.method == 'post'){
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    }
    xhr.send()
}