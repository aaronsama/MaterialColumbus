angular.module('tracks')

.controller('TracksController', ['$scope', '$rootScope', '$mdToast', '$timeout', '$location', 'TracksDataService', 'ColumbusConverter', function($scope,$rootScope,$mdToast,$timeout,$location,TracksDataService,columbusConverter){
  $scope.tracks = TracksDataService.all;
  // $scope.tracksIn = TracksDataService.tracksIn;
  $scope.years = TracksDataService.years;
  $scope.trackLoading = false;

  $scope.$watch('selectedIndex', function(current){
    $scope.selectedYear = $scope.years()[current];
  });

  $scope.openFileChooser = function(){
    chrome.fileSystem.chooseEntry({type: 'openFile', accepts: [{ mimeTypes: ['text/csv']}]}, function(readOnlyEntry) {
      readOnlyEntry.file(function(file) {
        var reader = new FileReader();

        reader.onerror = function(e) {
          $mdToast.showSimple('Error loading file');
        };

        reader.onloadend = function(e) {
          $scope.addColumbusTrack(readOnlyEntry, e.target.result);
        };

        reader.readAsText(file);
      });
    });
  };

  $scope.addColumbusTrack = function(entry, $fileContent){
    var name = entry.name;
    $scope.trackLoading = true;

    columbusConverter.convertCSV(name, $fileContent)
    .then(function(track){
      TracksDataService.add(track, entry).then(function(){
        $scope.trackLoading = false;
        TracksDataService.refresh();
      }, function(reason){
        $scope.trackLoading = false;
        $mdToast.showSimple('Can\'t add this track! ' + reason);
      });
    }, function(reason){
      $scope.trackLoading = false;
      $mdToast.showSimple('Can\'t add this track! ' + reason);
    });
  };

  $scope.select = function(track){
    $location.path('/tracks/' + track.name);
  };

  $scope.tracksIn = function(year, month){
    TracksDataService.tracksIn(year, month).then(function(result){

    }, function(reason){

    });
  };

  var reloadMasonry = function(delay){
    $timeout(function(){
      $('#tracks-masonry-container').masonry();
    },delay);
  };

}])

.controller('TrackDetailsController', ['$scope', '$routeParams', '$location', '$mdToast', 'TracksDataService', function($scope, $routeParams, $location, $mdToast, TracksDataService){

  $scope.trackLoading = true;

  TracksDataService.get($routeParams.trackName).then(function(trackData){
    $scope.selectedTrack = trackData;
    postToWebview(trackData);
  }, function(reason){
    $mdToast.showSimple(reason);
  });

  $scope.deselectTrack = function(){
    postToWebview(null);
    $location.path('/tracks');
  };

  var postToWebview = function(track){
    var webview = document.querySelector('webview');
    webview.contentWindow.postMessage({track: track},'chrome-extension://laddhngkclengmbmkjhdbnddglncbejf/map.html#!/');
  };

  $scope.$root.$on('$messageIncoming', function (event, data){
    $scope.trackLoading = false;

    if (data.error){
      $mdToast.showSimple(data.error);
    } else if (data.message === 'trackDisplayed'){
      //reloadMasonry(500);
    }
  });

}])

// //Credit for ngBlur and ngFocus to https://github.com/addyosmani/todomvc/blob/master/architecture-examples/angularjs/js/directives/
.directive('ngBlur', function() {
  return function( scope, elem, attrs ) {
    elem.bind('blur', function() {
      scope.$apply(attrs.ngBlur);
    });
  };
})

.directive('ngFocus', function( $timeout ) {
  return function( scope, elem, attrs ) {
    scope.$watch(attrs.ngFocus, function( newval ) {
      if ( newval ) {
        $timeout(function() {
          elem[0].focus();
        }, 0, false);
      }
    });
  };
})

.filter('trackDuration',function(){
  return function(input){
    return moment.duration(input).humanize();
  };
});

// angular.module('tracks',['columbusTrack','trackDisplay','dateFilters'])

// .controller('TracksController', ['$scope', '$rootScope', '$filter', 'columbusConverter', 'TracksDataService', 'FoundationApi', function($scope, $rootScope, $filter, columbusConverter, TracksDataService, foundationApi){

//   $scope.tracks = TracksDataService.db;
//   $scope.editedTrackNotes = null;
//   $scope.selectedTrack = null;
//   $scope.altChartConfig = {
//     options: {
//       title: {
//         text: 'Altitude Profile'
//       },
//       chart: {
//         type: 'area'
//       },
//       lang: {
//         noData: 'No Data to Display!'
//       }
//     },
//     loading: true,
//     size: {
//       width: 800,
//       height: 400
//     }
//   };

//   $rootScope.$on('pictureSelected', function(event, timestamp) {
//     var datetime = moment(timestamp, "YYYY:MM:DD HH:mm:ss");
//     // var datetime = new (Date.bind.apply(Date, [null].concat(timestamp.split(/ |:/))))();

//     if ($scope.selectedTrack) {
//       var candidatePoint,
//           minDist = 5000; //turn that 5000 into a variable

//       $scope.selectedTrack.points.forEach(function(point){
//         var diff = Math.abs(datetime.diff(point.timestamp));
//         if (diff <= minDist){
//           minDist = diff;
//           candidatePoint = point;
//         }
//       });

//       if (candidatePoint){
//         var webview = document.querySelector('webview');
//         webview.contentWindow.postMessage({point: candidatePoint},'chrome-extension://lllnimfggckmlgjamendhnigclmbnofo/map.html#!/');
//       } else {
//         foundationApi.publish('main-notifications', { title: "Can't geolocate picture", content: "Can't find a candidate point", color: "alert" });
//       }
//     } else {
//       foundationApi.publish('main-notifications', { title: "Can't geolocate picture", content: "You need to select a track first!", color: "alert" });
//     }
//   });


//   $scope.removeTrack = function(track) {
//     if (track === $scope.selectedTrack) {
//       $scope.selectedTrack = null;
//     }
//     TracksDataService.del(track);
//   };




//   //load the altitude profile when the track stats modal is opened
//   foundationApi.subscribe('track-stats', function(msg){
//     if (msg === 'open') {
//       TracksDataService.altitudeProfile($scope.selectedTrack).then(function(resp){
//         $scope.altChartConfig.series = [resp];
//         $scope.altChartConfig.loading = false;
//       });
//     } else if (msg === 'close') {
//       $scope.altChartConfig.loading = true;
//     }
//   });

// }])
