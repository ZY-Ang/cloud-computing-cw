/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {

	// print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});

var multer = require('multer');

var PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');

var personalityInsights = new PersonalityInsightsV3({
    version: '2017-10-13',
    iam_apikey: '6Qee_EwWEKIhG17iNzGoKhiJbiVmzCE_NtYKn1jdP2Up',
    url: 'https://gateway.watsonplatform.net/personality-insights/api'
});

var uploading = multer({
    storage: multer.memoryStorage()
});

app.set('json spaces', 4);

app.post('/upload', uploading.single('file'), function (request, response) {
    console.log("file");
    var txtFile = request.file.buffer.toString();
    console.log(request.file.buffer);

    personalityInsights.profile({
        text: txtFile },
        function (error, result) {
            if (error) {
                response.send(error);
            }
            else {
				response.json(result);				
            }
        }
    );
});


//---Deployment Tracker---------------------------------------------------------
require('cf-deployment-tracker-client').track();
