/**
 * 라우팅 정보를 설정한다.
 * @path 	: URL 경로
 * @method 	: 데이터 전송 방식 (get,post,put,delete,all)
 * @src 	: 라우터에 연결될 함수가 정의된 소스파일 경로
 * @module 	: 라우터에 연결될 함수의 이름
 */
module.exports = [
	{path: '/member/join', method: 'post', src: './controllers/member.js', module: 'member.join'},
	{path: '/member/id_unique_check', method: 'post', src: './controllers/member.js', module: 'member.id_unique_check'},
	{path: '/member/email_unique_check', method: 'post', src: './controllers/member.js', module: 'member.email_unique_check'},
	{path: '/member/login', method: 'post', src: './controllers/member.js', module: 'member.login'},
	{path: '/member/logout', method: 'get', src: './controllers/member.js', module: 'member.logout'},
	{path: '/fileManager/f_save', method: 'post', src: './controllers/fileManager.js', module: 'fileManager.f_save'},
	{path: '/fileManager/f_read', method: 'get', src: './controllers/fileManager.js', module: 'fileManager.f_read'},
	{path: '/fileManager/read', method: 'get', src: './controllers/fileManager.js', module: 'fileManager.read'},
	{path: '/fileManager/save', method: 'post', src: './controllers/fileManager.js', module: 'fileManager.save'},
	{path: '/fileManager/buildF', method: 'get', src: './controllers/fileManager.js', module: 'fileManager.buildF'},
	{path: '/fileManager/buildC', method: 'get', src: './controllers/fileManager.js', module: 'fileManager.buildC'},
	{path: '/fileManager/checkInput', method: 'get', src: './controllers/fileManager.js', module: 'fileManager.checkInput'},
	{path: '/fileManager/buildCpp', method: 'get', src: './controllers/fileManager.js', module: 'fileManager.buildCpp'},
	{path: '/fileManager/newFile', method: 'get', src: './controllers/fileManager.js', module: 'fileManager.newFile'},
	{path: '/fileManager/deleteP', method: 'get', src: './controllers/fileManager.js', module: 'fileManager.deleteP'},
	{path: '/connectors/jqueryFileTree', method: 'post', src: './controllers/jqueryFileTree.js', module: 'getDirList'},
	{path: '/session', method: 'get', src: './controllers/session.js', module: 'session.read'}
];