var request = require('request');
var key = require('./apiKey');

var recentPhotos = [];
var photoCount = 50;
var options = {
        url: 'https://api.flickr.com/services/rest/',
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        json: true
};

function getRecentFlickrPhotos(searchTag, callback) {
    var getPhotoQS = {
        api_key: key.api_key,
        method: 'flickr.photos.search',
        page: 1, 
        per_page: photoCount,
        tags: searchTag,
        format: 'json',
        nojsoncallback: 1
    }
    options.qs = getPhotoQS;
    request(options, function(err, response, body) {
        if (err) {
            console.log(err);
            return;
        }
        var photos = body.photos.photo;
        var i = 0;  
        // remember to reset recentPhotos
        recentPhotos.length = 0;
        photos.forEach(function (photo) {
            var title = photo.title;
            var link = composePhotoUrl(photo.owner, photo.id);
            var src = composePhotoSrc(photo);
            populateTags(photo.id, function (tags) {
                recentPhotos.push({
                    title: title,
                    link: link,
                    src: src,
                    tags: tags,
                    originalIndex: i++
                });
                if (recentPhotos.length === photos.length) {
                    callback();
                    return;
                }
            });
        });        
    });
}

function composePhotoUrl(userId, photoId) {
    //https://www.flickr.com/photos/12037949754@N01/155761353/
    return 'https://www.flickr.com/photos/' + userId + '/' + photoId;
}

function composePhotoSrc(photo) {
    //https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg
    return 'https://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '.jpg';
}

function populateTags(photoId, callback) {
    var getInfoQS = {
        api_key: key.api_key,
        method: 'flickr.photos.getInfo',
        format: 'json',
        photo_id: photoId,
        nojsoncallback: 1
    }
    options.qs = getInfoQS;
    request(options, function (err, response, body) {
        if (err) {
            console.log(err);
            return;
        }
        var rawTags = [];
        body.photo.tags.tag.forEach(function (tag) {
            rawTags.push(tag.raw);
        });
        tags = rawTags.join();
        callback(tags);
    });
}

module.exports = {
    getRecentFlickrPhotos: getRecentFlickrPhotos,
    recentPhotos: recentPhotos
};
