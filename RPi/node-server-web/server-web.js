var http = require("http");
var mongodb = require('mongodb');

const PORT=4545;

var MongoClient = mongodb.MongoClient;
var tempDbUrl = 'mongodb://localhost:27017/sensors';

function handleRequest(request, response) {

	MongoClient.connect(tempDbUrl, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			//HURRAY!! We are connected. :)
			//console.log('Connection established to', tempDbUrl);

			var collection = db.collection('temps');

			collection.find().sort({ '_id': -1 }).limit(100).toArray(function(err, items) {
				//console.log(items);
				var output = 'Last 100 temperature values: <br />' ;
				items.forEach(function(item) {
					var d = item._id.getTimestamp();
					var formatted_date = d.getDate() + '.' + (d.getMonth() + 1) + '.' + (d.getYear() + 1900) + '. - ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + 'h';
					output += '<div style="border: .1px solid #900; border-bottom: none;">Date: ' + formatted_date
						+ ';   Device id: ' + item.device_id
						+ ';   Humidity: ' + item.humidity.toFixed(2) + '%'
						+ ';   Temperature: ' + item.temperature.toFixed(2)
						+ '</div>';
				});

				response.writeHeader(200, {"Content-Type": "text/html"});  
				response.end(output);
			});
			
			//Close connection
			db.close();
		}
	});

}

var server = http.createServer(handleRequest);

server.listen(PORT, function() {
	console.log("Server listening on: :" + PORT);
});
