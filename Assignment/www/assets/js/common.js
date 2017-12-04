// var homeurl = 'http://192.168.0.49:3000';
// var apiurl = 'http://192.168.0.49:3000';
//var homeurl = 'http://jobinterview.run.goorm.io';
//var apiurl = 'http://jobinterview.run.goorm.io';
var homeurl = 'http://localhost:3000';
var apiurl = 'http://localhost:3000';


function random(n1, n2) {
    return parseInt(Math.random() * (n2 - n1 + 1)) + n1;
}

function IntervalFunc(tmpl) {
    var resource = $(tmpl);
    if (resource.length > 0) {
        var counter = 0;
        var t = setInterval(function() {
            var source = $(tmpl).html();
            if (!source) {
                counter++;
                if (counter > 3) {
                    return clearInterval(t);
                }
            }
        }, 50);
    }
}

function leadingZeros(n, digits) {
    var zero = '';
    n = n.toString();

    if (n.length < digits) {
        for (var i = 0; i < digits - n.length; i++)
            zero += '0';
    }
    return zero + n;
}



function select_methodday(a) {
    if (a == 'C') {
        $(".ingr_c").addClass("method_select");
        $(".ingr_f").removeClass("method_select");
        $(".ingr_r").removeClass("method_select");
        $(".ingr_f").addClass("method_unselect");
        $(".ingr_r").addClass("method_unselect");
    }
    if (a == 'F') {
        $(".ingr_f").addClass("method_select");
        $(".ingr_c").removeClass("method_select");
        $(".ingr_r").removeClass("method_select");
        $(".ingr_c").addClass("method_unselect");
        $(".ingr_r").addClass("method_unselect");
    }
    if (a == 'R') {
        $(".ingr_r").addClass("method_select");
        $(".ingr_c").removeClass("method_select");
        $(".ingr_f").removeClass("method_select");
        $(".ingr_c").addClass("method_unselect");
        $(".ingr_f").addClass("method_unselect");
    }
}

function daycolor(json) {
    for (var i = 0; i < json.item.length; i++) {

        if (json.item[i].timer && json.item[i].timer < 0) {
            $("#fi li:nth-child(" + (i + 2) + ") span:nth-child(2)").addClass('blink2');
        }
        if (json.item[i].timer === 0) {

            $("#fi li:nth-child(" + (i + 2) + ") span:nth-child(2)").addClass('blink');
        }
        if (json.item[i].timer && json.item[i].timer > 0 && json.item[i].timer < 4) {
            $("#fi li:nth-child(" + (i + 2) + ") span:nth-child(2)").addClass('blink1');

        }

        if (json.item[i].timer && json.item[i].timer >= 4 && json.item[i].timer < 10) {
            $("#fi li:nth-child(" + (i + 2) + ") span:nth-child(2)").css({ 'background-color': 'green' });
        }
        if (json.item[i].timer && json.item[i].timer >= 10) {
            $("#fi li:nth-child(" + (i + 2) + ") span:nth-child(2)").css({ 'background-color': ' blue' });
        }
    }
}

function getDday(y, m, d) {
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
}
//파일 요소에 대한 이미지 미리보기
function filePreview(preview_id, input) {
    //<div>의 id, <input>에 대한 jQuery객체
    var files = input.get(0).files;
    // alert(files.length);
    //일반 html 객체로변환
    if (files) {
        for (var i = 0; i < files.length; i++) {
            //파일리더 객체 생성
            var reader = new FileReader();
            //파일리더가 파일 읽기를 완료 했을 경우의 이벤트 구현
            reader.onload = function(e) {
                var img = $("<img>");
                img.attr('src', e.target.result);
                img.css({
                    "width": $(window).width() * 0.4,
                    "height": $(window).width() * 0.3,
                });


                // alert(e.target.result);
                img.addClass('img-preview');
                $(preview_id).append(img);
            };

            //파일리더에게 input요소에 선택된 파일을 읽도록 지정한다.
            reader.readAsDataURL(files[i]);
        }
    }

}


$(function() {
    // cordova 초기화 완료 이벤트
    $(document).on('deviceready', function() {
        console.log("-------- cordova deviceready start ---------");

        delete window.open;
        window.open = function(url, name, option) {
            var win = cordova.InAppBrowser.open(url, '_blank', 'location=no, hidden=no');
        };

        console.log("-------- cordova deviceready end ---------");
    });

    // cordova인 경우 homeurl 변수값을 cordova의 내부 URL로 사용한다.
    var current_url = window.location.href;
    var p = current_url.indexOf('/www');
    if (p > -1) {
        homeurl = current_url.substring(0, p + 4);
    }

    // 파일요소들에 대해서 이미지 미리보기 기능 추가
    $("input[type='file'][data-preview]").change(function() {
        var preview_id = $(this).data('preview');
        $(preview_id).empty();
        filePreview(preview_id, $(this));
    });


});