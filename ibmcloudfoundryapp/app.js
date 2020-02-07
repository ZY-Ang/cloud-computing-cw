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
const PersonalityInsightsV3 = require('ibm-watson/personality-insights/v3');
const {IamAuthenticator} = require('ibm-watson/auth');
const {PythonShell} = require('python-shell');
const {execSync} = require('child_process');

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
let hasDB = false;
let watsonConnect = false;
let watsonapi;
const watsonPiEndpoint = 'https://gateway.watsonplatform.net/personality-insights/api/';
let pythonOptions = {};

try {
    const stdout = execSync(process.platform === "win32" ? 'where python' : 'which python').toString();
    pythonOptions = {
        mode: 'text',
        pythonPath: stdout.trim(),
        pythonOptions: ['-u'],
        args: []
    };
} catch (err) {
    throw new Error("Error finding python directory: " + err.message);
}

if (process.env.VCAP_SERVICES) {
    const env = JSON.parse(process.env.VCAP_SERVICES);
	if (env['dashDB For Transactions']) {
        hasDB = true;
		db2 = env['dashDB For Transactions'][0].credentials;
	}
	if (env['personality_insights']) {
        watsonConnect = true;
        /**
         * http://watson-developer-cloud.github.io/node-sdk/debug/classes/personalityinsightsv3.html#options
         * @type {PersonalityInsightsV3}
         */
        watsonapi = new PersonalityInsightsV3({
            authenticator: new IamAuthenticator({apikey: env['personality_insights'][0].credentials.apikey}),
            version: '2017-10-13',
            url: watsonPiEndpoint
        });
    }
}

if (!hasDB && process.env.db2) {
    db2 = process.env.db2;
} else if (!hasDB) {
    throw new Error("Please set db2 environment variable");
}

const connString = "DRIVER={DB2};DATABASE=" + db2.db + ";UID=" + db2.username + ";PWD=" + db2.password + ";HOSTNAME=" + db2.hostname + ";port=" + db2.port;

if (!watsonConnect && process.env.piApiKey) {
    watsonapi = new PersonalityInsightsV3({
        authenticator: new IamAuthenticator({apikey: process.env.piApiKey}),
        version: '2017-10-13',
        url: watsonPiEndpoint
    });
} else if (!watsonConnect) {
    throw new Error("Please set personalityInsightsApiKey environment variable");
}

const uploading = multer({storage: multer.memoryStorage()});

app.get('/', routes.default);
app.get('/lab1q5', routes.listSysTables(ibmdb, connString));
app.get('/lab1q6', routes.watsonForm);
app.get('/lab1q7', routes.listTestTable(ibmdb, connString));
app.get('/lab1q8', routes.pythonTest(PythonShell, pythonOptions));
app.post('/lab1q6', uploading.single('file'), routes.watsonResponse(watsonapi));

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
