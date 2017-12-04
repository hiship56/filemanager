/*----------------------------------------------------------
 | 1) 모듈참조
 -----------------------------------------------------------*/
var config = require('./helper/_config.js');
var log_helper = require('./helper/log_helper.js');
var web_helper = require('./helper/web_helper.js');
var file_helper = require('./helper/file_helper.js');
var routes = require('./routes.js');
// npm install express --save
var express = require('express');
// node 내장 모듈
var url = require('url');
// npm install express-useragent --save
var useragent = require('express-useragent');
// node 내장 모듈
var path = require('path');
// npm install serve-static --save
var static = require('serve-static');
// npm install serve-favicon --save
var favicon = require('serve-favicon');
// npm install body-parser --save
var bodyParser = require('body-parser');
// npm install method-override --save
var methodOverride = require('method-override');
// npm install cookie-parser --save
var cookieParser = require('cookie-parser');
// npm install express-session --save
var expressSession = require('express-session');
var mongoose    = require('mongoose');
var mongoStore = require('connect-mongo')(expressSession);
    /*----------------------------------------------------------
     | 2) Express 객체 생성
     -----------------------------------------------------------*/
    var app = express();

    // [ CONFIGURE mongoose ]

	mongoose.Promise = global.Promise;

    var promise = mongoose.connect('mongodb://localhost/mongodb_tutorial', {
        useMongoClient: true
    });

    // CONNECT TO MONGODB SERVER
    var db = mongoose.connection;
    db.on('error', console.error);
    db.once('open', function(){
        // CONNECTED TO MONGODB SERVER
        log_helper.debug("Connected to mongod server");
    });

    var http = require('http'); 

    

    



    /*----------------------------------------------------------
     | 3) 클라이언트의 접속이 발생한 경우 호출됨.
     -----------------------------------------------------------*/
    /** UserAgent 모듈 탑재 */
    //  --> 미들웨어의 콜백함수에 전달되는 req, res객체를 확장하기 때문에
    //      다른 모듈들보다 먼저 설정되어야 한다.
    app.use(useragent.express());

    app.use(function(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        res.setHeader('Access-Control-Allow-Credentials', true);
        //log_helper.debug("클라이언트가 접속했습니다. >> %s", req.originalUrl);
		
        var ext = req.url.substring(req.url.lastIndexOf('.')+1).toLowerCase();
        var noitems = ['ico','css','js','gif','jpg','png'];

        // favicon에 대한 요청이 아닌 경우만 로그 남기기
        if(noitems.indexOf(ext) < 0) {
            // 클라이언트가 접속한 시간 측정
            var begin = Date.now();

            /** (1) 접속 발생시 사용자 정보 남기기 */
            log_helper.debug("------------ client connection ------------");

            // 클라이언트의 IP주소
            var ip = req.headers['x-forwarded-for'] ||
                        req.connection.remoteAddress ||
                        req.socket.remoteAddress ||
                        req.connection.socket.remoteAddress;

            // 클라이언트의 디바이스 정보 기록 (UserAgent 사용)
            log_helper.debug('[client] %s / %s / %s (%s) / %s',
                                ip, req.useragent.os, req.useragent.browser,
                                req.useragent.version, req.useragent.platform);

            /** (2) 사용자가 접속한 페이지 주소 남기기 */
            // 전송방식과 URL
            var current_url = url.format({
                protocol: req.protocol,     // http://
                host: req.get('host'),      // localhost
                port: req.port,             // :3000
                pathname: req.originalUrl   // /hello_static.html
            });
            log_helper.debug("[http %s] %s", req.method, decodeURIComponent(current_url));

            /** (3) 접속 종료시 전체 수행시간 남기기 */
            res.on('finish', function() {
                var end = Date.now();   // 접속 종료시간
                var time = end - begin; // 종료시간-시작시간 ==> 실행시간
                log_helper.debug('[runtime] %dms', time);
                log_helper.debug("---------- client disconnection ------------");
                log_helper.debug(); // 빈 줄 표시
            });
        }

        next(); // URL요청에 맞는 다음 미들웨어로 제어를 넘김
    });

    /*----------------------------------------------------------
     | 4) Express 객체의 기본 설정
     -----------------------------------------------------------*/
    /** POST 파라미터 수신 모듈 설정.
       추가 모듈들 중 UserAgent를 제외하고 가장 먼저 설정해야 함 */
    // body-parser를 이용해 application/x-www-form-urlencoded 파싱
    // extended: true --> 지속적 사용.
    // extended: false --> 한번만 사용.
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.text());     // TEXT형식의 파라미터 수신 가능.
    app.use(bodyParser.json());     // JSON형식의 파라미터 수신 가능.

    /** HTTP 전송방식 확장 */
    app.use(methodOverride('X-HTTP-Method'));          // Microsoft
    app.use(methodOverride('X-HTTP-Method-Override')); // Google/GData
    app.use(methodOverride('X-Method-Override'));      // IBM
    app.use(methodOverride('_method'));                // HTML form

    // 생성자 파라미터는 쿠키 암호화 처리에 사용되는 키값
    app.use(cookieParser(config.secure.cookie_encrypt_key));

    // 세션 설정
    app.use(expressSession({
        // 암호화 키
        secret: config.secure.session_encrypt_key,
        // 세션을 쿠키 상태로 노출시킬지 여부
        resave: false,
        // 세션이 저장되기 전에 uninitialized 상태로 미리 만들어서 저장
        saveUninitialized: false,
		cookie: { maxAge: 3*60*60*1000 }, 
        // db세션 사용.
		store: new mongoStore({ mongooseConnection: db })
        //store: new expressMysqlSession(config.database)
    }));





    /** 업로드 설정 */
    // 파일이 저장될 경로를 생성
    file_helper.mkdirs(config.upload.dir);
    // 파일이 저장될 경로를 URL에 연결
    app.use(config.upload.path, static(config.upload.dir));

    /** WebHelper를 통한 req, res 객체의 기능 확장 */
    app.use(web_helper());

    /** HTML파일들이 노출될 경로 지정하기 */
    // --> "http://<hostname>:<port>/폴더명/파일명" 형식으로 public 폴더의 자원에 접근 가능.
    //var public_path = path.join(__dirname, '../public');
    //app.use(static(public_path));
    app.use(static(config.public_path));

    /** favicon 설정 */
    //app.use(favicon(public_path + '/favicon.png'));
    app.use(favicon(config.favicon_path));

    /** 라우터 객체 설정 */
    var router = express.Router();
    // 라우터 객체를 app 객체에 등록 --> 에러핸들러보다 먼저 추가되어야 함.
    app.use('/', router);



    /*----------------------------------------------------------
     | 5) Express서버에 각 URL별 미들웨어(페이지) 구성
     -----------------------------------------------------------*/
    // routes.js 파일에 정의된 항목들에 대한 반복 처리
    routes.forEach(function(item, index) {
        /** 참조할 함수 찾기 */
        var controller = require(item.src);         // src값을 사용하여 JS 소스파일 로드하기
        var module_name = item.module.split(".");   // 함수이름의 "."을 기준으로 하여 배열로 분리
        var module = null;                          // 로드해야 할 함수에 대한 참조 변수

        // 분리된 배열의 길이가 1이라면? --> 이름에 "."이 없다면?
        if (module_name.length == 1) {
            // JS소스에서 함수 이름을 사용하여 function참조
            module = controller[item.module];
        } else {
            // 분리된 배열을 사용하여 참조할 함수에 계층적으로 접근
            module = controller[module_name[0]][module_name[1]];
        }

        /** 참조할 함수를 routes.js 파일에서 명시한 전송방식에 따라 route 처리 */
        switch (item.method.toLowerCase()) {
            case 'get':
                router.route(item.path).get(module);
                break;
            case 'post':
                router.route(item.path).post(module);
                break;
            case 'put':
                router.route(item.path).put(module);
                break;
            case 'delete':
                router.route(item.path).delete(module);
                break;
            default:
                router.route(item.path).all(module);
                break;
        }

        /** 어떤 기능이 로드되었는지 로그로 기록 */
        //log_helper.debug('module loaded :: %s >> %s', item.method, item.path);
    });

    // 서버의 500에러에 대한 응답 처리
    app.use(function (err, req, res, next) {
        res.sendError("서버의 응답이 잘못되었습니다. 관리자에게 문의하세요.", err);
    });

    // 정의되지 않은 URL인 경우에 대한 응답 처리
    app.use("*", function(req, res, next) {
        res.sendNotFound("페이지를 찾을 수 없습니다.");
    });



    /*----------------------------------------------------------
     | 6) 설정한 내용을 기반으로 서버 구동 시작
     -----------------------------------------------------------*/
   
    var httpServer =http.createServer(app).listen(config.server_port, function(req,res){
		log_helper.debug('----------------------');
        log_helper.debug('|Start Express Server|');
        log_helper.debug('----------------------');
      	log_helper.debug('Socket IO server has been started');
    });
 

    // upgrade http server to socket.io server
    var io = require('socket.io').listen(httpServer);
    var players = [];

	// 서버와 클라이언트 연결
	io.on('connection', function(socket){
		var EveryChat = require('./models/everyChat');
    	var OneChat = require('./models/oneChat');
		// 전체 채팅 메시지 수신
		socket.on('every', function(user, data){
			// 전체 클라이언트에게 전달
			io.emit('every', user, data);
			//db 저장
			var everyChat = new EveryChat();
			everyChat.user_id = user;
			everyChat.data = data;
			everyChat.save(function(err){
				if(err){
					console.error(err);
				}
			});
		});
		
		//전체 채팅 관련 데이터 불러오기
		socket.on('readEvery', function(){
			//db조회
			EveryChat.find(function(err, everychats){
				if(err) {
					console.error(err);
				}
				
				if(everychats.length < 1) {
					return false;
				} else {
					for (var i = 0; i < everychats.length; i++) {
						socket.emit('every', everychats[i].user_id, everychats[i].data);
					}
				}
				
			});
			
		});
		
		// 귓속말 채팅 메시지 수신
		socket.on('one', function(me, you, data){
			var none = [];
			for(var i=0; i<players.length; i++) {
				var p = players[i];
				console.log(p.id);
				if (p.id == you) {
					none.push(p.socket);
				}	
			}
			console.log(none[0]);
			console.log(none.length);
			setTimeout(function() {
				if (none.length > 0) {
					socket.emit('one', me, you, data);
					io.to(none[0]).emit('one', me, you, data);
				} else {
					socket.emit('one', me, you, you+"님은 현재 로그아웃 상태입니다. 메세지는 전달됩니다. 보낸 메세지 : "+data, 'check');
				}
			}, 50);
			
			
			//db 저장
			var oneChat = new OneChat();
			oneChat.me = me;
			oneChat.you = you;
			oneChat.data = data;
			oneChat.save(function(err){
				if(err){
					console.error(err);
				}
			});
		});
		
		
		// 귓속말 관련 데이터 불러오기
		socket.on('readOne', function(user){
			var player = {};
            player.id = user;
            player.socket = socket.id;
            players.push(player);
			//db조회
			OneChat.find({ $or: [ { 'me': user }, { 'you': user } ] }, function(err, onechats){
				if(err) {
					console.error(err);
				}
				
				if(onechats.length < 1) {
					return false;
				} else {
					for (var i = 0; i < onechats.length; i++) {
						socket.emit('one', onechats[i].me, onechats[i].you, onechats[i].data);
					}
				}
				
			});
		});
		
		// 클라이언트 연결 종료 시 해당 정보 삭제
		socket.on('disconnect', function() { 
			for(var i=0; i<players.length; ++i ) {
				var p = players[i];
				if(p.socket == socket.id){
					players.splice(i,1);
					break;
				}
			}
		});
	});

	