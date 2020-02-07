//------------------------------------------------------------------------------
// Copyright 2016 IBM Corp. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//------------------------------------------------------------------------------

const express = require('express');
const routes = require('./routes');
const http = require('http');
const path = require('path');
const ibmdb = require('ibm_db');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cfenv = require('cfenv');
const multer = require('multer');
const PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');


const app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan('tiny'));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(cookieParser('your secret here'));
// app.use(session());
app.use(express.static(path.join(__dirname, 'public')));
let db2;
let hasConnect = false;
let watsonConnect = false;
let watsonpi;

// development only
// if ('development' === app.get('env')) {
  // app.use(express.errorHandler());
// }

if (process.env.VCAP_SERVICES) {
    const env = JSON.parse(process.env.VCAP_SERVICES);
	if (env['dashDB For Transactions']) {
        hasConnect = true;
		db2 = env['dashDB For Transactions'][0].credentials;
	}
}

if (!hasConnect && process.env.db2) {
    db2 = process.env.db2;
} else if (!hasConnect) {
    throw new Error("Please set db2 environment variable");
}

const connString = "DRIVER={DB2};DATABASE=" + db2.db + ";UID=" + db2.username + ";PWD=" + db2.password + ";HOSTNAME=" + db2.hostname + ";port=" + db2.port;

let personalityInsights = new PersonalityInsightsV3({
    version: '2017-10-13',
    iam_apikey: '6Qee_EwWEKIhG17iNzGoKhiJbiVmzCE_NtYKn1jdP2Up',
    url: 'https://gateway.watsonplatform.net/personality-insights/api'
});
const uploading = multer({storage: multer.memoryStorage()});

app.get('/', routes.default);
app.get('/q5', routes.listSysTables(ibmdb,connString));
app.get('/q6', routes.watsonForm);
app.post('/q6', uploading.single('file'), (req, res) => {
    console.log("file");
    const txtFile = req.file.buffer.toString();
    console.log(txtFile);

    personalityInsights.profile({content: txtFile}, (error, result) => {
        if (error) {
            console.error(error);
            res.status(500).send(error.message);
        } else {
            res.send(result);
        }
    });
});
app.set('json spaces', 4);

if (app.get('env') === 'development') {
    http.createServer(app).listen(app.get('port'), () => {
        console.log('Express server starting in development mode listening on port ' + app.get('port'));
    });
} else {
    const appEnv = cfenv.getAppEnv();
    app.listen(appEnv.port, '0.0.0.0', () => {
        // print a message when the server starts listening
        console.log("Server starting on " + appEnv.url);
    });
}

//---Deployment Tracker---------------------------------------------------------
require('cf-deployment-tracker-client').track();
