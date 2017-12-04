/**
 * 파라미터로 전달된 obj가 존재하는지 여부를 검사.
 */
Handlebars.registerHelper('is_visible', function(obj, options) {
    // 존재여부를 의미하는 변수.
    var visible = true;

    if (obj === undefined || obj === null) {
        visible = false;
    } else if (Array.isArray(obj) && obj.length < 1) {
        visible = false;
    } else if (typeof obj === 'boolean' && obj !== true) {
        visible = false;
    } else if (typeof obj === 'number' && obj < 1) {
        visible = false;
    } else if (typeof obj === 'string' && obj.length < 1) {
        visible = false;
    }

    if (visible === true) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('find', function(v1, v2, options) {
    if (v1.indexOf(v2) > -1) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});
