프로젝트 설명
-------------

node.js, mongodb, socket.io, jQuery-layout, jQeuryfiletree, child-process 등으로 만든 프로젝트 관리 어플리케이션입니다.
사용자가 프로젝트 파일(zip, tar)을 업로드하면 프로젝트 트리가 생성되며, 파일 클릭 시 내용 확인 및 수정, 저장이 가능합니다. 또한 c, c++, python의 언어일 경우
빌드 후 결과물이 출력됩니다. 그리고 사용자 전체채팅과 1:1채팅이 가능합니다.

설치 및 환경설정
-------------
npm 설치
<pre><code> npm install </code></pre>

해당 ip 주소 설정(optional)
<pre><code> www/assets/js/common.js -> homeurl, apiurl 변경 </code></pre>

서버 실행
<pre><code> node server.js </code></pre>
