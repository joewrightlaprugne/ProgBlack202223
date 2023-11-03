const express = require("express")
const app = express();
const bp = require('body-parser')
const fs = require("fs")

app.use(bp.text())
app.use(express.static("client"))
app.use(express.json())

module.exports = app

let alreadyLiked = new Set()
let alreadyDisliked = new Set()
let alreadyLikedComments = new Set()
let alreadyDislikedComments = new Set()

app.get("/search/:searchterm/:sort", (request, response) => {
    data = JSON.parse(fs.readFileSync("client\\uploaded_content\\metadata.json"));
    results = []
    count = 0
    for(let current in data){
        if ((data[current]["location"].toLowerCase().includes(request.params.searchterm.toLowerCase())) || (data[current]["title"].toLowerCase().includes(request.params.searchterm.toLowerCase()))) {
            results.push([])
            results[count].push(data[current]["id"])
            results[count].push(data[current]["likes"])
            results[count].push(data[current]["title"])
            results[count].push(data[current]["location"])
            count += 1
        }
    }
    sorted_results = []
    if (request.params.sort == 1) // Newest to oldest
    {
      sorted_results = results.sort(function(a, b){return b[0] - a[0]})
    }
    if (request.params.sort == 2) // Oldest to newest
    {
      sorted_results = results.sort(function(a, b){return a[0] - b[0]})
    }
    if (request.params.sort == 0) // Most to least popular
    {
      sorted_results = results.sort(function(a, b){return b[1] - a[1]})
    }
    response.status(200)
    response.send(sorted_results)
})

app.get("/image/:id", (request, response) => {
    data = JSON.parse(fs.readFileSync("client\\uploaded_content\\metadata.json"));
    if (data[request.params.id] === undefined){
        response.status(404)
        response.send([])
    }
    response.status(200)
    response.send(data[request.params.id])
})

app.get("/postlikestatus/:id", (request, response) => {
    response.send([alreadyLiked.has(parseInt(request.params.id)), alreadyDisliked.has(parseInt(request.params.id))])
})

app.get("/commentlikestatus/:id", (request, response) => {
    response.send([alreadyLikedComments.has(request.params.id), alreadyDislikedComments.has(request.params.id)])
})

app.post("/vp", (request, response) => {
    requestBody = request.body
    likeOrDislike = requestBody.charAt(0)
    imageID = parseInt(requestBody)
    const data = JSON.parse(fs.readFileSync("client\\uploaded_content\\metadata.json"));
    if (likeOrDislike == "+"){
        if (alreadyLiked.has(imageID))
        {
            data[imageID]["likes"] -= 1;
            alreadyLiked.delete(imageID)
        }
        else
        {
            data[imageID]["likes"] += 1;
            alreadyLiked.add(imageID)
            if (alreadyDisliked.has(imageID))
            {
                alreadyDisliked.delete(imageID)
                data[imageID]["dislikes"] -= 1;
            }
        }
    }
    if (likeOrDislike == "-"){
        imageID = Math.abs(imageID)
        if (alreadyDisliked.has(imageID))
        {
            data[imageID]["dislikes"] -= 1;
            alreadyDisliked.delete(imageID)
        }
        else
        {
            data[imageID]["dislikes"] += 1;
            alreadyDisliked.add(imageID)
            if (alreadyLiked.has(imageID))
            {
                alreadyLiked.delete(imageID)
                data[imageID]["likes"] -= 1;
            }
        }
    }
    fs.writeFileSync("client\\uploaded_content\\metadata.json", JSON.stringify(data, null, 4));
    response.send([data[imageID]["likes"], data[imageID]["dislikes"], alreadyLiked.has(imageID), alreadyDisliked.has(imageID)])
})

app.post("/vc", (request, response) => { // example input: +C2!3, meaning like comment 2 on post 3
    likeOrDislike = request.body.charAt(0)
    commentImageID = request.body.slice(2)
    commentID = parseInt(commentImageID)
    imageID = request.body.split("!").pop()
    const data = JSON.parse(fs.readFileSync("client\\uploaded_content\\metadata.json"));
    if (likeOrDislike == "+"){
        if (alreadyLikedComments.has(commentImageID))
        {
            data[imageID]["comments"][commentID]["commentLikes"] -= 1;
            alreadyLikedComments.delete(commentImageID)
        }
        else
        {
            data[imageID]["comments"][commentID]["commentLikes"] += 1;
            alreadyLikedComments.add(commentImageID)
            if (alreadyDislikedComments.has(commentImageID))
            {
                alreadyDislikedComments.delete(commentImageID)
                data[imageID]["comments"][commentID]["commentDislikes"] -= 1;
            }
        }
    }
    if (likeOrDislike == "-"){
        //imageID = Math.abs(commentImageID)
        if (alreadyDislikedComments.has(commentImageID))
        {
            data[imageID]["comments"][commentID]["commentDislikes"] -= 1;
            alreadyDislikedComments.delete(commentImageID)
        }
        else
        {
            data[imageID]["comments"][commentID]["commentDislikes"] += 1;
            alreadyDislikedComments.add(commentImageID)
            if (alreadyLikedComments.has(commentImageID))
            {
                alreadyLikedComments.delete(commentImageID)
                data[imageID]["comments"][commentID]["commentLikes"] -= 1;
            }
        }
    }
    fs.writeFileSync("client\\uploaded_content\\metadata.json", JSON.stringify(data, null, 4));
    response.send([data[imageID]["comments"][commentID]["commentLikes"], data[imageID]["comments"][commentID]["commentDislikes"], alreadyLikedComments.has(commentImageID), alreadyDislikedComments.has(commentImageID)])
})

app.post("/uploadChunk/:fileName", (request, response) => {
    fileName = request.params.fileName

    request.on('data', chunk => {
        fs.appendFileSync("client\\uploaded_content\\" + fileName, chunk);
    })
    return response.end("File successfully uploaded")
})

app.get("/getcomment/:imageid/:commentid", (request, response) => {
    data = JSON.parse(fs.readFileSync("client\\uploaded_content\\metadata.json"));
    result = data[request.params.imageid]
    if (result === undefined){
        response.status(404)
        response.send([])
    }
    else{
        result = result["comments"][request.params.commentid]
        if (result === undefined){
            response.status(404)
            response.send([])
        }
        else{
            response.status(200)
            response.send(result)
        }
    }
})

app.get("/getallcomments/:imageid", (request, response) => {
    data = JSON.parse(fs.readFileSync("client\\uploaded_content\\metadata.json"));
    result = data[request.params.imageid]
    if (result === undefined){
        response.status(404)
        response.send([])
    }
    else{
        response.status(200)
        response.send(result["comments"])
    }
})

app.post("/submitImage", (request, response) => {
    app.use(bp.json())
    dataJSON = request.body
    fileNameOld = dataJSON["fileValue"]
    fileName = fileNameOld
    ext = fileName.split('.').pop()

    data = JSON.parse(fs.readFileSync("client\\uploaded_content\\metadata.json"));
    fileName = "img" + String(data.length) + "." + ext

    var today = new Date();

    data[data.length] = {
        "id": data.length,
        "imageFile": fileName,
        "title": dataJSON.title, // TODO
        "uploadDate": Date.parse(today.toString()), // TODO
        "uploaderName": dataJSON.username, // TODO
        "likes": 0,
        "dislikes": 0,
        "description": dataJSON.description, // TODO
        "location": dataJSON.location,
        "comments": []
    }
    fs.renameSync(`client\\uploaded_content\\${fileNameOld}`, `client\\uploaded_content\\${fileName}`)
    fs.writeFileSync("client\\uploaded_content\\metadata.json", JSON.stringify(data, null, 4));
    response.status(200)
    response.send("Success")
})

app.post("/newComment", (request, response) => {
    app.use(bp.json())
    dataJSON = request.body
    id = dataJSON["id"]
    data = JSON.parse(fs.readFileSync("client\\uploaded_content\\metadata.json"));
    data[parseInt(id)]["comments"].push({
        "username": dataJSON["username"],
        "commentText": dataJSON["commentText"],
        "commentLikes": 0,
        "commentDislikes": 0,
        "commentId": data[parseInt(id)]["comments"].length
    })
    fs.writeFileSync("client\\uploaded_content\\metadata.json", JSON.stringify(data, null, 4));
    response.send("Success")
})

app.get("/checkconnection", (request, response) => {
    response.send("Connected")
})

app.listen("3000")