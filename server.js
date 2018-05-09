let express = require('express')
let request = require('request')
let querystring = require('querystring')
let bodyParser = require("body-parser");

let logger = require("morgan");
let mongoose = require("mongoose");

const db = require("./models");

mongoose.Promise = Promise;


let app = express()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


let redirect_uri = 
  process.env.REDIRECT_URI || 
  'http://localhost:8888/callback'

app.get('/login', function(req, res) {
  res.json({url: 'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: 'user-read-private user-read-email user-read-playback-state',
      redirect_uri
    })})
    // console.log(res);
})


app.post('/login/search', function(req, res) {

    db.User.create(req.body)
    .then(function(dbUser) {
       res.json(dbUser)
    })
    .catch(function(err) {
        res.json(err)
    })
})



app.post('/login/searchterm', function(req, res) {

  console.log("req body", req.body)
    db.Search.create(req.body)
    .then(function(dbSearch) {
       res.json(dbSearch)
    })
    .catch(function(err) {
        res.json(err)
    })
})

//mongo stuff

const databaseUrl = 'mongodb://localhost/litDB';

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect(databaseUrl)
}

const mc = mongoose.connection;

mc.on('error', function(err){
  console.log("Mongoose Error: ", err);
});

mc.once('open', function() { 
  console.log('Mongoose connection successful.')
}); 

// app.use((req, res, next) => {
//   console.log("What is our req.url", req.url);
  
//   next();
// })

app.get('/callback', function(req, res) {
  let code = req.query.code || null
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(
        process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
      ).toString('base64'))
    },
    json: true
  }
  request.post(authOptions, function(error, response, body) {
    var { access_token, refresh_token } = body;
    let uri = process.env.FRONTEND_URI || 'http://localhost:3000'
    res.redirect(uri + '/#' + querystring.stringify({
      access_token,
      refresh_token
  }))
  })
})




let port = process.env.PORT || 8888
console.log(`Listening on port ${port}. Go /login to initiate authentication flow.`)
app.listen(port)