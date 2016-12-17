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



firebase.initializeApp(config)
var Users = firebase.database().ref('users')

var userInfo = []
Users.on('child_added', function (snapshot) {
  var item = snapshot.val()
  item.id = snapshot.key
  userInfo.push(item)
  console.log(userInfo)
})

Users.on('child_changed', function (snapshot) {
  var id = snapshot.key
  var User = userInfo.find(user => user.id === id)
  User.UID = snapshot.val().UID
  User.follower = snapshot.val().follower
  User.state = snapshot.val().state
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
        }
        else if (event.postback) {
          receivedPostback(event)
        }
        else { console.log('Webhook received unknown event: ', event) }
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

  console.log('Received message for user %d and page %d at %d with message:')
        //,senderID, recipientID, timeOfMessage)
  console.log(JSON.stringify(message))

  var messageId = message.mid
  var messageText = message.text
  var messageAttachments = message.attachments


  if (messageText) {
    if (messageText === 'hello') {


    }
    else if (messageText === 'about') {
      sendTextMessage(senderID, 'This bot created by Wipoo suvunnasan')
    }
    else if (messageText === 'subscript' || messageText === 'Subscript') {
      addUser(senderID)
    }
    else if (messageText === 'help') {
      sendTextMessage(senderID,'สามารถดูการใช้งานเบื้องต้นได้ที่นี้ goo.gl/H7oDuZ')
    }
    else if (messageText === 'unsubscript') {
      deleteUser(senderID)
    }else if (messageText === '!list'){
      showList(senderID)
    }
    else {
      let userIn = userInfo.find(user => user.UID === senderID)
      if (!userIn) {
        sendTextMessage(senderID, 'Your entered wrong Keywords Please try : hello , about , subscript')
      }
      else if (userIn) {
            let temp = messageText.slice(0,1)
            let temp2 = messageText.slice(1)
            if(temp === '!'){
              deleteChannel(senderID, temp2)
            }
            else {
              addChannel(senderID, messageText)
            }
      }else {

      }
    }
        // If we receive a text message, check to see if it matches a keyword
        // and send back the example. Otherwise, just echo the text we received.
  }
  else if (messageAttachments) {
    sendTextMessage(senderID, 'Entered Wrong keyword')
  }
}

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  var payload = event.postback.payload;

  console.log('Received postback for user %d and page %d with payload "%s" ' +
    'at %d', senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to
  // let them know it was successful
  if(payload == 'get Start'){
    sendWelcome(senderID)
  }
  else if (payload === 'subscript'){
    addUser(senderID)
  }
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
      sendTextMessage(userID, 'คุณได้ทำการสมัครสมาชิกเรียบร้อยแล้ว :D สามารถยกเลิกการสมัครได้โดยการพิมพ์ว่า "unsubscript"')
    }, 1000)
    setTimeout(() => {
      sendTextMessage(userID, 'กรุณากรอก Channel ที่คุณต้องการจะติดตาม')
    }, 2000)
  }
}

function addChannel (senderID, messageText) {
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
        sendTextMessage(senderID, 'คุณสามารถพิมพ์ !list เพื่อตรวจเช็ครายชื่อ Channel ที่คุณติดตาม หรือ สามารถใส่ชื่อ Channel ที่ต้องการต่อได้เลย')
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

  if(userInfo){
  userInfo.forEach( function (data,index) {
    console.log(index)
    data.follower.forEach( function (follow, index2) {
      axios.get('https://api.twitch.tv/kraken/streams/'+follow.name+'/?client_id=l13ikftl5r75akwu350wqebougu9i1m')
      .then( function (res){
        if (res.data.stream != null) {
           firebase.database().ref('users/' + data.id +'/follower/'+index2).update({
             live: true
        })
        }
        else {
          firebase.database().ref('users/' + data.id +'/follower/'+index2).update({
            name: follow.name,
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
}

function checkSend () {


userInfo.forEach( function (data,index) {

  data.follower.forEach( function (follow,index2) {
    if(follow.live && !follow.send){
      axios.get('https://api.twitch.tv/kraken/channels/'+follow.name+'?client_id=l13ikftl5r75akwu350wqebougu9i1m')
      .then( function (res){
        sendLiveTwitch(data.UID,follow.name,res.data.logo,res.data.game)
      })
      /*setTimeout(() => {
        sendTextMessage(data.UID,'ช่อง '+follow.name+' ที่คุณติดตามไว้ Live แล้วสามารถรับเข้าไปรับชมได้' )
      }, 1000)
      setTimeout(() => {
        sendTextMessage(data.UID,'Link :https://www.twitch.tv/'+follow.name)
      }, 2000)*/

        firebase.database().ref('users/' + data.id +'/follower/'+index2).update({
          send: true
     })
    // console.log('send message already')
  }
  })
})
}

function deleteUser (senderID) {
  var userIn = userInfo.find(user => user.UID === senderID)

  firebase.database().ref('users/' +userIn.id+'').remove()
  sendTextMessage(senderID, 'ขอบคุณที่ใช้งานที่ไว้วางใจใช้งาน Alert Twitch ของเรา :P ')
  }


function showList (senderID) {
    sendTextMessage(senderID,'คุณสามารถลบ Channel ที่ไม่ต้องการได้โดยการพิมพ์ชื่อ ![ชื่อที่ต้องการลบ] เช่น !eiei')
    var userIn = userInfo.find(user => user.UID === senderID)
    setTimeout(() => {
    userIn.follower.forEach( function (data,index){
        sendTextMessage(senderID,' '+data.name+'\n')
      })
    }, 1000)
}

function deleteChannel (senderID, messageText){
  console.log(messageText)
  var userIn = userInfo.find(user => user.UID === senderID)
  var veri
  //var veri = userIn.follower.find(follow => follow.name === messageText)
  userIn.follower.forEach( function (user,index) {
    if (user.name === messageText ) {}
    veri = user.name
  })

  if(veri){
    userIn.follower.forEach( function (user,index) {
      if (user.name === messageText ) {
        firebase.database().ref('users/' +userIn.id+'/follower/'+index).remove()
        setTimeout(() => {
          sendTextMessage(senderID,'เราได้ลบ '+messageText+' เรียบร้อยแล้ว')
        }, 1000)
        setTimeout(() => {
          sendTextMessage(senderID,'คุณสามารถ !list เพื่อแสดง Channel ทั้งหมดหรือ สามารถกรอกชื่อ Channel ที่ต้องการเพิ่มได้')
        }, 2000)


      }
    })
  }
  else {
    sendTextMessage(senderID,'คุณกรอก Channel ที่ต้องการลบ ผิด')
  }

  /*){
  firebase.database().ref('users/' +userIn.id+'/follower/'+).remove()
  sendTextMessage(senderID,'เราได้ลบ '+messageText+' เรียบร้อยแล้ว')
  }
  else {
    sendTextMessage(senderID,'คุณกรอก Channel ที่ต้องการลบ ผิด')
  }*/
}

function sendWelcome(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: 'ยินดีต้อนรับสู่ Alert Twitch คุณสามารถเริ่มใช้งานได้โดยการเลือก \n subscript ถ้ามีข้อสงสัยสามารถพิมพ์ help',
          buttons:[{
            type: 'postback',
            title: 'subscript',
            payload: 'subscript'
          }, {
            type: 'web_url',
            url: 'goo.gl/H7oDuZ',
            title: 'help'
          }]
        }
      }
    }
  }
  callSendAPI(messageData)
}

function sendLiveTwitch(recipientId,chName,img,game) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message:{
    attachment:{
      type:'template',
      payload:{
        template_type:'generic',
        elements:[
          {
            title:'ช่อง '+chName+' ที่คุณติดตาม Live แล้ว !!',
            item_url:'https://www.twitch.tv/'+chName,
            image_url:''+img,
            subtitle:'Streaming Game : '+game,
            buttons:[
              {
                type:'web_url',
                url:'https://www.twitch.tv/'+chName,
                title:'Watch now'
              }
            ]
          }
        ]
      }
    }
  }
      }
    callSendAPI(messageData)
}

app.listen(app.get('port'), function () {
  console.log('run at port', app.get('port'))
})
