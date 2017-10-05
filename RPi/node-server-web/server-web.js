var express = require('express');
var path = require('path');
var app = express();

var mongodb = require('mongodb');

var MongoClient = mongodb.MongoClient;
var tempDbUrl = 'mongodb://localhost:27017/sensors';
var db;

MongoClient.connect(tempDbUrl, function (err, database) {
	if (err) {
		console.log('Unable to connect to the mongoDB server. Error:', err);
	} else {
		db = database;

		app.listen(4545, function () {
		  console.log('App listening on port 4545!');
		});
	}
});

app.use(express.static('public'));

app.get('/data', function (req, res) {  
	var collection = db.collection('temps');	
	collection.aggregate([
		{
			$group : {
				 _id : { device_id: "$device_id", year: { $year: "$date" }, month: { $month: "$date" }, day: { $dayOfMonth: "$date" }, hour: { $hour: "$date" } },
				 temperature : {$avg : "$temperature"},
				 humidity : {$avg : "$humidity"}
			}
		},
		{
			$sort : { "_id.year" : -1, "_id.month": -1, "_id.day": -1, "_id.hour": -1 }
		},
		{
			$limit : 500
		}
	]).toArray(function(err, items) {
		var output = [];
		items.forEach(function(item) {
			output.push({
				date: Date.UTC(item._id.year, item._id.month - 1, item._id.day, item._id.hour),
				device_id: item._id.device_id,
				temperature: item.temperature.toFixed(2) * 1,
				humidity: item.humidity.toFixed(2) * 1
			});
		});
		
		res.header("Content-Type", "application/json");
		res.end(JSON.stringify(output));
	});
});

app.get('/debug', function (req, res) {  
	var collection = db.collection('temps');	
	collection.aggregate([
		{
			$group : {
				 _id : { device_id: "$device_id", year: { $year: "$date" }, month: { $month: "$date" }, day: { $dayOfMonth: "$date" }, hour: { $hour: "$date" } },
				 temperature : {$avg : "$temperature"},
				 humidity : {$avg : "$humidity"}
			}
		},
		{
			$sort : { "_id.year" : -1, "_id.month": -1, "_id.day": -1, "_id.hour": -1 }
		},
		{
			$limit : 100
		}
	]).toArray(function(err, items) {
		var output = 'Last 100 temperature values: <br />' ;
		items.forEach(function(item) {
			var formatted_date = item._id.day + '.' + item._id.month + '.' + item._id.year + '. - ' + item._id.hour + 'h';
			output += '<div style="border: .1px solid #900; border-bottom: none;">Date: ' + formatted_date
				+ ';   Device id: ' + item._id.device_id
				+ ';   Humidity: ' + item.humidity.toFixed(2) + '%'
				+ ';   Temperature: ' + item.temperature.toFixed(2)
				+ '</div>';
		});
		
		res.header("Content-Type", "text/html");
		res.end(output);
	});
});
