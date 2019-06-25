var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
var debug = require('debug')('node-socket-cluster:server');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const numCPUs = require('os').cpus().length
const cluster = require('cluster');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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

// module.exports = app;

if (cluster.isMaster) {
  console.log(`마스터 프로세스 아이디: ${process.pid}`);

  //cpu 갯수만큼 워커를 생산
  for(let i=0; i<numCPUs; i++) {
    cluster.fork()
  }

  //워커가 종료되었을때
  cluster.on('exit', (worker, code, signal) => {
    console.log(`${worker.process.pid}번 워커가 종료되었습니다 곧 다시 부활.`);
    cluster.fork()
  })
  
} else {
  // 워커들이 포트에서 대기
  
  /**
   * Get port from environment and store in Express.
   */
  app.set('port', process.env.PORT || '3000');

  var server = http.listen(app.get('port'), function() {
    debug("Express server listening on port "+ server.address().port)
  })
  var redis = require('socket.io-redis');
  io.adapter(redis({ host: 'localhost', port: 6379 }));


  io.on('connection', function(socket) {
    console.log(socket.id,"!@#!@");
    socket.emit('my_connection', {process: process.pid})
    socket.join('cluster')
    socket.to('cluster').emit('re_connection', {id: socket.id, process: process.pid})
    
    socket.on('disconnect', function() {
      console.log('disconnect');
      
    })
  })

  console.log(`${process.pid}번 워커가 실행`);
  
}
