 var mongodb = require('mongodb');

 var NRF24 = require("./index"),
     spiDev = "/dev/spidev0.0",
     cePin = 17,
     irqPin = 25,
     pipes = [0xF0F0F0F0D2],
     role = 'ping';

 var nrf = NRF24.connect(spiDev, cePin);
 var MongoClient = mongodb.MongoClient;
 var tempDbUrl = 'mongodb://localhost:27017/sensors';
 var db_save_interval = 30000;
 var db;

 MongoClient.connect(tempDbUrl, function(err, database) {
     if (err) {
         console.log('Unable to connect to the mongoDB server. Error:', err);
     } else {
         db = database;

         startListeningForSensors();
     }
 });

 var startListeningForSensors = function() {
     nrf.channel(0x76).crcBytes(2).transmitPower('PA_MAX').autoRetransmit({
         count: 15,
         delay: 4000
     }).begin(function() {
         var rx = nrf.openPipe('rx', 0xE8E8F0F0E2);

console.log('test');


         rx.on('data', function(d) {
console.log(d);
             if (!(d[0] == 66 && d[1] == 66 && d[2] == 66 && d[3] == 66)) {
                 var device_id = d.slice(8, 12).readUInt32BE(0);
                 var collection = db.collection('temps');
                 var latest_from_device = collection.find({
                     'device_id': device_id
                 }).sort({
                     '_id': -1
                 }).limit(1).toArray(function(err, items) {
                     if ((items && (new Date() - items[0]._id.getTimestamp()) > db_save_interval) || !items) {
                         var humidity = d.slice(0, 4).readFloatBE(0);
                         var temperature = d.slice(4, 8).readFloatBE(0);

                         var newSensorData = {
                             date: new Date(),
                             temperature: temperature,
                             humidity: humidity,
                             device_id: device_id
                         };

                         collection.insert(newSensorData, function(err, result) {
                             if (err) {
                                 console.log(err);
                             } else {
                                 console.log('Inserted %d documents into the "temps" collection. The result: ', result.result.n, result);
                             }
                         });
                     }
                 });
             }
         });
     });
 }