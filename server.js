var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var firebase = require('firebase')
const axios = require('axios')
var app = express()
const key = 'EAAC3DSTTyCMBAPcOlfjovZCs8oZBWqDAnU46eTLaDNxtcCNg8jfvpcHZCSw3C0fBxbjGptu7zc9wuGKBVsK7n3L43Uves1k6tqhkT4YqnrpWbtVNEQGwhwFWIUOHjKZCZBuheNoMqfACA7A7L5NJ3OJZCfsoXKNdz7qKtguHsLFgZDZD'
var config = {
  apiKey: 'AIzaSyDA_HOpzHHsdcsOX36Gh80_i4MCYHHJr5c',
  authDomain: 'userdatabase-71afb.firebaseapp.com',
  databaseURL: 'https://userdatabase-71afb.firebaseio.com',
  storageBucket: 'userdatabase-71afb.appspot.com',
  messagingSenderId: '49200232033'
}

// setInterval(function(){sendTextMessage('939326652838978', 'This was send at'+ Date.now()) }, 60000)

firebase.initializeApp(config)
var Users = firebase.database().ref('users')
    // var x = users.find(user => user.UID === id)
var userInfo = []
Users.on('child_added', function (snapshot) {
  var item = snapshot.val()
  item.id = snapshot.key
  userInfo.push(item)
  console.log(userInfo)
})

Users.on('child_changed', function (snapshot) {
  var id = snapshot.key
  var index = userInfo.findIndex(user => user.id === id)
  userInfo[index] = snapshot.val()
  console.log( ' CHANGE userInfo \n ' + userInfo)
})

Users.on('child_removed', function (snapshot) {
    var id = snapshot.key
    var index = userInfo.findIndex(user => user.id === id)
     userInfo.splice(index,1)
  console.log(userInfo)
})
setInterval(() => {
  checkList()
}, 10000)
setInterval(() => {
  checkSend()
}, 10000)
app.use(bodyParser.json())
app.set('port', (process.env.PORT || 4000))
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())
/* axios.get('http://api.openweathermap.org/data/2.5/weather?q=' + text + '&APPID=7fee5476cbd1705fb181c28e20c473b7').then(function (res) {
         console.log(res.data.main.temp)
         sendTextMessage(senderID, res.data.main.temp - 273)
}) */

app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === key) {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
})

app.post('/webhook', function (req, res) {
  var data = req.body

    // Make sure this is a page subscription
  if (data.object === 'page') {
        // Iterate over each entry - there may be multiple if batched
    data.entry.forEach( function (entry) {
      var pageID = entry.id
      var timeOfEvent = entry.time
            // Iterate over each messaging event
      entry.messaging.forEach( function (event) {
        if (event.message) {
          receivedMessage(event)
        } else { console.log('Webhook received unknown event: ', event) }
      })
    })
        // Assume all went well.
        //
        // You must send back a 200, within 20 seconds, to let us know
        // you've successfully received the callback. Otherwise, the request
        // will time out and we will keep trying to resend.
    res.sendStatus(200)
  }
})

function receivedMessage (event) {
  var senderID = event.sender.id
  var recipientID = event.recipient.id
  var timeOfMessage = event.timestamp
  var message = event.message

  console.log('Received message for user %d and page %d at %d with message:',
        senderID, recipientID, timeOfMessage)
  console.log(JSON.stringify(message))

  var messageId = message.mid

  var messageText = message.text
  var messageAttachments = message.attachments

  if (messageText) {
    if (messageText === 'hello') {
      sendTextMessage(senderID, 'Welcome to my bots Have take a look')
    }
    else if (messageText === 'about') {
      sendTextMessage(senderID, 'This bot created by Wipoo suvunnasan')
    }
    else if (messageText === 'subscript') {
      addUser(senderID)
    }
    else if (messageText === 'addlist') {
      addChannel(senderID)
    }
    else {
      let x = userInfo.find(user => user.UID === senderID)
      if (!x) {
        sendTextMessage(senderID, 'Your entered wrong Keywords Please try : hello , about , subscript')
      }
      else if (x) {
          addChannel(senderID, messageText)
      }
    }
        // If we receive a text message, check to see if it matches a keyword
        // and send back the example. Otherwise, just echo the text we received.
        /* switch (messageText) {
          case 'generic':
            sendGenericMessage(senderID)
            break

          default:
            sendTextMessage(senderID, 'Your entered wrong Keywords')
        } */
  }
  else if (messageAttachments) {
    sendTextMessage(senderID, 'Message with attachment received')
  }
}
function sendGenericMessage (recipientId, messageText) {
    // To be expanded in later sections
}
function sendTextMessage (recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  }

  callSendAPI(messageData)
}

function callSendAPI (messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: key
    },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var recipientId = body.recipient_id
      var messageId = body.message_id

      console.log('Successfully sent generic message with id %s to recipient %s')
    } else {
      console.error('Unable to send message.')
      console.error(response)
      console.error(error)
    }
  })
}

function addUser (userID) {
  var x = userInfo.find(user => user.UID === userID)
        // x.follower[0]
  if (x) {
        // setTimeout(,1000)
    setTimeout(() => {
      sendTextMessage(userID, 'คุณได้ทำการสมัครสมาชิกไปแล้ว !! ')
    }, 1000)
    setTimeout(() => {
      sendTextMessage(userID, 'กรุณากรอก Channel ที่คุณต้องการจะติดตาม <3')
    }, 2000)
        // setTimeout(sendTextMessage(userID, 'โปรดพิมพ์ \'addlist\' เพื่อเพิ่มชื่อช่องที่ต้องการติดตาม'),3000)
  } else {
    var data = {
      UID: userID,
      follower: [{
        name: 'ponza2538',
        live: false,
        send: false
      }],
      state: '1'

    }
    Users.push(data)
    setTimeout(() => {
      sendTextMessage(userID, 'คุณได้ทำการสมัครสมาชิกเรียบร้อยแล้ว :D ')
    }, 1000)
    setTimeout(() => {
      sendTextMessage(userID, 'กรุณากรอก Channel ที่คุณต้องการจะติดตาม')
    }, 2000)
  }
}

function addChannel (senderID, messageText) {
  sendTextMessage(senderID, 'ใส่ช่อง ที่ต้องการ')
  var userData = userInfo.find(user => user.UID === senderID)
  var follow = userData.follower
  var liveCheck = userData.live
  axios.get('https://api.twitch.tv/kraken/channels/' + messageText + '/?client_id=l13ikftl5r75akwu350wqebougu9i1m')
  .then( function (res) {
    console.log(res.status)
    if (res.status === 200) {
      let data = {
        name: messageText,
        live: false,
        send: false
      }
      follow.push(data)
      setTimeout(() => {
        sendTextMessage(senderID, 'คุณได้เพิ่ม Channel ' + messageText + ' เป็นที่เรียบร้อยแล้ว')
      }, 1000)
      setTimeout(() => {
        sendTextMessage(senderID, 'คุณสามารถพิมพ์ !list เพื่อตรวจเช็ครายชื่อ Channel ที่คุณติดตาม')
      }, 2000)
      firebase.database().ref('users/' + userData.id).update({
        follower: follow
      })
    }
  })
  .catch( function (err) {
    console.log(err)
    sendTextMessage(senderID, 'คุณกรอก Channel ไม่ถูกต้องกรุณากรอกใหม่')
  })
}

function checkList () {
  console.log('checking status')

userInfo.forEach( function (data,index) {
  console.log(index)
  data.follower.forEach( function (follow, index2) {
    axios.get('https://api.twitch.tv/kraken/streams/'+follow.name+'/?client_id=l13ikftl5r75akwu350wqebougu9i1m')
    .then( function (res){
      if (res.data.stream != null) {
        console.log('online')
         firebase.database().ref('users/' + data.id +'/follower/'+index2).update({
           live: true,
      })
      }
      else {
        console.log('offline')
        firebase.database().ref('users/' + data.id +'/follower/'+index2).update({
          live: false,
          send: false
     })
      }
    }).catch( function(err){
        console.log(err)
    })
  })
})
}

function checkSend () {
    console.log('checking Sending status')
    //sendTextMessage("939326652838978","ควยยยยยยยยยยยยยยยยยย")
userInfo.forEach( function (data,index) {
    //console.log('process sending status: '+index)
  data.follower.forEach( function (follow,index2) {
      //console.log('process sending status phase2 :'+index)
      //console.log(data.UID)
      console.log('live'+follow.live)
      console.log('send'+follow.send)
    if(follow.live && !follow.send){
      sendTextMessage(data.UID,'ช่อง '+follow.name+' ที่คุณติดตามไว้ Live แล้วสามารถรับเข้าไปรับชมได้' )
        firebase.database().ref('users/' + data.id +'/follower/'+index2).update({
          send: true
     })
     console.log('send message already')
  }

  })

})



}

app.listen(app.get('port'), function () {
  console.log('run at port', app.get('port'))
})
