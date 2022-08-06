const express = require("express");
var app = express()

const path = require("path");
const logger = require("morgan");
const cors = require("cors");
const fileUpload = require('express-fileupload');
const fetch = require('node-fetch');

app.use(express.urlencoded({extended: true}));
app.use(express.json())
app.use(logger("dev"));
app.use(express.json());

app.use(cors());

app.set('view engine', 'ejs');
app.use(fileUpload());

const { Web3Storage, getFilesFromPath } = require('web3.storage');

// connecting to the web3.storage account

function makeStorageClient () {
  return new Web3Storage({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEY5MTg0MURjOUYxMUM1Nzk0Q0Y0YTA2Zjc1NDg3N0M1MzM5MTIwNEMiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NTk1NzM1MjMyNzQsIm5hbWUiOiJIZWFkZXJUZXN0In0.yBvdu-zspSXiBR6HtXkJGTLEhZ_31Rq1eg-ZWXhCf14' })
}

var pathFile
var nameFile
var dataJson

async function getLastData () {
  const client = makeStorageClient()

  // get today's date
  const d = new Date()
  d.setDate(d.getDate())

  // the list method's before parameter accepts an ISO formatted string
  const before = d.toISOString()

  // limit to ten results
  const maxResults = 10

  var data = []

  for await (const upload of client.list({ before, maxResults })) {
    data.push(upload)
  }

  // get the first file from the list and prepare it in the corect format

  pathFile = data[0].cid
  nameFile = data[0].name
  const url = 'https://' + pathFile + '.ipfs.dweb.link/' + nameFile

  // fetching the json uploaded on web3.storgae and prepare it in the corect way

  fetch(url)
    .then(res => res.json())
    .then(out => dataJson = out)
    .catch(function(ex) {
      console.log('parsing failed', ex)
    })

  console.log(dataJson)
}

getLastData()

// send the request with the JSON that includes all the data

app.get('/api/request', (req,res) => {

  res.json(dataJson)

})

// send the request with the picture

app.get('/api/request/picture', (req,res) => {

  res.send(dataJson.imageLink)

})

// send the request with the content

app.get('/api/request/content', (req,res) => {

  res.send(dataJson.content)

})

// send the request with the hashtags

app.get('/api/request/hashtags', (req,res) => {

  res.send(dataJson.hashtags)

})

// running the frontend 

app.use(express.static(path.join(__dirname, "./frontend/dist")));

app.get("*", function (_, res) {
  res.sendFile(
    path.join(__dirname, "./frontend/dist/index.html"),
    function (err) {
      if (err) {
        res.status(500).send(err);
      }
    }
  );
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server Running on port ${port}`));

module.exports = app;
