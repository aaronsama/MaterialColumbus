'use strict';

angular.module('tracks')

.service('TracksDataService', function($window, $q, $indexedDB, $rootScope, ColumbusConverter){

  var OBJECT_STORE_NAME = 'tracklogs',
      //tracklogsMetaStore = $indexedDB.objectStore(OBJECT_STORE_NAME),
      tracksCache = {},
      tDir,
      tracks = [];

  // Tracklogs dir

  var restoreTracklogsDir = function(entryId){
    var deferred = $q.defer();

    chrome.fileSystem.restoreEntry(entryId, function(entry){
      tDir = entry;
      deferred.resolve(tDir);
    });

    return deferred.promise;
  };

  var tracklogsDir = function(){
    var deferred = $q.defer();

    if (tDir){
      deferred.resolve(tDir);
      return deferred.promise;
    } else {
      chrome.storage.local.get('tracklogs-dir', function(items){
        if (items['tracklogs-dir']){
          return restoreTracklogsDir(items['tracklogs-dir']);
        } else {
          return chooseTracklogsDir();
        }
      });
    }

  };

  var chooseTracklogsDir = function(){
    var deferred = $q.defer();

    chrome.fileSystem.chooseEntry({ type: 'openDirectory' },
      function(dirEntry) {
        var tracklogsDirEntry = chrome.fileSystem.retainEntry(dirEntry);
        chrome.storage.local.set({'tracklogs-dir': tracklogsDirEntry}, function() {
          deferred.resolve(tracklogsDirEntry);
        });
      }
    );

    return deferred.promise;
  };

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (changes['tracklogs-dir']) {
      restoreTracklogsDir(changes['tracklogs-dir'].newValue).then(function(){
        console.log('Tracklogs dir changed');
      });
    }
  });

  // Tracklogs
  var calculateTotalDistance = function(track) {
    var dist = 0;
    angular.forEach(track.points,function(val,idx){
      if (idx > 0){
        var prevPoint = new L.LatLng(track.points[idx-1].latitude, track.points[idx-1].longitude);
        dist += new L.LatLng(val.latitude, val.longitude).distanceTo(prevPoint);
      }
    });
    return dist / 1000.0;
  };

  var generateMetadata = function(track, file) {
    if (file) {
      track.uri = chrome.fileSystem.retainEntry(file);
    }

    return {
      name: track.name,
      title: track.title,
      date: track.points[0].timestamp,
      year: track.points[0].timestamp.getFullYear(),
      month: track.points[0].timestamp.getMonth() + 1,
      start: track.start,
      end: track.end,
      start_point: 0,//heads up: you can use it in the future to trim without destroying the original file
      end_point: track.points.length - 1,
      time: $(track.points).last()[0].timestamp - track.points[0].timestamp,
      distance: calculateTotalDistance(track),
      notes: track.notes ? track.notes : 'Double click to add some notes',
      uri: track.uri
    };
  };

  var updateTracks = function(){
    $indexedDB.openStore(OBJECT_STORE_NAME, function(tracklogsMetaStore){
      tracklogsMetaStore.getAll().then(function(allTracks){
        tracks = allTracks.sort(function(t1, t2){
          return t1.date - t2.date;
        });
      }, function(reason){
        console.log(reason);
        tracks = [];
      });
    });
  };
  //first run
  updateTracks();

  var all = function(){
    return tracks;
  };

  var recent = function(){
    if (tracks.length > 10){
      return tracks.slice(tracks.length - 10);
    } else {
      return tracks;
    }
  };

  var years = function(){
    var years = [];
    angular.forEach(tracks, function(track){
      if (years.indexOf(track.year) === -1) {
        years.push(track.year);
      }
    });
    return years.slice().reverse();
  };

  var add = function(track, entry){
    var deferred = $q.defer();

    //1. save a copy
    tracklogsDir().then(function(ttDir){
      chrome.fileSystem.getWritableEntry(ttDir, function(wTracklogsDir){
        entry.copyTo(wTracklogsDir, entry.name, function(newFile){
          //2. save metadata
          var metadata = generateMetadata(track, newFile);
          $indexedDB.openStore(OBJECT_STORE_NAME, function(tracklogsMetaStore){
            tracklogsMetaStore.insert(metadata).then(function(newRecordId){
              if (newRecordId){
                //3. save to cache
                tracks.push(metadata);
                tracksCache[track.name] = angular.extend(metadata, track);
                deferred.resolve();
              } else {
                deferred.reject('Duplicate entry?');
              }
            }, function(reason){
              deferred.reject(reason);
            });
          });
        }, function(e){
          deferred.reject(e);
        });
      });
    });

    return deferred.promise;
  };

  var get = function(trackName){
    var d = $q.defer();

    if (tracksCache[trackName]){
      // if the track is already cached, retrieve from cache
      d.resolve(tracksCache[trackName]);
    } else {
      $indexedDB.openStore(OBJECT_STORE_NAME, function(tracklogsMetaStore){
        // restore the file
        tracklogsMetaStore.find(trackName)
        .then(function(track){
          chrome.fileSystem.restoreEntry(track.uri, function(trackFile){
            trackFile.file(function(file) {
              var reader = new FileReader();

              reader.onerror = function() {
                d.reject('Error loading file');
              };

              reader.onloadend = function(e) {
                // when finished reading, convert only the points (we already have the rest)
                var points = ColumbusConverter.convertPoints(e.target.result);
                // if successful, cache and return the track with points
                tracksCache[track.name] = angular.extend(track, {points: points});
                d.resolve(tracksCache[track.name]);
              };

              reader.readAsText(file);
            });
          });
        }, function(reason){
          d.reject(reason);
        });

      });
    }

    return d.promise;
  };

  var update = function(track) {
    var d = $q.defer();

    $indexedDB.openStore(OBJECT_STORE_NAME, function(tracklogsMetaStore){
      tracklogsMetaStore.upsert([generateMetadata(track)]).then(function(){
        tracksCache[track.name] = track;
        d.resolve();
      }, function(reason){
        d.reject(reason);
      });
    });

    return d.promise;
  };

  // var del = function(track) {
  //   db.remove(track);
  // };

  var tracksIn = function(year){
    var d = $q.defer();

    $indexedDB.openStore(OBJECT_STORE_NAME, function(tracklogsMetaStore){
      tracklogsMetaStore.findBy('year_idx',year).then(function(tracks){
        d.resolve(tracks);
      }, function(reason){
        d.reject(reason);
      });
    });
    // if (month){
    //   //query by year and month
    // } else {

    // }
    return d.promise;
  };

  // var altitudeProfile = function(track){
  //   return $q(function(resolve, reject){
  //     var data = [];

  //     if (track && track.points) {
  //       angular.forEach(track.points, function(point){
  //         data.push([point.timestamp, parseInt(point.height)]);
  //       });

  //       resolve({
  //         name: track.start + " to " + track.end,
  //         data: data
  //       });
  //     } else {
  //       reject("No data!");
  //     }
  //   });
  // };

  return {
    tracklogsDir: tracklogsDir,
    chooseTracklogsDir: chooseTracklogsDir,
    refresh: updateTracks,
    all: all,
    recent: recent,
    years: years,
    tracksIn: tracksIn,
    add: add,
    get: get,
    update: update//,
    // del: del,
    // altitudeProfile: altitudeProfile
  };

});