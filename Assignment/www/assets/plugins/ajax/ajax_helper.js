$(function() {
	// 로딩이미지를 표시하기 위한 div를 jquery로 추가하기
	var loader = $("<div>").addClass('ajax-loader');
	loader.hide();
	$("body").prepend(loader);

	/*--------------------------------------------------------------------------------
	 | Ajax 관련 공통 기능
	 |--------------------------------------------------------------------------------*/
	$.ajaxSetup( {
		/** ajax 기본 옵션 */
		cache: false,			// 캐쉬 사용 금지 처리
		dataType: '', 
		timeout: 30000,			// 타임아웃 (30초)
		crossDomain: true,

		// 통신 시작전 실행할 기능 (ex: 로딩바 표시)
		beforeSend: function() {
			if (apiurl !== undefined) {
				if (this.url.substring(0, 1) === '/') {
					this.url = apiurl + this.url;
				} else if (this.url.indexOf("file:///") > -1) {
					this.url = this.url.replace('file://', apiurl);
				}
			}

			// 현재 통신중인 대상 페이지를 로그로 출력함
			console.log(">> Ajax 통신 시작 >> " + this.url);
			loader.show();
		},
		// 통신 실패시 호출될 함수 (파라미터는 에러내용)
		error: function(error) {

			// cordova용
			if (this.dataType === 'text') {
				return this.success(error.responseText);
			}

			// 404 -> Page Not Found
			// 50x -> Server Error(웹 프로그램 에러)
			// 200, 0 -> 내용의 형식 에러(JSON,XML)
			console.error(">> 에러!!!! >> " + error.status);
			var error_msg = "[" + error.status + "] " + error.statusText;

			// 백엔드에서 전달하는 내용을 JSONObject로 변환한다.
			var json = null;
			try {
				json = JSON.parse(error.responseText);
			} catch (e) {}

			// json데이터에 state값이 있는지 검사
			if (json !== null && json.status !== undefined) {
				error_msg = json.message;
				console.error(error_msg);

				if (json.error !== undefined) {
					console.error(json.error);
				}
			} else {
				var code = parseInt(error.status / 100);
	            if (code == 4) {	// 400번대의 에러인 경우
	                error_msg = "잘못된 요청입니다.\n" + error_msg;
	            } else if (code == 5) {
	                error_msg = "서버의 응답이 없습니다.\n" + error_msg;
	            } else if (code == 2 || code == 0) {
	            	error_msg = "서버의 응답이 잘못되었습니다.\n" + error_msg;
	            }
	            error_msg += '\n' + this.url;
	            console.error(error_msg);
	        }

            alert(error_msg);
		},
		// 성공,실패에 상관 없이 맨 마지막에 무조건 호출됨 ex) 로딩바 닫기
		complete: function() {
			console.log(">> Ajax 통신 종료!!!!");
			loader.hide();
		}
	} );

	/**
	 * 모든 data-include 속성을 갖는 HTML요소에 대해서 include함수를 호출한다.
	 * ex) <div data-include="./hello.html" data-a="1" data-b="2"></div>
	 */
	$(window).load(function() {
		$("*[data-include]").each(function() {
			include($(this), $(this).data('include'), $(this).data());
		});
	});
});



/*--------------------------------------------------------------------------------
 | HTML include 기능
 |	@params 	target - 결과가 표시될 HTML요소의 CSS셀렉터. 혹은 jQuery객체.
 |	@params 	url - 가져올 HTML파일의 경로.
 |	@params 	replace_data - 가져온 HTML파일에 치환할 json 데이터.
 |					HTML파일에서 {key} 형식으로 명시된 위치를 값으로 변환한다.
 |--------------------------------------------------------------------------------*/
function include(target, url, replace_data) {
	var current = $(target);
	if (current === undefined) {
		return;
	}

	$.ajax({
		url: url,
		method: 'get',
		// 가져온 HTML소스에대해서 replace 함수를 사용하기 위해 문자열로 가져온다.
		dataType: 'text',
		// 한번 가져온 내역이 있는 소스는 다운로드 없이 캐시에서 재사용.
		cache: true,
		success: function(source) {
			if (replace_data !== undefined) {
				// 전역변수 homeurl이 정의되었다면 추가한다.
				if (homeurl !== undefined) {
					replace_data.homeurl = homeurl;
				}

				for (var key in replace_data){
					if (key !== 'include') {
						var template = new RegExp('{' + key + '}', 'g');
						source = source.replace(template, replace_data[key]);
					}
				}
			}

			current.html(source);
		}
	});
}


/*--------------------------------------------------------------------------------
 | HTML 특수문자를 원래의 구문으로 되돌리는 함수.
 |--------------------------------------------------------------------------------*/
function htmlspecialchar_decode(content) {
	// 임의의 HTML 태그를 생성하여 내용을 출력시킨다.
	var div = $("<div>").html(content);
	// 브라우저에 표시될 내용을 리턴한다.
	return div.text();
}

/*--------------------------------------------------------------------------------
 | 페이지 번호 이동 버튼에 대한 HTML을 구성한 후 target요소에 출력한다.
 |--------------------------------------------------------------------------------*/
function pagenation(target, pageinfo) {
	/** 현재 URL의 경로만 가져온다. */
	var pathname = window.location.pathname;

	// Bootstrap pagenation 시작
	var html = '<ul class="pagination">';

	// 이전페이지 그룹으로 이동 버튼
    if (pageinfo.prev_group_last_page == 0) {
        html += '<li class="disabled"><a href="#">&laquo;</a></li>';
    } else {
    	// 현재 URL경로 + (GET파라미터에 page번호 값 추가한 querystring)
        var prev_url = pathname + $.query.set('page', pageinfo.prev_group_last_page);
        html += '<li><a href="' + prev_url + '">&laquo;</a></li>';
    };

    // 페이지번호 버튼
    for (var i=pageinfo.group_start; i<=pageinfo.group_end; i++) {
    	// 현재 URL경로 + (GET파라미터에 page번호 값 추가한 querystring)
        var page_url = pathname + $.query.set('page', i);

        if (pageinfo.now_page == i) {
            html += '<li class="active"><a href="' + page_url + '">' + i + '</a>';
        } else {
            html += '<li><a href="' + page_url + '">' + i + '</a>';
        }
    }

    // 다음 페이지 그룹으로 이동 버튼
    if (pageinfo.next_group_first_page == 0) {
        html += '<li class="disabled"><a href="#">&raquo;</a></li>';
    } else {
    	// 현재 URL경로 + (GET파라미터에 page번호 값 추가한 querystring)
        var next_url = pathname + $.query.set('page', pageinfo.next_group_first_page);
        html += '<li><a href="' + next_url + '">&raquo;</a></li>';
    }

    // Bootstrap pagenation 끝
    html += "</ul>";

    // 지정된 요소에 HTML을 출력한다.
    $(target).html(html);
}
