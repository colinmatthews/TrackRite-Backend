// Copyright 2017 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START gae_node_request_example]
const express = require('express');
const cookieParser = require('cookie-parser')();
const cors = require('cors');
const corsOptions = {
    origin: 'http://localhost:8080',
    methods: ['GET','POST','PUT','DELETE'],
    allowedHeaders: ['Origin','X-Requested-With','contentType','Content-Type','Accept','Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
}
var admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert('trackrite-218deb87e9a8.json')
});



const app = express();
app.use(cors(corsOptions));

const validateFirebaseIdToken = async (req, res, next) => {
  //console.log('Check if request is authorized with Firebase ID token');

  if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
      !(req.cookies && req.cookies.__session)) {
    console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
        'Make sure you authorize your request by providing the following HTTP header:',
        'Authorization: Bearer <Firebase ID Token>',
        'or by passing a "__session" cookie.');
    res.status(403).send('Unauthorized');
    return;
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    //console.log('Found "Authorization" header');
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else if(req.cookies) {
    //console.log('Found "__session" cookie');
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    // No cookie
    res.status(403).send('Unauthorized');
    return;
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    //console.log('ID Token correctly decoded', decodedIdToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error);
    res.status(403).send('Unauthorized');
    return;
  }
};


app.use(cookieParser);
app.use(validateFirebaseIdToken);
app.use(express.json());

// Start the server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  //console.log(`App listening on port ${PORT}`);
  //console.log('Press Ctrl+C to quit.');
});
// [END gae_node_request_example]

let projectsRoutes = require("./projects/projects.js")
let taskRoutes = require("./tasks/tasks.js")
let userRoutes = require("./users/users.js")
let dashboardRoutes = require("./dashboard/dashboard.js")

app.use('/projects',projectsRoutes)
app.use('/tasks',taskRoutes)
app.use('/users',userRoutes)
app.use('/dashboard',dashboardRoutes)

module.exports = app;
