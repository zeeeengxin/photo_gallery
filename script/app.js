var app = angular.module("miniFlickr", ['akoenig.deckgrid', 'me-lazyload']);

app.controller("photoCtrl", ["$http", "$scope", "$filter", function($http, $scope, $filter) {
	$scope.getTheme = function(theme) {
		$http.get("api/v1/photos/"+ theme)
		.then(function(response) {
			$scope.photos = response.data;
			// reset everything
			$scope.tagsFilter = ''; 
			$scope.filteredPhotos = $scope.photos;
			$scope.pinFilter = 'all';
			$scope.togglePinned('all'); // how to treat previously pinned photos?
		})
	}

	$scope.searchTags = function() {
		if ($scope.tagsFilter === '') {
			if ($scope.pinFilter === 'all') {
				$scope.filteredPhotos = $scope.photos;
			} else if ($scope.pinFilter === 'pinned') {
				$scope.filteredPhotos = $filter('filter')($scope.photos, {pinned: true});
			}
		} else {
			if ($scope.pinFilter === 'all') {
				$scope.filteredPhotos = $filter('filter')($scope.photos, {tags: $scope.tagsFilter});
			} else if ($scope.pinFilter === 'pinned') {
				$scope.filteredPhotos = $filter('filter')($scope.photos, {pinned: true, tags: $scope.tagsFilter}); 
			}
		}
	};

	$scope.pin = function (index) {
		var currentPinStatus = $scope.photos[index].pinned;
		if (currentPinStatus == null) {
			$scope.photos[index].pinned = true;
		} else {
			$scope.photos[index].pinned = !currentPinStatus;
		}
	};

	$scope.togglePinned = function(pinFilter) {
		$scope.pinFilter = pinFilter;
		if (pinFilter === 'all') {
			if ($scope.tagsFilter === '') {
				$scope.filteredPhotos = $scope.photos;
			} else {
				$scope.filteredPhotos = $filter('filter')($scope.photos, {tags: $scope.tagsFilter});
			}
		} else if (pinFilter === 'pinned') {
			if ($scope.tagsFilter === '') {
				$scope.filteredPhotos = $filter('filter')($scope.photos, {pinned: true});
			} else {
				$scope.filteredPhotos = $filter('filter')($scope.photos, {pinned: true, tags: $scope.tagsFilter}); 
			}
		}
	};

	$scope.downloadPic = function() {
		var zip = new JSZip();
		var count = 0;
		$scope.filteredPhotos.forEach(function(photo) {
			$http.get(photo.src, {responseType: "arraybuffer"})
			.then(function successCallback(response) {
				zip.file(photo.title + ".jpg", response.data, {binary:true});
				count++;
				if (count === $scope.filteredPhotos.length) {
					zip.generateAsync({type:"blob"})
		    		.then(function(content) {
		        		saveAs(content, "pictures.zip");
		    		});
				}
			}, function errorCallback(response) {
				console.log(response);
			});
		});	
	}

	$scope.getTheme('flower');
}]);