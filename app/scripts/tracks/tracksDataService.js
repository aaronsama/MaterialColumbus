angular.module('tracks')

.factory('TracksDataService', function($window, $q, $indexedDB, $rootScope, ColumbusConverter){

  var OBJECT_STORE_NAME = 'tracklogs',
      tracklogsMetaStore = $indexedDB.objectStore(OBJECT_STORE_NAME),
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
  var updateTracks = function(){
    tracklogsMetaStore.getAll().then(function(allTracks){
      tracks = allTracks;
    }, function(reason){
      console.log(reason);
      tracks = [];
    });
  };
  //first run
  updateTracks();

  var all = function(){
    return tracks;
  };

  var add = function(track, entry){
    var deferred = $q.defer();

    //1. save a copy
    tracklogsDir().then(function(ttDir){
      chrome.fileSystem.getWritableEntry(ttDir, function(wTracklogsDir){
        entry.copyTo(wTracklogsDir, entry.name, function(newFile){
          //2. save metadata
          var metadata = {
            name: track.name,
            date: track.points[0].timestamp,
            start: track.start, //heads up: you can use it in the future to trim without destroying the original file
            end: track.end,
            notes: 'Double click to add some notes',
            uri: chrome.fileSystem.retainEntry(newFile)
          };
          tracklogsMetaStore.insert(metadata).then(function(newRecordId){
            if (newRecordId){
              //3. save to cache
              tracks.push(metadata);
              tracksCache[track.date] = track;
              deferred.resolve();
            } else {
              deferred.reject('Duplicate entry?');
            }
          }, function(reason){
            deferred.reject(reason);
          });
        }, function(e){
          deferred.reject(e);
        });
      });
    });

    return deferred.promise;
  };

  var get = function(track){
    var d = $q.defer();

    if (tracksCache[track.date]){
      // if the track is already cached, retrieve from cache
      d.resolve(tracksCache[track.date]);
    } else {
      // restore the file
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
            tracksCache[track.date] = angular.extend(track, {points: points});
            d.resolve(tracksCache[track.date]);
          };

          reader.readAsText(file);
        });
      });
    }

    return d.promise;
  };

  // var update = function(name, data) {
  //   db.get(name).then(function(track){
  //     db.put(angular.extend(track, data)).then(function(response){
  //       console.log(response);
  //     });
  //   });
  // };

  // var del = function(track) {
  //   db.remove(track);
  // };

  var tracksIn = function(year, month){
    if (month){
      //query by year and month
    } else {
      //$indexedDb.queryBuilder().$index('date_idx').$between(...)
    }
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
    add: add,
    get: get

    //,
    // update: update,
    // del: del,
    // altitudeProfile: altitudeProfile
  };

});