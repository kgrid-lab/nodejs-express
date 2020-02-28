var createError = require('http-errors');
var express = require('express');
const path = require('path');
const fs = require('fs-extra')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
const commandLineArgs = require('command-line-args')
const configJson = require('./config.json')

const optionDefinitions = [
  { name: 'shelf', alias: 's', type: String, defaultOption: false },
  { name: 'development', alias:'D', type: Boolean}
]
const options = commandLineArgs(optionDefinitions, { partial: true })

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var kosRouter = require('./routes/kos');
var epsRouter = require('./routes/eps');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// app locals
var shelfPath = options.shelf || path.join(process.cwd(),'shelf')
fs.ensureDirSync(shelfPath)
var registryFile = path.join(shelfPath,"koregistry.json")
if(!fs.pathExistsSync(registryFile)){
  fs.ensureFileSync(registryFile)
  fs.writeJSONSync(registryFile, {},{spaces: 4} )
}
var packageFile = path.join(shelfPath,"package.json")
if(!fs.pathExistsSync(packageFile)){
  fs.ensureFileSync(packageFile)
  fs.writeJSONSync(packageFile, {	"name":"expressactivatorshelf"},{spaces: 4} )
}



app.locals.shelf=shelfPath
app.locals.devMode = options.development || false
app.locals.endpoints={}
app.locals.kobjects={}
app.locals.settings = configJson

app.use(cors())
if(process.env.DEBUG){
  app.use(logger('dev'))
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/kos', kosRouter);
app.use('/eps', epsRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
