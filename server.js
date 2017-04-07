var express = require("express");
var request = require('request');
var app = express();

//define our host name and our source's host name
var source_host = "respecttheshoes.blogspot.com"
var our_host = "localhost:8080";

//handle all incoming requests
app.get('*', function (req, res) {

	//pass through incoming headers and query data to the new request
	var options = {

		uri : "https://"+source_host+req.path,
		gzip : true,
		qs : req.query,
		method : 'GET',
		headers : req.headers

	}; // end of options object

	//fix some key items (namely the host and referer)
	options.headers.host = source_host;
	options.headers.referer = source_host;

	//make the external request to the source host
	request(options, function(error, response, body) {

		//if something went wrong send that back to the client and log it
		if(error) {

			console.log(error);
			res.send(error);

		} else {
			
			//modify the body to point things back to ourselves (only do this for text)
			if(response.headers['content-type'].indexOf("text") !== -1) {
				body = body.split(source_host).join(our_host);
				body = body.split('https://').join('http://');
			}
			console.log(response.headers['content-type']);
			
			//delete the headers associated with gzip (or better yet - figure out how to gzip things back up)
			delete response.headers["content-encoding"];
			delete response.headers['content-length'];

			//pass through the headers we got from the source (minus the modificaitons from above)
			//console.log(response.headers);
			res.writeHead(200);
			res.end(body);

		} //end of successful request

	}); //end of request

}); //end of app.get

 var port = 8080;
 app.listen(port, function() {
   console.log("Listening on " + port);
 });