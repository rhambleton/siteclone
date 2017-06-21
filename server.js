var express = require("express");
var request = require("request");
var prcs = require("child_process");
var fs = require("fs");
var app = express();


//define our host name and our source's host name
var source_host = "";

//read the contents of the host data file
source_host = fs.readFileSync("./sourceHost.dat", "utf8");

//check if the file was empty
if(source_host == "") {

	//log the fact we don't have a server to the console
	console.log("No Server Selected - Getting One...");

	//get a server from the bash script
	prcs.execSync('bash ./getHost.sh');

	//reread the file to get the server
	source_host = fs.readFileSync("./sourceHost.dat", "utf8");

}

//remove the http or https
source_host = source_host.replace(/(^\w+:|^)\/\//, '');

//log the server we are using the console
console.log("Using Host: "+source_host);

//define our server
var our_host = "localhost:8080";


//handle an incoming request to update the site
app.get('/admin/regen', function (req, res) {

	//clear contents of sourceHost.dat
	fs.writeFile("./sourceHost.dat", "", function(err) {

	//get a new server from the bash script
	prcs.execSync('bash ./getHost.sh');

	//reread the file to get the server
	source_host = fs.readFileSync("./sourceHost.dat", "utf8");

	//remove the http or https
	source_host = source_host.replace(/(^\w+:|^)\/\//, '');

	res.send("New Host: "+source_host);

	}); // end of writefile callback

}); //end of app.get to regen the site

//handle all other incoming requests
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