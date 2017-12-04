/*!
 * string.js
 * 문자열 관련 공통 기능들
 */

if (!String.format) {
    String.format = function (format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}

/**
 * 정규표현식에 부합되는지 검사 (내부용)
 */
String.prototype.isPattern = function (pattern) {
    return pattern.test(this);
};


/**
 * 숫자만 추출한다.
 */
String.prototype.filterNum = function () {
    var str = this;
    str = str.replace(/[^0-9.]/g, '');
    return str;
}

/**
 * 3자리마다 콤마를 덧붙인다.
 */
String.prototype.commaNum = function () {
    var len, point, str;

    point = this.length % 3;
    len = this.length;

    str = this.substring(0, point);
    while (point < len) {
        if (str != "")
            str += ",";
        str += this.substring(point, point + 3);
        point += 3;
    }
    return str;
};

/**
 * 값이 존재 하는지 검사.
 * 공백, 탭 등의 문자열들은 없는것으로 간주한다.
 */
String.prototype.isValue = function () {
    if (this == null || this.replace(/ /gi, "") == "") {
        return false;
    }
    return true;
};

/**
 * 숫자만 구성되었는지 검사
 */
String.prototype.isNumber = function () {
    // String의 prototype에서 this는 문자열의 내용 자체.
    return this.isPattern(/^[0-9]*$/);
};

/**
 * 영어 알파벳만 사용되었는지 검사
 */
String.prototype.isAlphabet = function () {
    return this.isPattern(/[A-Z]|[a-z]/);
};

/**
 * 영어 알파벳과 숫자만 사용되었는지 검사
 */
String.prototype.isAlphabetNum = function () {
    return this.isPattern(/[A-Z]|[a-z]|[0-9]/);
};

/**
 * 영어 알파벳 대문자만 사용되었는지 검사
 */
String.prototype.isUpperCase = function () {
    return this.isPattern(/[A-Z]/);
};

/**
 * 영어 알파벳 소문자만 사용되었는지 검사
 */
String.prototype.isLowerCase = function () {
    return this.isPattern(/[a-z]/);
};

/**
 * 영어 알파벳 대문자와 숫자만 사용되었는지 검사
 */
String.prototype.isUpperCaseNum = function () {
    return this.isPattern(/[A-Z]|[0-9]/);
};

/**
 * 영어 알파벳 소문자와 숫자만 사용되었는지 검사
 */
String.prototype.isLowerCaseNum = function () {
    return this.isPattern(/[a-z]|[0-9]/);
};

/**
 *  한글로만 되어 있는지 검사
 */
String.prototype.isKor = function () {
    return this.isPattern(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/);
};

/**
 * 아이피주소 형식인지 검사
 */
String.prototype.isIp = function () {
    return this.isPattern(/^(1|2)?\d?\d([.](1|2)?\d?\d){3}$/);
};

/**
 * 핸드폰번호 형식인지 검사 ('-'제외)
 */
String.prototype.isCellphone = function () {
    return this.isPattern(/^01([0|1|6|7|8|9]?)?([0-9]{3,4})?([0-9]{4})$/);
};

/**
 * 집전화 번호 형식인지 검사 ('-'제외)
 */
String.prototype.isTelphone = function () {
    return this.isPattern(/^\d{2,3}?\d{3,4}?\d{4}$/);
};

/**
 * URL형식인지 검사
 */
String.prototype.isUrl = function () {
    return this.isPattern(/(?:(?:(https?|ftp|telnet):\/\/|[\s\t\r\n\[\]\`\<\>\"\'])((?:[\w$\-_\.+!*\'\(\),]|%[0-9a-f][0-9a-f])*\:(?:[\w$\-_\.+!*\'\(\),;\?&=]|%[0-9a-f][0-9a-f])+\@)?(?:((?:(?:[a-z0-9\-가-힣]+\.)+[a-z0-9\-]{2,})|(?:[\d]{1,3}\.){3}[\d]{1,3})|localhost)(?:\:([0-9]+))?((?:\/(?:[\w$\-_\.+!*\'\(\),;:@&=ㄱ-ㅎㅏ-ㅣ가-힣]|%[0-9a-f][0-9a-f])+)*)(?:\/([^\s\/\?\.:<>|#]*(?:\.[^\s\/\?:<>|#]+)*))?(\/?[\?;](?:[a-z0-9\-]+(?:=[^\s:&<>]*)?\&)*[a-z0-9\-]+(?:=[^\s:&<>]*)?)?(#[\w\-]+)?)/gmi);
};

/**
 * 입력값이 이메일 형식인지 체크
 */
String.prototype.isEmail = function () {
    return this.isPattern(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/);
};

/**
 * 입력값의 바이트 길이를 리턴
 */
String.prototype.getByteLength = function () {
    var byteLength = 0;
    for (var inx = 0; inx < this.length; inx++) {
        var oneChar = escape(this.charAt(inx));
        if (oneChar.length == 1) {
            byteLength++;
        } else if (oneChar.indexOf("%u") != -1) {
            byteLength += 2;
        } else if (oneChar.indexOf("%") != -1) {
            byteLength += oneChar.length / 3;
        }
    }
    return byteLength;
};

/**
 * 문자열에서 search를 replacement로 바꾼다.
 */
String.prototype.replaceAll = function (search, replacement) {
    return this.replace(new RegExp(search, 'g'), replacement);
};

/**
 * 주민번호 형식이 맞는지 검사한다.
 */
String.prototype.isJumin = function () {
    // String은 자기 자신이 문자열 값이므로,
    // 문자열 값에 접근하기 위해서는 "this"키워드를 직접 사용해야 한다.

    // 값이 없는 경우
    if (this == '') {
        console.log("값이 저장되어 있지 않음");
        return false;
    }

    // 13글자가 아닌 경우
    if (this.length != 13) {
        console.log("13글자 아님");
        return false;
    }

    // 숫자로 변경할 수 없는 경우 > 숫자만 입력해야 함
    if (isNaN(this)) {
        console.log("숫자 변환 불가");
        return false;
    }

    // 빈 배열을 만든다.
    var a = new Array();

    // 한 글자씩 잘라서 배열로 담는다. --> 배열의 확장
    for (var i = 0; i < this.length; i++) {
        a[i] = parseInt(this.charAt(i));
    }

    // 주민번호 계산 식 적용 (출처: 인터넷 어디어디)
    var k = 11 - (((a[0] * 2) + (a[1] * 3) + (a[2] * 4) + (a[3] * 5) + (a[4] * 6) + (a[5] * 7) + (a[6] * 8) + (a[7] * 9) + (a[8] * 2) + (a[9] * 3) + (a[10] * 4) + (a[11] * 5)) % 11);

    if (k > 9) {
        k -= 10;
    }

    if (k != a[12]) {
        // 주민번호 아님
        console.log("주민번호 형식 검사 수식에 맞지 않음");
        return false;
    }

    // 모든 과정을 무사 통과하면 주민번호 형식 맞음
    return true;
};

/**
 * 사업자 등록번호 형식이 맞는지 검사한다.
 */
String.prototype.isCompanyIdentify = function () {
    return this.isPattern(/([0-9]{3})-?([0-9]{2})-?([0-9]{5}$)/);
};