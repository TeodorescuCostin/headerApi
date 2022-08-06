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
  return new Web3Storage({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDdGNTI5MmRDMTQ0MjBCODA4RTg4Mjc2QTVlNkM0ZDBDRTREMERmNUEiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NTk4MDc2MDgyNDEsIm5hbWUiOiJIZWFkZXIifQ.RsIfl9b4293_51qxzWy4SklR7GQCWSKITpdFd9mGDlk' })
}

var pathFile
var nameFile
var dataJson

async function getLastData (id) {
  const client = makeStorageClient()

  // get today's date
  const d = new Date()
  d.setDate(d.getDate())

  // the list method's before parameter accepts an ISO formatted string
  const before = d.toISOString()

  // limit to ten results
  const maxResults = 10+id

  var data = []

  for await (const upload of client.list({ before, maxResults })) {
    data.push(upload)
  }

  // get the first file from the list and prepare it in the corect format
  const arraySize = data.length
  pathFile = data[(-1)*(id-arraySize)].cid
  const url = 'https://' + pathFile + '.ipfs.dweb.link/' + id + ".json"

  // fetching the json uploaded on web3.storgae and prepare it in the corect way

  fetch(url)
    .then(res => res.json())
    .then(out => dataJson = out)
    .catch(function(ex) {
      console.log('parsing failed', ex)
    })

  console.log(dataJson)
}



// send the request with the JSON that includes all the data

app.get('/api/request/:dynamic', (req,res) => {

  const {dynamic} = req.params
  getLastData(dynamic)
  res.json(dataJson)

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
