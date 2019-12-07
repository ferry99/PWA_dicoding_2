var webPush = require('web-push');
const vapidKeys = {
    "publicKey": "BFXF8ujq08jzPiIuqVbzzKicwXUaDaVaXkWkqQWuJsP3m94mpHNStzjuuIKwmlYHFOnNHO6nFd0-NAirpsesb14",
    "privateKey": "jE5i0kUHU36rByhvjflL0aCiR1CBnsZ4wQHrvHfZwGY"
};
 
 
webPush.setVapidDetails(
    'mailto:example@yourdomain.org',
    vapidKeys.publicKey,
    vapidKeys.privateKey
)
var pushSubscription = {
    "endpoint": "https://fcm.googleapis.com/fcm/send/fcJhrkSx9l8:APA91bGvOvaibhCTdBi4zmFftrwtbsK-_TO7zrSF6mFXg3cYQmnh0SKGOIVstV0xG-rPqE1SkZgbVyJd_arIkvZMY7Qq27xhdJM89zi1uOtGw2oFZ7kfroDyxlyswU2iMPIw4UH9jm2J",
    "keys": {
        "p256dh": "BBUO8Bnev+JLZoSCrELdquvdnumqSjwRcSa3CL0bGJSRWVvuzObGxOz+vAw+r6GZBrHf29+Xp0ov5d81WKmM9zQ=",
        "auth": "CH3V+NNuGZA1jcN/3H5iAw=="
    }
};
var payload = 'Selamat! Aplikasi Anda sudah dapat menerima push notifikasi!';
var options = {
    gcmAPIKey: '502323881592',
    TTL: 60
};
webPush.sendNotification(
    pushSubscription,
    payload,
    options
);