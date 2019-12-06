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
    "endpoint": "https://fcm.googleapis.com/fcm/send/fR7yVPta0y8:APA91bHAqe1_k_g_jy27sJSM9BzTkIzugVVy-18vNz_xhe_ecUCswBvyVgCLZz-lIH5PDVV67W2yfA12al5E5sP6ceNxei79NI_HAKkUp__Ry6c_qzSl-91P4KOCBWtIgRTJsMa29d0R",
    "keys": {
        "p256dh": "BME5wiqDQeh95RDLuKT1uR7H7KQSaPuMOKMggrRIvL4ouEK4Guyono1MMVPqjjYBZDzOrCoL1RUOv4UmW96sk/g=",
        "auth": "gsN1QYntFJy7IFJ+Uj8xXQ=="
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