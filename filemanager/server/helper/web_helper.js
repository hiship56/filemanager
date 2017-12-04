/*----------------------------------------------------------
 | /helper/web_helper.js
 |----------------------------------------------------------
 | Express 모듈이 갖는 req, res 객체의 기능을 확장하기 위한 모듈
 -----------------------------------------------------------*/

var config = require('./_config.js');
var log_helper = require('./log_helper.js');
// npm install nodemailer --save
var nodemailer = require('nodemailer');
var path = require('path');

module.exports = function() {
    return function(req, res, next) {
        /** get,post,put,delete 파라미터를 수신하여 값을 리턴하는 함수.
            값이 존재하지 않을 경우 def의 값을 대신 리턴한다. */
        req.get_param = function(method, key, def) {
            // 기본값이 없다면 null로 강제 설정
            if (def === undefined) { def = null; }

            // 파라미터를 HTTP 전송방식에 따라 받기
            var result = null;
            if (method.toUpperCase() == 'GET') { // GET방식이나 URL파라미터 받기
                result = this.query[key] || this.params[key];
            } else {    // POST,PUT,DELETE 파라미터 받기
                result = this.body[key];
            }

            // 파라미터 값이 존재한다면?
            if (result !== undefined) {
                if(!Array.isArray(result)) {
                    result = result.trim();
                    if (result.length < 1) {
                        result = def; // 리턴할 변수에 파라미터 값 저장
                    }
                }
            } else {
                result = def;
            }

            log_helper.debug('[HTTP %s PARAMS] %s=%s', method, key, result);
            return result;
        };

        /** get 파라미터 수신 함수 --> _get_param 함수를 호출한다. */
        req.get = function(key, def) {
            return this.get_param('GET', key, def);
        };

        /** post 파라미터 수신 함수 --> _get_param 함수를 호출한다. */
        req.post = function(key, def) {
            return this.get_param('POST', key, def);
        };

        /** put 파라미터 수신 함수 --> _get_param 함수를 호출한다. */
        req.put = function(key, def) {
            return this.get_param('PUT', key, def);
        };

        /** delete 파라미터 수신 함수 --> _get_param 함수를 호출한다. */
        req.delete = function(key, def) {
            return this.get_param('DELETE', key, def);
        };

        /** 응답 결과를 JSON으로 보내기 위한 함수. */
        res.sendJson = function(data) {
            var json = {
                status: 200,
                result: 'OK'
            };

            if (data != undefined) {
                for (var attrname in data) {
                    json[attrname] = data[attrname];
                }
            }

            log_helper.debug('[STATUS %d] %s', json.status, json.result);
            this.status(json.status).send(json);
        };

        /** 서버의 예외상황을 브라우저에게 JSON으로 전달하기 위한 함수 */
        res.sendException = function(status, message, error) {
            var result = null;

            switch (status) {
                case 400: result = 'Bad Request';    break;
                case 404: result = "Page Not Found"; break;
                case 500: result = "Server Error";   break;
            }

            var json = { status: status, result: result, message: message };
            log_helper.error('[STATUS %d-%s] %s', json.status, json.result, json.message);
 
            if (error != undefined) {
                json.error = error.message;
                log_helper.error(error);
            }

            this.status(json.status).send(json);
        };

        /** 잘못된 요청에 대한 결과를 응답한다. */
        res.sendBadRequest = function(message) {
            res.sendException(400, message);
        };

        /** 페이지를 찾을 수 없음을 응답한다. */
        res.sendNotFound = function(message) {
            res.sendException(404, message);
        };

        /** 서버의 런타임에러 정보를 응답한다. */
        res.sendError = function(message, error) {
            res.sendException(500, message, error);
        };

        /** 환경설정 정보에 따라 메일을 발송한다. */
        res.sendmail = function(sender, receiver, subject, content, callback) {
            /** 메일 발송 서버 인증 정보를 환경설정 정보에서 취득하기 */
            var smtp = nodemailer.createTransport(config.sendmail_info);

            /** 메일 발송정보를 구성하여 발송하기 */
            smtp.sendMail({
                from: sender, 
                to: receiver, 
                subject: subject, 
                html: content 
            }, function(error) {
                if (callback != undefined) {
                    callback(error);
                }
            });
        };
        next();
    };
};
