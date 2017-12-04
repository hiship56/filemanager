module.exports.session = {
	
	/** 세션 조회 API */
	read: function(req, res, next) {
		var sessions = {
			member: req.session.member
		};

		res.sendJson(sessions);
		
	}

};


