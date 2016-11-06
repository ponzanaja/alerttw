var express = require('express')
var bodyParser = require('body-parser')
var app = express()

app.use(bodyParser.json())
app.set('port', (process.env.PORT || 4000))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/webhook', function(req, res) {
  var key = 'EAAZAdh4yZAgXcBAMdX9U6kUTd2Ow5oWyg6QMVy95UXvbnfALZCvovTiflTqHGhMChSqzdLyGWgIg1Sivp4dW8H5my5EIxt4TEZB3hchmNcDOkZBZBZC6aan9IVFhiVlYag6wRB6ZBsHlEFCpZAdAnCUSvLrXvF16AZC6U0Pf9pyqneuwZDZD'
  if (req.query['hub.verify_token'] === key) {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
})

app.listen(app.get('port'), function () {
  console.log('run at port', app.get('port'))
})
