// uber.js
var UBER_ENDPOINT = "https://cn-dc1.uber.com"

var unirest = require('unirest');
var crypto = require('crypto');

module.exports = {
  login : function(email, password, location, callback) {
    var json = {
      "password" : hashPassword(password),
      "email" : email
    };

    sendMessage('Login', email, location, json, function(response) {
      try {
        var token = response.body['token'];
        callback("uber", {'token' : token});
      } catch (err) {
        callback("uber", {});
        console.error(err);
      }
    });
  },

  pickup: function() {
    
  },

  cancel: function() {

  },

  ping: function(token, location, callback) {
    var json = {
      "deviceOS": "7.1",
      "localeFileMD5": "4C2A9B8673EC29F09A27A880486EEEA9",
      "version": "2.33.0",
      "deviceId": "02:00:00:00:00:00",
      "deviceIds": {
        "advertiserId": "E531FE40-9FEE-4242-8335-1B19B0F7EDC1",
        "uberId": "7CC26326-250A-4113-AF04-A5748AA93CD1",
        "bluetoothMac": "02:00:00:00:00:00"
      },
      "deviceModel": "iPod5,1",
      "messageType" : "PingClient",
      "device" : "iphone",
      "epoch" : "1407014301556",
      "language" : "en",
      "altitude" : 0,
      "app" : "client",
      "token" : token,
      "longitude" : location["lon"],
      "latitude" : location["lat"]
    };

    unirest.post(UBER_ENDPOINT)
    .headers({
        "X-Uber-Token" : token,
        "Host" : "cn-dc1.uber.com:443",
        "Proxy-Connection" : "keep-alive",
        "Accept" : "*/*",
        "Accept-Encoding" : "gzip, deflate",
        "Accept-Language" : "en;q=1, fr;q=0.9, de;q=0.8, zh-Hans;q=0.7, zh-Hant;q=0.6, ja;q=0.5",
        "Content-Type" : "application/json; charset=utf-8",
        "Connection" : "keep-alive"
      })
    .type('json')
    .send(json)
    .end(function (response) {
      console.log("uber body: "+response.body);
      var nearby = response.body["nearbyVehicles"]
      console.log("nearby : "+(nearby))
      console.log(JSON.stringify(nearby))
      for (x in nearby) {
        if (x["vehiclePaths"]) {
          delete x["vehiclePaths"];
        }
      }
      callback("uber", response.body ? response.body["nearbyVehicles"] : {})
    });
  }
};

function hashPassword(password) {
  var pw = password.toString("utf8")
  var buffer = '';
  for (var i = 0, len = pw.length; i < len; i++) {

    buffer += crypto.createHash('md5').update(pw[i]).digest('hex');
  }
  return crypto.createHash('md5').update(buffer.toLowerCase()).digest('hex').toLowerCase();
}

function sendMessage(messageType, email, location, params, callback) {
  var json = {
      'messageType' : messageType,
      'epoch' : (new Date).getTime(),
      'version' : "2.33.0",
      'language' : 'en',
      'app' : 'client',
      'email' : email,
      'latitude' : location['lat'],
      'longitude' : location['lon']
  }

  for(var key in params) {
    json[key] = params[key];
  }

  unirest.post(UBER_ENDPOINT)
    .type('json')
    .send(json)
    .end(function (response) {
      callback(response);
    });
}
