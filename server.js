var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000

import bodyParser from 'body-parser'  

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var routes = require('./api/routes/mainRoutes');
routes(app);

app.listen(port);

console.log('AuditLog API started on: ' + port);