var config = require('../helper/_config.js');
var log_helper = require('../helper/log_helper.js');
var util_helper = require('../helper/util_helper');
var file_helper = require('../helper/file_helper.js');
var fs = require('fs');
var async = require('async');
var request = require('request');
require('../helper/string.js');
var crypto = require('crypto');

// DEFINE MODEL
var Member = require('../models/member');

module.exports.member = {
	
	// 아이디 중복검사
	id_unique_check: function(req, res, next) {
        
        var user_id = null;

        /** (2) 단위기능 구현을 위한 기본 구조 */
        async.waterfall(
            // 단계별 처리 프로세스
            [
                
                function(callback) {
                    user_id = req.post('user_id');
                    if (!user_id) { return callback('아이디를 입력하세요.'); }
					// 아이디 형식검사
                    if (!user_id.isAlphabetNum() || user_id.length > 20) {
                        return callback('아이디는 영어와 숫자 조합으로 최대 20자까지 입력 가능합니다.');
                    }
                    callback(null);
                },
                
                function(callback) {
                    Member.find({user_id: user_id}, function(err, members){
						if(err) return res.status(500).json({error: err});
						if(members.length >0) return callback('이미 사용중인 아이디입니다.');
						callback(null);
					});
                }
            ],

            // 결과처리 함수
            function(err) {

                if (err) {  // err객체가 null이 아니라면? --> 에러가 있다면?
                    if (typeof err === 'string') {
                        // 에러 정보가 문자열인 경우는 개발자가 정의한 예외상황.
                        return res.sendBadRequest(err);
                    } else {
                        // 그 밖의 경우는 시스템 장애.
                        return res.sendError('서버의 응답이 잘못되었습니다.', err);
                    }
                }

                res.sendJson();
            }
        );
    },

	// 이메일 중복검사
    email_unique_check: function(req, res, next) {
		
        var email = null;

        /** (2) 단위기능 구현을 위한 기본 구조 */
        async.waterfall(
            // 단계별 처리 프로세스
            [
                function(callback) {
                    email = req.post('email');
                    if (!email) { return callback('이메일을 입력하세요.'); }
					if (!email.isEmail()) { return callback('이메일의 형식이 잘못되었습니다.'); }
                    callback(null);
                },

                function(callback) {
                    Member.find({email: email}, function(err, members){
					if(err) return res.status(500).json({error: err});
					if(members.length >0) return callback('이미 사용중인 이메일입니다.');
					callback(null);
				});
                }
            ],

            // 결과처리 함수
            function(err) {

                if (err) {  // err객체가 null이 아니라면? --> 에러가 있다면?
                    if (typeof err === 'string') {
                        // 에러 정보가 문자열인 경우는 개발자가 정의한 예외상황.
                        return res.sendBadRequest(err);
                    } else {
                        // 그 밖의 경우는 시스템 장애.
                        return res.sendError('서버의 응답이 잘못되었습니다.', err);
                    }
                }

                res.sendJson();
            }
        );
    },

	//회원가입 
    join : function(req, res, next) {
        var member = new Member();
		var user_name = null;
        var user_id = null;
		var user_pw = null;
		var user_pw_re = null;
		var email = null;
		var gender = null;
		var birthdate = null;
		var tel = null;
		var salt_pw = null;

		/** (2) 단위기능 구현을 위한 기본 구조 */
        async.waterfall(
            // 단계별 처리 프로세스
            [
				/** step1 - 회원가입에 필요한 값 받기 */
                function(callback) {
                	user_name = req.post("user_name");
                	user_id = req.post("user_id");
					user_pw = req.post("user_pw");
					user_pw_re = req.post("user_pw_re");
					email = req.post("email");
					gender = req.post("gender");
					birthdate = req.post("birthdate");
					tel = req.post("tel");
					
					if (!user_name) 		{ return callback('이름을 입력하세요.'); }
                    if (!user_id) 	{ return callback('아이디를 입력하세요.'); }
                    if (!user_pw) 	{ return callback('비밀번호를 입력하세요.'); }
                    if (!email) 	{ return callback('이메일 주소를 입력하세요.'); }
                    if (!gender) 	{ return callback('성별을 입력하세요.'); }
                    if (!birthdate) { return callback('생년월일을 입력하세요.'); }
                    if (!tel) 		{ return callback('연락처를 입력하세요.'); }
					
					// 한글 여부 검사
                    if (!user_name.isKor() || user_name.length > 10) {
                        return callback('이름은 한글로만 최대 10글자까지 입력 가능합니다.');
                    }

                    // 아이디 형식검사
                    if (!user_id.isAlphabetNum() || user_id.length > 20) {
                        return callback('아이디는 영어와 숫자 조합으로 최대 20자까지 입력 가능합니다.');
                    }

                    // 비밀번호 형식검사
                    if (!user_pw.isAlphabetNum() || user_pw.length > 20) {
                        return callback('비밀번호는 영어와 숫자 조합으로 최대 20자까지 입력 가능합니다.');
                    }

                    // 비밀번호 확인
                    if (user_pw != user_pw_re) {
                        return callback('비밀번호 확인이 잘못되었습니다.');
                    }

                    // 이메일 형식검사
                    if (!email.isEmail()) {
                        return callback('이메일 형식이 잘못되었습니다.');
                    }

                    // 성별은 M(남자),F(여자)중의 하나여아 한다.
                    if (gender != 'M' && gender != 'F') {
                        return callback('성별값이 잘못되었습니다.');
                    }

                    // 연락처가 집전화, 휴대폰 형식이 모두 아니라면 예외처리
                    tel = tel.replaceAll('-', '');
                    if (!tel.isTelphone() && !tel.isCellphone()) {
                        return callback('연락처 형식이 잘못되었습니다.');
                    }

                    callback(null);
                },
				
				/** step2 - 아이디 중복검사 SQL 수행 */
                function(callback) {
                    Member.find({user_id: user_id}, function(err, members){
						if(err) return res.status(500).json({error: err});
						if(members.length >0) return callback('이미 사용중인 아이디입니다.');
						callback(null);
					});
                },
				
				/** step3 - 이메일 중복검사 SQL 수행 */
                function(callback) {
                    Member.find({email: email}, function(err, members){
						if(err) return res.status(500).json({error: err});
						if(members.length >0) return callback('이미 사용중인 이메일입니다.');
						callback(null);
					});
                },
				
				/** step4 - 비밀번호 암호화*/
                function(callback) {
                    var genRandomString = function(length){
						return crypto.randomBytes(Math.ceil(length/2))
								.toString('hex') /** convert to hexadecimal format */
								.slice(0,length);   /** return required number of characters */
					};


					var sha512 = function(password, salt){
						var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
						hash.update(password);
						var value = hash.digest('hex');
						return {
							salt:salt,
							passwordHash:value
						};
					};

					function saltHashPassword(user_pw) {
						var salt = genRandomString(16); /** Gives us salt of length 16 */
						var passwordData = sha512(user_pw, salt);
						return {
							password: passwordData.passwordHash,
							salt_pw: passwordData.salt
						};
					}

					var hash = saltHashPassword(user_pw);
					user_pw = hash.password;
					salt_pw = hash.salt_pw;
					callback(null);
                },
				
				
				
				/** step5 - 입력한 정보를 DB에 저장하기 */
				function(callback) {
                	member.user_name = user_name;
                	member.user_id = user_id;
					member.user_pw = user_pw;
					member.email = email;
					member.gender = gender;
					member.birthdate = birthdate;
					member.tel = tel;
					member.salt_pw = salt_pw;
                    callback(null);
                },
				
                function(callback) {
                	member.save(function(err){
                        if(err){
                            console.error(err);
                        }
                    });
                    callback(null);
                },
            ],

            // 결과처리 함수
            function(err) {
                if (err) {  // err객체가 null이 아니라면? --> 에러가 있다면?
                    if (typeof err === 'string') {
                        // 에러 정보가 문자열인 경우는 개발자가 정의한 예외상황.
                        return res.sendBadRequest(err);
                    } else {
                        // 그 밖의 경우는 시스템 장애.
                        return res.sendError('서버의 응답이 잘못되었습니다.', err);
                    }
                }

                res.sendJson();
            }
        );  
    },
	
	//로그인
	login: function(req, res, next) {
        var user_id = null, user_pw = null;
		var salt_pw = null;
		
        /** (2) 단위기능 구현을 위한 기본 구조 */
        async.waterfall(
            // 단계별 처리 프로세스
            [
                /** step0 - 로그인 여부 확인 */
                function(callback) {
                    // 세션에 저장된 정보가 있다면?
                    if (req.session.member !== undefined) {
                        return callback('이미 로그인 중입니다.');
                    }
                    callback(null);
                },

                /** step1 - 아이디, 비밀번호 입력값 받기 */
                function(callback) {
                    user_id = req.post('user_id');
                    user_pw = req.post('user_pw');

                    if (!user_id) { return callback('아이디를 입력하세요.'); }
                    if (!user_pw) { return callback('비밀번호를 입력하세요.'); }

                    callback(null);
                },
				
				/** step2 - 회원정보 조회 */
                function(callback) {
					Member.find({user_id: user_id}, function(err, members){
						if(err) return res.status(500).json({error: err});
						if(members.length < 1) {
							return callback('아이디와 비밀번호가 일치하지 않습니다.');
						} else {
							console.log(members);
							salt_pw = members[0].salt_pw;
							console.log(members[0].salt_pw);
						}
						
						
						callback(null);
					});
                    
                },
				
				/** step3 - 비밀번호 암호화*/
                function(callback) {

					var sha = function(password, salt){
						var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
						hash.update(password);
						var value = hash.digest('hex');
						return {
							passwordHash:value
						};
					};

					function saltPassword(user_pw) {
						var passwordData = sha(user_pw, salt_pw);
						return {
							password: passwordData.passwordHash,
						};
					}

					var hash = saltPassword(user_pw);
					user_pw = hash.password;
					callback(null);
                },
				
                /** step4 - 회원정보 조회 */
                function(callback) {
					Member.findOne({user_id: user_id, user_pw: user_pw}, function(err, members){
						if(err) return res.status(500).json({error: err});
						if(members === null) return callback('아이디와 비밀번호가 일치하지 않습니다.');
						
						// 전달된 결과값을 세션에 저장함.
						req.session.member = members;

						callback(null);
					}); 
                }
            ],

            // 결과 처리 함수
            function(err) {
                if (err) {
                    if (typeof err === 'string') {
                        return res.sendBadRequest(err);
                    } else {
                        return res.sendError('서버의 응답이 잘못되었습니다.', err);
                    }
                }

                res.sendJson();
            }
        );
    },
	
	//로그아웃
	logout: function(req, res, next) {

        /** (2) 단위기능 구현을 위한 기본 구조 */
        async.waterfall(
            // 단계별 처리 프로세스
            [
                /** step0 - 로그인 여부 확인 */
                function(callback) {
                    // 세션에 저장된 정보가 없다면?
                    if (req.session.member === undefined) {
                        return callback('로그인 중이 아닙니다.');
                    }
                    callback(null);
                },

                /** step1 - 세션 삭제 */
                function(callback) {
                    req.session.destroy(function(err) {
                        if (err) { callback(err); }
                        callback(null);
                    });
                }
            ],

            // 결과 처리 함수
            function(err, result) {
                if (err) {
                    if (typeof err === 'string') {
                        return res.sendBadRequest(err);
                    } else {
                        return res.sendError('서버의 응답이 잘못되었습니다.', err);
                    }
                }

                res.sendJson();
            }
        );
    },
};