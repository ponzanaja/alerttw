var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var firebase = require('firebase');
var app = express()

var config = {
    apiKey: "AIzaSyDA_HOpzHHsdcsOX36Gh80_i4MCYHHJr5c",
    authDomain: "userdatabase-71afb.firebaseapp.com",
    databaseURL: "https://userdatabase-71afb.firebaseio.com",
    storageBucket: "userdatabase-71afb.appspot.com",
    messagingSenderId: "49200232033"
};

//setInterval(function(){sendTextMessage("939326652838978", "This was send at"+ Date.now());}, 60000);

firebase.initializeApp(config);
var Users = firebase.database().ref('users')
//var x = users.find(user => user.UID === id)
var userInfo = [];
  Users.on('child_added', function(snapshot){
      userInfo.push(snapshot.val());
  });
app.use(bodyParser.json())
app.set('port', (process.env.PORT || 4000))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/webhook', function(req, res) {
  var key = 'EAAC3DSTTyCMBANmzGelQQ7g34BcBrnqMNIxK36Q7CZCKamEr9amn1xZAzBpZCuLsGDmX7LpKofZCwxvnS0auQKnsZBqeYKg6SNW8H5ldKEYfm9ZAnxm8Jin7fP5HCJ5q7jiAuYrrspxB64keZBZAQIXjwrYF6Qvfu3sSD19TTpgVxAZDZD'
  if (req.query['hub.verify_token'] === key) {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
})

app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {
    if (messageText === 'hello') {
      //sendTextMessage(senderID, "ควยเอ้ย ไม่รู้ request");
      sendTextMessage(senderID, "Welcome to my bots Have take a look");
    }else if (messageText == 'about') {
      sendTextMessage(senderID, "This bot created by Wipoo suvunnasan");
    }else if (messageText == 'subscript') {
        addUser(senderID)
      }else{
      sendTextMessage(senderID, "Your entered wrong Keywords Please try : hello , about , subscript");
    }

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    /*switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID);
        break;

      default:
        sendTextMessage(senderID, "Your entered wrong Keywords");
    }*/

  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }


}
function sendGenericMessage(recipientId, messageText) {
  // To be expanded in later sections
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: 'EAAC3DSTTyCMBANmzGelQQ7g34BcBrnqMNIxK36Q7CZCKamEr9amn1xZAzBpZCuLsGDmX7LpKofZCwxvnS0auQKnsZBqeYKg6SNW8H5ldKEYfm9ZAnxm8Jin7fP5HCJ5q7jiAuYrrspxB64keZBZAQIXjwrYF6Qvfu3sSD19TTpgVxAZDZD' },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);

    }
  });
}

function addUser(userID) {


  var x = userInfo.find(user => user.UID === userID)

  if(x){
  sendTextMessage(userID, "คุณได้ทำการสมัครสมาชิกไปแล้ว !! ");
}else {
  var data = {
    UID : userID,
    follower : [" "],
    state : "1"
  }
  Users.push(data)
  sendTextMessage(userID, "คุณได้ทำการสมัครสมาชิกเรียบร้อยแล้ว ");
  sendTextMessage(userID, "กรุณากรอก Channel ที่คุณต้องการจะติดตาม");
}

}
/*
let userInfo = [];
    Users.on('child_added', function(snapshot){
    userInfo.push(snapshot.val())
    let valid = userInfo.find(user => user.UID === userID)
    if(valid)
    {
        sendTextMessage(userID, "คุณได้ทำการสมัครสมาชิกไปแล้ว !! ");
        sendTextMessage(userID, "กรุณากรอก Channel ที่คุณต้องการจะติดตาม");
    }
    else {
      var data = {
        UID : userID,
        follower : [" "],
        state : "1"
      }
      Users.push(data)
      sendTextMessage(userID, "คุณได้ทำการสมัครสมาชิกเรียบร้อยแล้ว ");
      sendTextMessage(userID, "กรุณากรอก Channel ที่คุณต้องการจะติดตาม");
    }

    });
*/

  /*}else {
    sendTextMessage(userID, "คุณได้ทำการสมัครสมาชิกไปแล้ว กรุณากรอก Channel ที่ต้องการจะติดตาม");
  }*/






app.listen(app.get('port'), function () {
  console.log('run at port', app.get('port'))
})
