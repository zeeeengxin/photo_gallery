var express = require('express');
var router = express.Router();

var flickrService = require('../services/flickrService');

router.get('/photos/:theme', function (req, res) {
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress;
    console.log("Got a client request from " + ip);
	
	flickrService.getRecentFlickrPhotos(req.params.theme, function() {
		var photos = flickrService.recentPhotos;
		res.json(photos);
	});
});

module.exports = router;