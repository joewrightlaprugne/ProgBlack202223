async function renderUploadedImage(array, renderAgain=0){

  var comments = ""

  count = 0
  for (let c in array["comments"]){
    currentCommentId = String(count) + "!" + array["id"]
    await fetch(`/commentlikestatus/${currentCommentId}`).then(response => response.json()).then(results => {
      if (results[0] === true){
        likeButtonImage = "liked.png"
      }
      else{
        likeButtonImage = "unliked.png"
      }
      if (results[1] === true){
        dislikeButtonImage = "disliked.png"
      }
      else{
        dislikeButtonImage = "undisliked.png"
      }
    })
    comments += `
    <div class="container p-3 border rounded-4 col-md-12">
        <b>${array["comments"][c]["username"]}</b>:
        <p>${array["comments"][c]["commentText"]}</p>
        <div class="votecomment${array["id"]}" id="+C${count}!${array["id"]}" style="display:inline-block;vertical-align:top;">
          <img src=${likeButtonImage} id="+BC${count}!${array["id"]}" alt="img" id="+img0"/>
        </div>
        <div id="+DC${count}!${array["id"]}" style="display:inline-block;">
          <h6>${array["comments"][c]["commentLikes"]}</h6>
        </div>
        <div class="votecomment${array["id"]}" id="-C${count}!${array["id"]}" style="display:inline-block;vertical-align:top;">
          <img src=${dislikeButtonImage} id="-BC${count}!${array["id"]}" alt="img"/>
        </div>
        <div id="-DC${count}!${array["id"]}" style="display:inline-block;">
          <h6>${array["comments"][c]["commentDislikes"]}</h6>
        </div>
      </div>
      <h1></h1>`
    count += 1
  }


  await fetch(`/postlikestatus/${String(array["id"])}`).then(response => response.json()).then(results => {
    if (results[0] === true){
      likeButtonImage = "liked.png"
    }
    else{
      likeButtonImage = "unliked.png"
    }
    if (results[1] === true){
      dislikeButtonImage = "disliked.png"
    }
    else{
      dislikeButtonImage = "undisliked.png"
    }
  })
  var today = new Date(array["uploadDate"]);
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  var dd = String(today.getDate());
  var mm = months[today.getMonth()];
  var yyyy = today.getFullYear();
  humanUploadDate = mm + " " + dd + ', ' + yyyy;
  newHTML = 
  `<div id="notpreview${array["id"]}" class="notpreview container p-4 my-5 border rounded-4 col-md-4">
    <h1>${array["title"]}</h1>
    <img class="img-fluid rounded" src="uploaded_content\\${array["imageFile"]}">
    <h1></h1>
    <div>Uploaded on <b>${humanUploadDate}</b> by <b>${array["uploaderName"]}</b></div>
    <div>Location: <b>${array["location"]}</b></div>
    <h1></h1>
    <div class="voteimage${array["id"]}" id="+${array["id"]}" style="display:inline-block;vertical-align:top;">
      <img src=${likeButtonImage} id="+B${array["id"]}" alt="img"/>
    </div>
    <div style="display:inline-block;" id="D+${array["id"]}">
      <h6>${array["likes"]}</h6>
    </div>
    <div class="voteimage${array["id"]}" id="-${array["id"]}" style="display:inline-block;vertical-align:top;">
      <img src=${dislikeButtonImage} id="-B${array["id"]}" alt="img"/>
    </div>
    <div style="display:inline-block;" id="D-${array["id"]}">
      <h6>${array["dislikes"]}</h6>
    </div>
    <p>${array["description"]}</p>
    <h3>Comments:</h3>
    ${comments}
    <form id="submitComment${array["id"]}">
      <h3>Submit a comment</h3>
      <h1></h1>
      <input class="form-control" name="usernameValue${array["id"]}" id="usernameInput${array["id"]}" placeholder="Enter username">
      <h1></h1>
      <textarea class="form-control" name="descriptionValue${array["id"]}" rows="5" placeholder="Add a comment..."></textarea>
      <h1></h1>
      <button type="submitComment" id="submitCommentButton${array["id"]}" class="btn btn-success">Submit</button>
    </form>
  </div>`

  if (renderAgain == 0){
    oldItem = document.getElementById(`preview${array["id"]}`)
    newItem = document.createElement("div");
    newItem.innerHTML = newHTML;
    oldItem.replaceWith(newItem)
  }
  else{
    oldItem = document.getElementById(`notpreview${array["id"]}`)
    newItem = document.createElement("div");
    newItem.innerHTML = newHTML;
    oldItem.replaceWith(newItem)
  }

  submitCommentButton = document.getElementById(`submitComment${array["id"]}`)
  submitCommentButton.addEventListener('submit', async function (event) {
    event.preventDefault();
    //const data = new FormData(submitForm);
    const data = new FormData(submitCommentButton);
    const dataJSON = Object.fromEntries(data);
    dataJSON["id"] = array["id"]
    dataJSON["commentText"] = dataJSON[`descriptionValue${array["id"]}`]
    dataJSON["username"] = dataJSON[`usernameValue${array["id"]}`]
    await fetch("/newComment", // Vote on picture
    {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataJSON)
    })

    fetch("/image/" + submitCommentButton.id.slice(13)).then(response => response.json()).then(results => {
      renderUploadedImage(results, 1)
    })
    }
  );

  voteimages = document.getElementsByClassName(`voteimage${array["id"]}`)
  for(let current of voteimages){
    current.addEventListener("click", () => {
      const response = fetch("/vp", // Vote on picture
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: current.id
      }).then(response => response.json()).then(body => {
        likeButton = document.getElementById(`+B${current.id.slice(1)}`)
        dislikeButton = document.getElementById(`-B${current.id.slice(1)}`)
        if (body[2] === true){
          likeButton.src = "liked.png"
        }
        else{
          likeButton.src = "unliked.png"
        }
        if (body[3] === true){
          dislikeButton.src = "disliked.png"
        }
        else{
          dislikeButton.src = "undisliked.png"
        }
        document.getElementById(`D+${Math.abs(parseInt(current.id))}`).innerHTML = `<h6>${body[0]}</h6>`
        document.getElementById(`D-${Math.abs(parseInt(current.id))}`).innerHTML = `<h6>${body[1]}</h6>`})
    })
  }

  votecomments = document.getElementsByClassName(`votecomment${array["id"]}`)
  for(let current of votecomments){
    current.addEventListener("click", () => {
      const response = fetch("/vc",
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: current.id
      }).then(response => response.json()).then(body => {
        likeButton = document.getElementById(`+B${current.id.slice(1)}`)
        dislikeButton = document.getElementById(`-B${current.id.slice(1)}`)
        if (body[2] === true){
          likeButton.src = "liked.png"
        }
        else{
          likeButton.src = "unliked.png"
        }
        if (body[3] === true){
          dislikeButton.src = "disliked.png"
        }
        else{
          dislikeButton.src = "undisliked.png"
        }
        document.getElementById(`+DC${current.id.slice(2)}`).innerHTML = `<h6>${body[0]}</h6>`
        document.getElementById(`-DC${current.id.slice(2)}`).innerHTML = `<h6>${body[1]}</h6>`})
    })
  }
}

function renderSearchResult(array, searchedString){
  p = array[2].toLowerCase().indexOf(searchedString.toLowerCase())
  if (p > -1){
    array[2] = array[2].slice(0, p) + `<span style="background-color: #FFFF00">` + array[2].slice(p, p+searchedString.length) + "</span>" + array[2].slice(p+searchedString.length)
  }
  p = array[3].toLowerCase().indexOf(searchedString.toLowerCase())
  if (p > -1){
    array[3] = array[3].slice(0, p) + `<span style="background-color: #FFFF00">` + array[3].slice(p, p+searchedString.length) + "</span>" + array[3].slice(p+searchedString.length)
  }

  newHTML = 
  `<div id="preview${array[0]}" class="preview container p-4 my-5 border rounded-4 col-md-4">
  <h1>${array[2]}</h1>
  <p>Location: ${array[3]}</p>
  </div>`

  document.body.insertAdjacentHTML('beforeend', newHTML);

  document.getElementById(`preview${array[0]}`).addEventListener("click", (event) => {
    fetch("/image/" + String(array[0])).then(response => response.json()).then(results => {
      renderUploadedImage(results)
    })
  })
}

const file = document.getElementById('exampleFormControlFile1');
const upload = document.getElementById('upload');


function checkConnection(){
  fetch("/checkconnection").then(response => {
    document.getElementById("disconnectOverlay").style.display = "none"
  }).catch(function() {
    document.getElementById("disconnectOverlay").style.display = "block"
  })
}

function uploadSuccessful(){
  document.getElementById("successOverlay").style.display = "block"
}

function getSearchResults(){
  searchQuery = document.getElementById("searchControl").value
  if (searchQuery.length < 1){
      return
  }
  fetch("/search/" + searchQuery + "/" + document.getElementById("sortSelector").value).then(response => response.json()).then(results => {
      oldPreviews = document.getElementsByClassName("preview container p-4 my-5 border rounded-4 col-md-4")
      getStarted = document.getElementById("getStarted")
      if (getStarted != null){
        getStarted.remove()
      }
      for(i=oldPreviews.length-1;i > -1;i--){
        oldPreviews[i].remove()
      }
      oldPreviews = document.getElementsByClassName("notpreview container p-4 my-5 border rounded-4 col-md-4")
      for(i=oldPreviews.length-1;i > -1;i--){
        oldPreviews[i].remove()
      }
      for(let item in results){
          renderSearchResult(results[item], searchQuery)
      }
      if (results.length < 1){
        noSearchResults = `<p></p>
        <p></p>
        <p></p>
        <h3 style="color:#D5D5D5" class="text-center" id="getStarted">No results found</h3>`
        document.body.insertAdjacentHTML('beforeend', noSearchResults);
      }
  })
}

document.getElementById("searchForm").addEventListener("keyup", function(event) {
  if (event.key == "Enter"){
    getSearchResults()
  }
})

document.getElementById("sortSelector").addEventListener("change", () => getSearchResults())
document.getElementById("searchButton").addEventListener("click", () => getSearchResults())
setInterval(checkConnection, 1000)

submitForm.addEventListener('submit', async function (event) {

    event.preventDefault();
    const data = new FormData(submitForm);
    const dataJSON = Object.fromEntries(data);
    const fileReader = new FileReader();
    errorText = document.getElementById("errorText")
    if (file.files[0] == null){
      errorText.innerHTML = "No file selected"
      return
    }
    if (dataJSON.username.length == 0){
      errorText.innerHTML = "Enter a username"
      return
    }
    if (dataJSON.location.length == 0){
      errorText.innerHTML = "Enter a location"
      return
    }
    if (dataJSON.title.length == 0){
      errorText.innerHTML = "Enter a title"
      return
    }
    fileTypes = ["jpg", "jpeg", "png"]
    if (!fileTypes.includes(file.files[0].name.split('.').pop())){
      errorText.innerHTML = "Unsupported file type"
      return
    }
    errorText.innerHTML = ""
    fileReader.readAsArrayBuffer(file.files[0]);
    fileReader.onload = async (event) => {
        const content = event.target.result;
        const CHUNK_SIZE = 10000;
        const totalChunks = event.target.result.byteLength / CHUNK_SIZE;
        const fileName = Math.random().toString(36).slice(-6) + file.files[0].name;

        for (let chunk = 0; chunk < totalChunks + 1; chunk++) { // Partial credit to https://blog.logrocket.com/how-to-build-file-upload-service-vanilla-javascript/
            let CHUNK = content.slice(chunk * CHUNK_SIZE, (chunk + 1) * CHUNK_SIZE)

            await fetch('/uploadChunk/' + fileName, {
            'method' : 'POST',
            'headers' : {
                'content-type' : "application/octet-stream",
                'content-length' : CHUNK.length,
            },
            'body': CHUNK
            })
        }
        dataJSON["fileValue"] = fileName
        await fetch("/submitImage",
        {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataJSON)
        }).then(result => {
          uploadSuccessful()
          var successInterval = setInterval(function() {
            document.getElementById("successOverlay").style.display = "none"
            clearInterval(successInterval)
          }, 2000)
        })
    }
});