/*----------------------------------------------------------
 | /helper/log_helper.js
 |----------------------------------------------------------
 |  공통 로그 처리 모듈
 -----------------------------------------------------------*/

/** (1) 모듈참조 */
var config = require('./_config.js');
var file_helper = require('./file_helper.js');// 로그 처리 모듈
// --> npm install winston --save
// --> https://github.com/winstonjs/winston
var winston = require('winston');
// 로그 일별 처리 모듈: npm install winston-daily-rotate-file --save
var winstonDaily = require('winston-daily-rotate-file');
// 날짜,시간 처리 모듈: npm install moment --save
var moment = require('moment');

/** (2) 환경설정 파일에서 정의한 로그 저장 경로를 생성한다. */
file_helper.mkdirs(config.log.debug.path);
file_helper.mkdirs(config.log.error.path);

/** (3) moment 모듈을 통해 시간형식을 구성하여 리턴하는 함수 */
function timeStampFormat() {
    // '16/05/01 20:14:28.500'
    var time = moment().format('YY/MM/DD HH:mm:ss.SSS');
    // --> 17/06/14 19:58:22.881 [pid:4436]
    return time + ' [pid:' + process.pid + ']';
}

/** (4) 사용자 정의 로그 수준 및 색상 정의 */
var levelConfig = {
    levels: {
        error: 0, warn: 1, info: 2, debug: 3, mongo: 4, verbose: 5,
    },
    colors: {
        error: 'red', warn: 'yellow', info: 'green', debug: 'blue',
        mongo: 'gray', verbose: 'grey'
    }
};

/** (5) winston 객체 만들기 */
var logger = new(winston.Logger)({
    // 로그수준+색상 정의
    levels: levelConfig.levels,
    colors: levelConfig.colors,
    // 로그 처리 규칙 정의
    transports: [
        // 로그 규칙 정의 --> 콘솔에 출력함
        new(winston.transports.Console)({
            name: 'debug-console',          // 로그 규칙의 이름
            colorize: true,                 // 색상처리 함
            level: config.log.debug.level,  // 남길 로그의 최소 수준
            showLevel: true,
            json: false,
            prettyPrint: true,
            timestamp: timeStampFormat      // 미리 정의한 함수를 연결한다.
        }),
        // 로그 규칙 정의 --> 하루에 하나씩 파일로 기록함
        new(winstonDaily)({
            name: 'debug-file', 
            colorize: false, 
            level: config.log.debug.level, 
            showLevel: true,
            json: false,
            prettyPrint: true,
            timestamp: timeStampFormat,     // 미리 정의한 함수를 연결한다.
            filename: config.log.debug.path + '/log', // 로그 저장 경로/파일명
            datePattern: '_yyyy-MM-dd.log', // 저장경로 뒤의 이름형식
            maxsize: 50000000, // 최대용량
            maxFiles: 1000 // 최대 파일 수
        })
    ],

    // 프로그램에 에러가 발생한 경우 상세 정보를 강제로 별도의 파일에 기록.
    exceptionHandlers: [
        // 로그 규칙 정의 --> 콘솔에 출력함
        new(winston.transports.Console)({
            name: 'error-console',          // 로그 규칙의 이름
            colorize: true,                 // 색상처리 함
            level: config.log.error.level,  // 남길 로그의 최소 수준
            showLevel: true,
            json: false,
            prettyPrint: true,
            timestamp: timeStampFormat
        }),
        // 로그 규칙 정의 --> 하루에 하나씩 파일로 기록함
        new(winstonDaily)({
            name: 'error-file', 
            colorize: false, 
            level: config.log.error.level, 
            showLevel: true,
            json: false,
            prettyPrint: true,
            timestamp: timeStampFormat,
            filename: config.log.error.path + '/error', // 로그 저장 경로/파일명
            datePattern: '_yyyy-MM-dd.log', // 저장경로 뒤의 이름형식
            maxsize: 50000000, // 최대용량
            maxFiles: 1000 // 최대 파일 수
        })
    ]
});

/** (6) 생성한 로그 객체를 모듈에 등록 */
module.exports = logger;


