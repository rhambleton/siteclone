var http = require('http');
var fs = require('fs');

//The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
var options = {
  host: 'www.google.com',
  path: '/search?q=inurl:blogspot+cars&*'
};

callback = function(response) {
  var str = '';

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {

  	fs.writeFile("default.html", str, function(err) {
	    if(err) {
	        return console.log(err);
	    }

	    console.log("The file was saved!");
		}); 
  });
}

http.request(options, callback).end();