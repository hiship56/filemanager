var config = require('../helper/_config.js');
var log_helper = require('../helper/log_helper.js');
var util_helper = require('../helper/util_helper.js');
var file_helper = require('../helper/file_helper.js');
var async = require('async');
var fs = require('fs');
require('../helper/string.js');
var multer = require('multer');
var AdmZip = require('adm-zip');
var tar = require("tar-fs");
var codemirror = require('codemirror-node');
var PythonShell = require('python-shell');
var child_process = require('child_process');
var spawn = child_process.spawn;
var remove = require('rimraf'); 

// DEFINE MODEL
var Member = require('../models/member');


module.exports.fileManager = {
	
	// 업로드된 프로젝트 압축파일을 풀어서 해당 경로에 저장 후 db에 저장
	f_save: function(req, res, next) {
		
		var fileName = null;
		var folder = req.session.member.user_id;
		var dir = null;
		var member = new Member();
		/** 객체에 업로드 기능을 추가한다. */
        var multipart = multer({
            // 스토리지 설정
            storage: multer.diskStorage({
                // 업로드 될 파일이 저장될 폴더를 콜백함수에 전달한다.
                destination: function(req, file, callback) {
                    callback(null, config.upload.dir + "/"+folder+"/");
                },
                // 업로드 된 파일이 저장될 파일이름 규칙을 설정하여 콜백에 전달한다.
                filename: function(req, file, callback) {
                    // 업로드 된 파일의 정보를 로그로 기록
                    log_helper.debug("%j", file);
                    // 원본 파일 이름
                    fileName = file.originalname;
                    // 저장된 파일이름을 콜백함수에게 전달
                    callback(null, fileName);
                }
            })
        });


        /** 단위기능 구현을 위한 기본 구조 */
        async.waterfall(
            // 단계별 처리 프로세스
            [
				function(callback) {
					file_helper.mkdirs(config.upload.dir + "/"+ folder);
					
					callback(null);
                },
				
                function(callback) {
                    var upload = multipart.single('file');
                    upload(req, res, function(err) {
                        if (err) { return callback(err); }
						dir = config.upload.dir + "/"+ folder +"/" + fileName;
						var extension = fileName.substring(fileName.lastIndexOf(".")+1);
						if (extension === "zip") {
							var zip = new AdmZip(dir);
							var zipEntries = zip.getEntries(); // an array of ZipEntry records
							zip.extractAllTo(/*target path*/config.upload.dir +"/"+ folder +"/"+ fileName.substring(0, fileName.length-4), /*overwrite*/true);
							
						} else {
							fs.createReadStream(dir).pipe(tar.extract(config.upload.dir +"/"+ folder +"/"+ fileName.substring(0, fileName.length-4)));
						}
						fs.unlink(dir, function (err) {
						  if (err) throw err;
						});
                        callback(null, dir);
                    });
					
                },
				
				
                function(dir, callback) {
                	Member.findById(req.session.member._id, function(err, member){
                        if(err){
                            console.error(err);
                        } else {
							member.project = dir;
							member.save(function(err){
								if(err){
									console.error(err);
								}
							});
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

    //사용자의 project 경로 불러오기
    f_read: function(req, res, next) {
		
		var member = new Member();
		var _id = req.get('_id');
        /** 단위기능 구현을 위한 기본 구조 */
        async.waterfall(
            // 단계별 처리 프로세스
            [
                function(callback) {
					Member.findOne({"_id" : _id}, {"project": true}, function(err, member) {
						if(err){
							console.error(err);
						}	
						callback(null, member);
					});
                },
            ],

            // 결과처리 함수
            function(err, member) {
                
                if (err) {
                    if (typeof err === 'string') {
                        // 에러 정보가 문자열인 경우는 개발자가 정의한 예외상황.
                        return res.sendBadRequest(err);
                    } else {
                        // 그 밖의 경우는 시스템 장애.
                        return res.sendError('서버의 응답이 잘못되었습니다.', err);
                    }
                }
                res.sendJson({result: member});
            }
        );
    },
	
	//파일 데이터 불러오기 
	read: function(req, res, next) {
		
		var file_path = null;
		var data = null;
		
		/** 단위기능 구현을 위한 기본 구조 */
        async.waterfall(
            // 단계별 처리 프로세스
            [
                function(callback) {
                    file_path = req.get("file");
					data = fs.readFileSync(file_path, "UTF-8");
					callback(null, data);
                },

                
            ],

            // 결과처리 함수
            function(err, data) {
                
                if (err) {
                    if (typeof err === 'string') {
                        // 에러 정보가 문자열인 경우는 개발자가 정의한 예외상황.
                        return res.sendBadRequest(err);
                    } else {
                        // 그 밖의 경우는 시스템 장애.
                        return res.sendError('서버의 응답이 잘못되었습니다.', err);
                    }
                }
                res.sendJson({result: data});
            }
        );
    },
	
	//파일 데이터 저장하기 
	save: function(req, res, next) {
		
		var file_path = null;
		var data = null;
		
		/** 단위기능 구현을 위한 기본 구조 */
        async.waterfall(
            // 단계별 처리 프로세스
            [
                function(callback) {
                    file_path = req.post("path");
					data = req.post("data");
					fs.writeFile(file_path, data, function(err) {
						if (err) { return callback(err); }
						callback(null);
					});
                },

                
            ],

            // 결과처리 함수
            function(err) {
                
                if (err) {
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
	
	//python 빌드 결과 출력하기
	buildF: function(req, res, next) {
		var path = req.get('path');
		//사용자 입력값
		var inputData = req.get('inputData');
		//파일 위치 경로
		var pathA = path.substr(0, path.lastIndexOf('/')+1);
		// 파일 확장자 포함 이름
		var filenameE = path.substring(path.lastIndexOf('/')+1);
		var error = "";
		var check = 0;
		//pythonshell options
		var options = {
			mode: 'text',
			pythonPath: '',
			pythonOptions: ['-u'],
			scriptPath: ''
		};
		
		/** 단위기능 구현을 위한 기본 구조 */
        async.waterfall(
            // 단계별 처리 프로세스
            [
                function(callback) {
					var path = req.get('path');
					options.scriptPath = pathA;
                    var pyshell = new PythonShell(filenameE, options);
					pyshell.on('error', function (err){
					   console.log("Error" + err );
					});

					pyshell.stderr.on('data', function(data) {
						console.log("stderr : " + data);
						error += data.toString();
					});
					
					// 파일 실행 결과 출력
					var result = "";
					
					pyshell.stdout.on('data', function(data) {
						result += data.toString();
						if(inputData) {
							check++;
						}
						if (check === 1) {
							for (var i = 0; i < inputData.length; i++) {
								pyshell.stdin.write(inputData[i]+"\n");
								if (i === inputData.length-1) {
									check++;
								}
							}
						}
						if (check === 2) {
							pyshell.stdin.end();
						}
					});
					
					pyshell.on('close', function (code) {
						if (code !== 0) {
							console.log("Program ended with a error code : " + code);
						}

					});
					setTimeout(function(){
						callback(null, result, error);
					}, 1000);
                },

                
            ],

            // 결과처리 함수
            function(err, result, error) {
                
                if (err) {
                    if (typeof err === 'string') {
                        // 에러 정보가 문자열인 경우는 개발자가 정의한 예외상황.
                        return res.sendBadRequest(err);
                    } else {
                        // 그 밖의 경우는 시스템 장애.
                        return res.sendError('서버의 응답이 잘못되었습니다.', err);
                    }
                }
                res.sendJson({result: result, error: error});
            }
        );
    },
	
	//file 내 출력 함수 검사
	checkInput: function(req, res, next) {
		// 전체 경로
		var path = req.get('path');
		var pathE = path.substr(path.lastIndexOf('.')+1);
		var count = null;
		
		/** 단위기능 구현을 위한 기본 구조 */
        async.waterfall(
            // 단계별 처리 프로세스
            [
				//python 파일 실행 및 결과값 출력
				function(callback) {
					
					fs.readFile(path, 'utf8', function(err, data) {
						if (err) {
							console.log(err);
						}
						
						if (pathE === "c") {
							count = (data.match(/scanf/g) || []).length;
							count += (data.match(/gets/g) || []).length;
							count += (data.match(/fgets/g) || []).length;
						} else if(pathE === 'cpp') {
							count = (data.match(/cin/g) || []).length;
							count += (data.match(/cin.get/g) || []).length;
							count += (data.match(/cin.getline/g) || []).length;
						} else {
							count = (data.match(/input/g) || []).length;
							count += (data.match(/raw_input/g) || []).length;
						}
						console.log(count);
						callback(null, count);
					});
                },

            ],

            // 결과처리 함수
            function(err, count) {
                
                if (err) {
                    if (typeof err === 'string') {
                        // 에러 정보가 문자열인 경우는 개발자가 정의한 예외상황.
                        return res.sendBadRequest(err);
                    } else {
                        // 그 밖의 경우는 시스템 장애.
                        return res.sendError('서버의 응답이 잘못되었습니다.', err);
                    }
                }
                res.sendJson({ count: count});
            }
        );
    },
	
	
	//c 빌드 결과 출력
	buildC: function(req, res, next) {
		// 전체 경로
		var path = req.get('path');
		// 사용자 입력 값
		var inputData = req.get('inputData');
		//파일 위치 경로
		var pathA = path.substr(0, path.lastIndexOf('/')+1);
		// 파일 확장자 포함 이름
		var filenameE = path.substring(path.lastIndexOf('/')+1);
		// 파일 이름
		var filename = path.substring(path.lastIndexOf('/')+1, path.lastIndexOf('.'));
		var exec = null;
		var error = "";
		var check = 0;
		
		/** 단위기능 구현을 위한 기본 구조 */
        async.waterfall(
            // 단계별 처리 프로세스
            [
				// c 파일 컴파일 실행
				function(callback) {
					var compileErr = null;
					// exec: spawns a shell.
					exec = spawn('gcc', ['-Wall', '-o', filename+"c", filenameE ], {cwd: pathA});
					exec.on('error', function (err){
					   console.log("Error" + err );
					});

					exec.stderr.on('data', function(data) {
						if(data) {
							compileErr += data.toString();
						} 
						
					});

					exec.on('close', function (code) {
						if (code !== 0) {
							console.log("Program ended with a error code : " + code);
						}

					});
					
					setTimeout(function() {
						callback(null, compileErr);	
					}, 1000);
                },
				
				// 컴파일된 파일 실행 
				function(compileErr, callback) {
					// exec: spawns a shell.
					setTimeout(function() {
						exec = spawn('./'+filename+"c", {cwd: pathA});
						console.log(pathA);
						console.log(filename);
						exec.on('error', function (err){
						   console.log("Error" + err );
						});

						exec.stderr.on('data', function(data) {
							console.log("stderr : " + data);
							error += data.toString();
						});


						exec.on('close', function (code) {
							if (code !== 0) {
								console.log("Program ended with a error code : " + code);
							}

						});
						callback(null, error, compileErr);
					}, 500);
					
                },
				
				// 실행 결과값 출력
				function(error, compileErr, callback) {
					// exec: spawns a shell.
					var result = "";
					exec.stdin.setEncoding('utf-8');
					exec.stdout.on('data', function(data) {
						console.log(data.toString());
						result += data.toString();
						if(inputData) {
							check++;
						}
						if (check === 1) {
							for (var i = 0; i < inputData.length; i++) {
								exec.stdin.write(inputData[i]+"\n");
								if (i === inputData.length-1) {
									check++;
								}
							}
						}
						if (check === 2) {
							exec.stdin.end();
						}
					});
					setTimeout(function(){
						console.log(compileErr);
						callback(null, result, error, compileErr);
					}, 1000);
                },
            ],

            // 결과처리 함수
            function(err, result, error, compileErr) {
                
                if (err) {
                    if (typeof err === 'string') {
                        // 에러 정보가 문자열인 경우는 개발자가 정의한 예외상황.
                        return res.sendBadRequest(err);
                    } else {
                        // 그 밖의 경우는 시스템 장애.
                        return res.sendError('서버의 응답이 잘못되었습니다.', err);
                    }
                }
                res.sendJson({result: result, error: error, compileErr: compileErr});
            }
        );
    },
	
	//c++ 빌드 결과 출력
	buildCpp: function(req, res, next) {
		// 전체 경로
		var path = req.get('path');
		// 사용자 입력값
		var inputData = req.get('inputData');
		//파일 위치 경로
		var pathA = path.substr(0, path.lastIndexOf('/')+1);
		// 파일 확장자 포함 이름
		var filenameE = path.substring(path.lastIndexOf('/')+1);
		// 파일 이름
		var filename = path.substring(path.lastIndexOf('/')+1, path.lastIndexOf('.'));
		var exec = null;
		var error = "";
		var check = 0;
		
		/** 단위기능 구현을 위한 기본 구조 */
        async.waterfall(
            // 단계별 처리 프로세스
            [
				//c++ 파일 컴파일 실행
                function(callback) {
					// exec: spawns a shell.
					var compileErr = "";
					exec = spawn('g++', ['-o', filename+"cpp", filenameE ], {cwd: pathA});
					exec.on('error', function (err){
					   console.log("Error" + err );
					});

					exec.stderr.on('data', function(data) {
						if(data) {
							compileErr += data.toString();
							console.log(data.toString());
						} 
						
					});

					exec.on('close', function (code) {
						if (code !== 0) {
							console.log("Program ended with a error code : " + code);
						}

					});
					setTimeout(function() {
						callback(null, compileErr);	
					}, 1000);
                },
				
				// 컴파일된 파일 실행
				function(compileErr, callback) {
					// exec: spawns a shell.
					setTimeout(function() {
						exec = spawn('./'+filename+"cpp", {cwd: pathA});
						exec.on('error', function (err){
						   console.log("Error" + err );
						});

						exec.stderr.on('data', function(data) {
							console.log("stderr : " + data);
							error += data.toString();
						});


						exec.on('close', function (code) {
							if (code !== 0) {
								console.log("Program ended with a error code : " + code);
							}

						});
						callback(null, error, compileErr);
					}, 500);
					
                },
				
				// 실행 결과값 출력
				function(error, compileErr, callback) {
					// exec: spawns a shell.
					var result = "";
					
					exec.stdout.on('data', function(data) {
						console.log(data.toString());
						console.log("hehe");
						result += data.toString();
						if(inputData) {
							check++;
						}
						if (check === 1) {
							for (var i = 0; i < inputData.length; i++) {
								exec.stdin.write(inputData[i]+"\n");
								if (i === inputData.length-1) {
									check++;
								}
							}
						}
						if (check === 2) {
							exec.stdin.end();
						}
					});
					setTimeout(function(){
						console.log(compileErr);
						callback(null, result, error, compileErr);
					}, 1000);
                },
            ],

            // 결과처리 함수
            function(err, result, error, compileErr) {
                
                if (err) {
                    if (typeof err === 'string') {
                        // 에러 정보가 문자열인 경우는 개발자가 정의한 예외상황.
                        return res.sendBadRequest(err);
                    } else {
                        // 그 밖의 경우는 시스템 장애.
                        return res.sendError('서버의 응답이 잘못되었습니다.', err);
                    }
                }
                res.sendJson({result: result, error: error, compileErr: compileErr});
            }
        );
    },
	
	//새 파일 생성
	newFile: function(req, res, next) {
		// 전체 경로
		var path = req.session.member.project;
		var filename = req.get('filename');
		var pathA = path.substr(0, path.lastIndexOf('.')) + "/" +filename;
		
		/** 단위기능 구현을 위한 기본 구조 */
        async.waterfall(
            // 단계별 처리 프로세스
            [
                function(callback) {
					fs.writeFile(pathA, '', function(err) {
						if(err) { console.log(err); }
					});
					callback(null);
                },
                
            ],

            // 결과처리 함수
            function(err) {
                
                if (err) {
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
	
	//프로젝트 폴더 삭제
	deleteP: function(req, res, next) {
		// 전체 경로
		var path = req.session.member.project;
		console.log(path);
		var pathA = path.substr(0, path.lastIndexOf('/'));
		var _id = req.session.member._id;
		
		/** 단위기능 구현을 위한 기본 구조 */
        async.waterfall(
            // 단계별 처리 프로세스
            [
                function(callback) {
					remove(pathA, function(err) {
						if(err) { console.log(err); }
					});
					callback(null);
                },
				
				function(callback) {
					Member.update({_id: _id}, {$unset: {project:1}}, function(err) {
						if(err) { console.log(err); }
					});
					callback(null);
                },
                
            ],

            // 결과처리 함수
            function(err) {
                
                if (err) {
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
};
