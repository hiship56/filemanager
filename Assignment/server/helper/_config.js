/*----------------------------------------------------------
 | /helper/_config.js
 |----------------------------------------------------------
 | 시스템 전체 환경설정 파일
 -----------------------------------------------------------*/

/** (1) 모듈 참조 */
var path = require('path');

/** (2) 환경설정 정보 */
var config = {
	/** 로그파일 저장 경로 및 출력 레벨*/
	log: {
		debug: {
			path : path.join(__dirname, '../_files/_logs'),
			level: 'mongo'
		},
		error: {
			path : path.join(__dirname, '../_files/_logs'),
			level: 'error'
		}
	},

	/** 웹 서버 포트번호 */
	server_port: 3000,
	
	/** public 디렉토리 경로 */
	public_path: path.join(__dirname, '../../www'),
	
	/** favicon 경로 */
	favicon_path: path.join(__dirname, '../../www/favicon.png'),

	/** 쿠키 저장시 사용할 도메인 */
	// 1) localhost인 경우 공백으로 설정
	// 2) 도메인이 itpaper.co.kr 인 경우 앞에 점을 붙여서 명시 --> ".itpaper.co.kr"
	cookie_domain : '',

	/** 보안키 (암호화 키) */
	secure: {
		cookie_encrypt_key: '1234567890',
		session_encrypt_key: '0987654321'
	},

	/** 메일 발송 정보 */
	sendmail_info : {
		service: 'Gmail',
		auth: {
			user: 'jjhomeyun@gmail.com',
			pass: ''
		}
	},

	/** 업로드 경로 */
	upload: {
		path: '/upload',
		dir: path.join(__dirname, '../_files/upload'),
		max_size: 1024*1024*20,
		max_count: 10
	},

	/** 썸네일 이미지 생성 경로 */
	thumbnail_path: path.join(__dirname, '../_files/thumbnails')

	
};

module.exports = config;


