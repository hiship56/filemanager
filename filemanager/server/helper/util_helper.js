var os = require('os');
var url = require('url');
var querystring = require('querystring');

/**
 * 객체의 깊은 복사 처리 함수
 * @param  {object} obj 복사할 원본 객체
 * @return {object}     복사된 객체
 */
module.exports.clone = function(obj) {
	// 참조복사가 발생하지 않는 요소라면 수행할 필요가 없으므로 원본을 그대로 리턴
    if (obj == undefined || obj == null || typeof obj != "object") {
    	return obj;
    }

    // 객체의 생성자를 통해서 동일한 틀의 빈 객체를 생성
    var copy = obj.constructor();

    // 원본의 모든 키에 대한 반복 처리
    for (var attr in obj) {
        if (typeof obj[attr] == 'object') {
            // 복사할 값이 하위 객체라면 이 요소만을 다시 함수 스스로에게 전달
            copy[attr] = this.clone(obj[attr]);
        } else {
            // 복사본에 원본과 같은 키를 생성하면서 값 복사 처리
            copy[attr] = obj[attr];
        }
    }
    return copy;
};

/**
 * 현재 시스템의 IP주소를 조회하여 배열로 리턴한다.
 * @return {Array}   
 */
module.exports.myip = function() {
	var ip_address = [];
	var nets = os.networkInterfaces();

	for (var attr in nets) {
		var item = nets[attr];
		for (var j=0; j<item.length; j++) {
			// 주소형식이 IPv4이면서 로컬아이피가 아닌 경우
			if (item[j].family == 'IPv4' && item[j].address != '127.0.0.1') {
				ip_address.push(item[j].address);
			}
		}
	}

	return ip_address;
};


/**
 * 현재 시스템의 시각을 리턴한다.
 */
module.exports.getDateTime = function() {
    var now = new Date();
    var datetime = {
        yy : now.getFullYear(),
        mm : now.getMonth(),
        dd : now.getDate(),
        hh : now.getHours(),
        mi : now.getMinutes(),
        ss : now.getSeconds()
    };
    return datetime;
};

module.exports.leadingZeros = function(n, digits) {
    var zero = '';
    n = n.toString();

    if (n.length < digits) {
        for (var i = 0; i < digits - n.length; i++)
            zero += '0';
    }
    return zero + n;
};

module.exports.getDday = function(y, m, d) {
    // 오늘 날짜
    var today = new Date();
    // 파라미터로 받은 날짜
    // 정상적인 날짜값을 받은 경우, Javascript의 객체에 전달할 때는 "-1"처리해 주어야 한다.
    var dday = new Date(y, m - 1, d);
    // 두 날짜간의 차이를 구한다.
    var cnt = dday.getTime() - today.getTime();
    // 남은 날짜는 1시간이라도 1일로 계산해야 하므로, 연산결과를 올림한다.
    var n = Math.ceil(cnt / (24 * 60 * 60 * 1000));
    return n;
};
/*
 * 페이지 구현에 필요한 변수값들을 계산한다.
 * @param  total_count     - 페이지 계산의 대상이 되는 전체 데이터 수
 * @param  now_page        - 현재 페이지
 * @param  list_count      - 한 페이지에 보여질 목록의 수
 * @param  group_count     - 페이지 그룹 수
 * @return Object - now_page     : 현재 페이지
 *               - total_count  : 전체 데이터 수
 *               - list_count   : 한 페이지에 보여질 목록의 수
 *               - total_page   : 전체 페이지 수
 *               - group_count  : 한 페이지에 보여질 그룹의 수
 *               - total_group  : 전체 그룹 수
 *               - now_group    : 현재 페이지가 속해 있는 그룹 번호
 *               - group_start  : 현재 그룹의 시작 페이지
 *               - group_end    : 현재 그룹의 마지막 페이지
 *               - prev_group_last_page  : 이전 그룹의 마지막 페이지
 *               - next_group_first_page : 다음 그룹의 시작 페이지
 *               - offset       : SQL의 LIMIT절에서 사용할 데이터 시작 위치
 */
module.exports.get_page_info = function(total_count, now_page, list_count, group_count) {
    // 한 페이지당 그룹 수가 정해지지 않았다면 5개로 강제 설정
    if (group_count == undefined) { group_count = 5; }

    // 한 페이지의 목록 수가 정해지지 않았다면 15개로 강제 설정
    if (list_count == undefined) { list_count = 15; }

    // 현제 페이지 번호가 없다면 1페이지로 강제 설정
    if (now_page == undefined) { now_page = 1; }

    group_count = parseInt(group_count);
    list_count = parseInt(list_count);
    now_page = parseInt(now_page);

    // 전체 페이지 수
    var total_page = parseInt(((total_count - 1) / list_count)) + 1;

    // 전체 그룹 수
    var total_group = parseInt(((total_page) - 1) / (group_count)) + 1;

    // 현재 페이지가 속한 그룹
    var now_group = parseInt(((now_page - 1) / group_count)) + 1;

    // 현재 그룹의 시작 페이지 번호
    var group_start = parseInt(((now_group - 1) * group_count)) + 1;

    // 현재 그룹의 마지막 페이지 번호
    var group_end = Math.min(total_page, now_group * group_count);

    // 이전 그룹의 마지막 페이지 번호
    var prev_group_last_page = 0;
    if (group_start > group_count) { prev_group_last_page = group_start - 1; }

    // 다음 그룹의 시작 페이지 번호
    var next_group_first_page = 0;
    if (group_end < total_page) { next_group_first_page = group_end + 1; }

    // LIMIT 절에서 사용할 데이터 시작 위치
    var offset = (now_page - 1) * list_count;

    // 리턴할 데이터들을 객체로 묶기
    return {
        now_page : now_page,
        total_count :  total_count,
        list_count :  list_count,
        total_page : total_page,
        group_count : group_count,
        total_group : total_group,
        now_group : now_group,
        group_start : group_start,
        group_end : group_end,
        prev_group_last_page : prev_group_last_page,
        next_group_first_page : next_group_first_page,
        offset : offset
    };
};

module.exports.random = function(n1, n2) {
    return parseInt(Math.random() * (n2 - n1 + 1)) + n1;
};

module.exports.get_random_string = function(len) {
    var temp = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
    var temp_len = temp.length;
    var str = '';

    for(var i = 0; i < len; i++) {
        var p = this.random(0, temp_len-1);
        var word = temp.substring(p, p+1);
        str += word;
    }
    return str;
}
