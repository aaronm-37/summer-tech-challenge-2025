var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var operationsRouter = require('./routes/operations');
var receiversRouter = require('./routes/receivers');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/operations', operationsRouter);
app.use('/receivers', receiversRouter);

// If this file is run directly, start the server (useful for `npm run dev`).
if (require.main === module) {
	var port = process.env.PORT || 3000;
	app.listen(port, function() {
		console.log('Express server listening on port ' + port);
	});
}

module.exports = app;
