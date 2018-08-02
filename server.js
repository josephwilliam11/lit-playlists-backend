let express = require('express')
let request = require('request')
let querystring = require('querystring')

SPOTIFY_CLIENT_ID = 'de94cd9e8ce242bbbb2f7e52de646af6'
SPOTIFY_CLIENT_SECRET = 'd3c0023485b049b68865918f63bfec1f'
// const mongoose = require('mongoose')

let app = express()

// mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/spotifyUsers");

let redirect_uri = 
  process.env.REDIRECT_URI || 
  'http://localhost:8888/callback'

app.get('/login', function(req, res) {
  res.json({url: 'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: SPOTIFY_CLIENT_ID,
      scope: 'user-read-private user-read-email user-read-playback-state user-read-birthdate streaming playlist-modify-public',
      redirect_uri
    })})
})

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
        SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET
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

if (process.env.NODE_ENV === 'production') { 	app.use(express.static('client/build')); }
app.get('*', (request, response) => { 	response.sendFile(path.join(__dirname, 'client/build', 'index.html')); });


let port = process.env.PORT || 8888
console.log(`Listening on port ${port}. Go /login to initiate authentication flow.`)
app.listen(port)

