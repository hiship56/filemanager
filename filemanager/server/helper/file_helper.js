var fs = require('fs');		// FileSystem 모듈
var path = require('path');	// 경로문자열 제어 모듈
var config = require('./_config.js');
/**
 * 디렉토리를 순환적으로 생성한다.
 * @param  {String} target     생성할 경로 문자열
 * @param  {int} 	permission 부여할 퍼미션
 * @return {void}   
 */
module.exports.mkdirs = function(target, permission) {
	// 경로가 없다면 수행하지 않는다.
	if (target == undefined || target == null) { return; }
	// 권한값이 없다면 기본값을 부여한다.
	if (permission == undefined) { permission = 0755; }

	target = target.replace(/\\/gi, "/");	// 윈도우의 경우 '\'를 '/'로 변환.

	var target_list = target.split('/');	// 주어진 경로값을 '/'단위로 자른다.
	var dir = '';							// 한 단계씩 경로를 누적할 변수

	// 주어진 경로가 절대경로 형식이라면 경로를 누적할 변수를 "/"부터 시작한다.
	if (target.substring(0, 1) == "/") { dir = "/";	}
	// 하드디스크 문자열에는 "/"를 추가해 준다. (for windows)
	if (target_list[0].indexOf(":") > -1) { target_list[0] += "/"; }

	// 잘라낸 단계만큼 반복한다.
	for (var i=0; i<target_list.length; i++) {
		// 현재폴더를 의미한다면 증감식으로 이동
		if (target_list[i] == ".") { continue; }

		// 잘라낸 경로값을 덧붙임
		dir = path.join(dir, target_list[i]);

		// 폴더가 없다면 생성한다.
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
			fs.chmodSync(dir, 0755);
			//console.log(dir + "의 폴더가 생성되었습니다.");
		} //else {
			//console.log(dir + "(이)가 이미 존재합니다.")
		//}
	}
};

//저장되어 있는 파일을 삭제
//서버상에 저장된 파일의 path  
//ex)/upload/helloworld.png
module.exports.remove_file = function(file_path) {
	//전달된 경로값이 없다면 중단한다.
	if(file_path == undefined || file_path == null) { return; }
     
    //파일경로에서 path값을 dir로 변경
    // /upload/helloworld.png 에서 "/upload"를 "C:/mynode/_files/upload"로 변경
    var real_path = file_path.replace(config.upload.path, config.upload.dir);
    console.log("삭제할 파일>>" + real_path);

    if(fs.existsSync(real_path)) {
    	fs.unlinkSync(real_path);
    	console.log("삭제완료>>" + real_path);
    }
};



