angular.module('ionic.utils', [])

.factory('$localstorage', ['$window', function($window) {
    return {
        set: function(key, value) {
            $window.localStorage[key] = value;
        },
        get: function(key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
            return JSON.parse($window.localStorage[key] || '{}');
        }
    }
}]);

angular.module('starter.services', [])

.factory('RunMode', function($localstorage, $ionicPopup) {

    var cameraOpen = false;

    if (typeof $localstorage.get('onMars') === 'undefined')
        $localstorage.set('onMars', 'false');
    var onMars = $localstorage.get('onMars') === 'true';

    if (typeof $localstorage.get('debugMode') === 'undefined')
        $localstorage.set('debugMode', 'false');
    var debug = $localstorage.get('debugMode') === 'true';

    if (typeof $localstorage.get('useRealtimeData') === 'undefined')
        $localstorage.set('useRealtimeData', 'true');
    var useRealtimeData = $localstorage.get('useRealtimeData') === 'true';

    if (typeof $localstorage.get('useLocalData') === 'undefined')
        $localstorage.set('useLocalData', 'true');
    var useLocalData = $localstorage.get('useLocalData') === 'true';

    var srv_url = 'http://www.lzxhahaha.com:96';

    return {
        srvUrl: function() {
            if (useLocalData)
                return '';
            else
                return srv_url;
        },
        setSrv: function(url) {
            srv_url = url;
            console.log('sss', srv_url);
        },
        openCamera: function(bool) {
            cameraOpen = bool;
        },
        toOpenCamera: function() {
            return cameraOpen;
        },
        showAlert: function(title, msg, callback) {
            var alertPopup = $ionicPopup.alert({
                title: title,
                template: msg
            });
            if (!callback)
                callback = function(res) {
                    console.log('alert callback fail');
                };
            alertPopup.then(callback);
            console.log('alert', title);
        },
        local: function() { return useLocalData; },
        localSwitch: function() {
            useLocalData = !useLocalData;
            $localstorage.set('useLocalData', useLocalData.toString());
        },
        realtime: function() {
            console.log('real time?', useRealtimeData);
            return useRealtimeData;
        },
        realtimeSwitch: function() {
            useRealtimeData = !useRealtimeData;
            $localstorage.set('useRealtimeData', useRealtimeData.toString());
        },
        onMars: function() { return onMars; },
        gcj02Switch: function() {
            onMars = !onMars;
            $localstorage.set('onMars', onMars.toString());
        },
        debug: function() {
            console.log('debug debug', debug, $localstorage.get('debugMode') === 'true');
            return debug;
        },
        debugSwitch: function() {
            debug = !debug;
            $localstorage.set('debugMode', debug.toString());
        },
        getRandomIcon: function() {
            var icons = ["tmp_avatar.jpg", "community-user1.jpg", "community-user2.jpg", "community-user3.jpg", "credits4.jpg"];
            var d = new Date().toISOString();
            var n = parseInt(d[21]+d[22]) || 0;
            console.log(d, n, n % icons.length);
            return "img/" + icons[n % icons.length];
        }
    };
})

.factory('UserInfo', function($localstorage, $http, RunMode) {

    var user = $localstorage.getObject('user');
    if ((typeof user.name) === 'undefined') {
        $localstorage.setObject('user', {
            login: false,
            name: '',
            token: '',
            follows: [],
            details: null
        });
        console.log('user undefined', JSON.stringify(user));
        user = $localstorage.getObject('user');
    }
    console.log('user', JSON.stringify(user));

    var getHeaders = function() {
        if (user.token)
            return {"Authorization": "Bearer " + user.token};
    };

    return {
        name: function() {return user.name;},
        token: function() {return user.token;},
        loggedin: function() {return user.login},
        login: function(loginData, callback) {
            var loginString = '';
            for (var prop in loginData)
                if( loginData.hasOwnProperty( prop ) )
                    loginString += prop + '=' + loginData[prop] + '&';
            console.log('loginString', loginString);
            $http({
                method: 'POST',
                url: RunMode.srvUrl() + '/Token',
                data: loginString
            })
            .success(function(data, status) {
                user.name = loginData.UserName;
                user.token = data.access_token;
                user.login = true;
                $localstorage.setObject('user', user);
                console.log('save user', JSON.stringify($localstorage.getObject('user')));
                user.details = {Complaints: []};
                callback();
            })
            .error(function(data, status) {
                console.log(status);
                // TODO err handle
                RunMode.showAlert(status, JSON.stringify(data));
            });
        },
        logout: function() {
            user = {login: false, name: '', token: ''};
            $localstorage.setObject('user', user);
        },
        getHeaders: function() {
            if (user.token)
                return {"Authorization": "Bearer " + user.token};
        },
        setName: function(name) {
            var user = $localstorage.getObject('user');
            user.name = name;
            user.token = '';
            user.login = true;
            console.log('set name', JSON.stringify(user));
            $localstorage.setObject('user', user);
        },
        getMy: function(callback) {
            $http({
                method: 'GET',
                url: RunMode.srvUrl() + '/api/Account/UserInfo',
                headers: getHeaders(),
                cache: false
            }).success(function(data) {
                user.details = data;
                callback(user.details);
            }).error(function() {
                user.details = {Complaints: []};
                callback(user.details);
            });
        },
        getAll: function(callback) {
            $http({
                method: 'GET',
                url: RunMode.srvUrl() + '/api/Account/AllUsers',
                cache: true
            }).success(callback)
            .error(function() {
                console.log('AllUsers error');
            });
        },
        followedList: function(userName, callback) {
            $http({
                method: 'GET',
                url: RunMode.srvUrl() + '/api/Account/FollowedList',
                params: {UserName: userName},
                headers: getHeaders(),
                cache: false
            }).success(callback);
        },
        likedList: function(userName, callback) {
            $http({
                method: 'GET',
                url: RunMode.srvUrl() + '/api/Account/LikedList',
                params: {UserName: userName},
                headers: getHeaders(),
                cache: false
            }).success(callback);
        }
    };
})

.factory('Camera', ['$q', function($q) {
    return {
        getPicture: function(options) {
            var q = $q.defer();

            navigator.camera.getPicture(function(result) {
                q.resolve(result);
            }, function(err) {
                q.reject(err);
            }, options);

            return q.promise;
        }
    }
}])

.factory('Geo', function($q) {
    return {
        reverseGeocode: function(lat, lng) {
            var q = $q.defer();

            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({
                'latLng': new google.maps.LatLng(lat, lng)
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    //console.log('Reverse', JSON.stringify(results[0]));
                    if(results.length > 1) {
                        var r = results[1];
                        var a, types;
                        var parts = [];
                        var foundLocality = false;
                        var foundState = false;
                        for(var i = 0; i < r.address_components.length; i++) {
                            a = r.address_components[i];
                            types = a.types;
                            for(var j = 0; j < types.length; j++) {
                                if(!foundLocality && types[j] == 'locality') {
                                    foundLocality = true;
                                    parts.push(a.long_name);
                                } else if(!foundState && types[j] == 'administrative_area_level_1') {
                                    foundState = true;
                                    parts.push(a.short_name);
                                }
                            }
                        }
                        console.log('Reverse', parts);
                        q.resolve(parts.join(', '));
                    }
                } else {
                    console.log('reverse fail', results, status);
                    q.reject(results);
                }
            })

            return q.promise;
        },
        reverseGeocodeDetail: function(lat, lng) {
            var q = $q.defer();

            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({
                'latLng': new google.maps.LatLng(lat, lng)
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    //console.log('Reverse', JSON.stringify(results[0]));
                    if(results.length > 0) {
                        var r = results[0];
                        var a, types;
                        var parts = [];
                        var foundRoute = false;
                        var foundSubLoc = false;
                        var foundLocality = false;
                        for(var i = 0; i < r.address_components.length; i++) {
                            a = r.address_components[i];
                            types = a.types;
                            for(var j = 0; j < types.length; j++) {
                                if(!foundRoute && types[j] == 'route') {
                                    foundRoute = true;
                                    parts.push(a.long_name);
                                } else if(!foundSubLoc && types[j] == 'sublocality_level_1') {
                                    foundSubLoc = true;
                                    parts.push(a.short_name);
                                } else if(!foundLocality && types[j] == 'locality') {
                                    foundLocality = true;
                                    parts.push(a.short_name);
                                }
                            }
                        }
                        console.log('Reverse Detail', parts);
                        q.resolve(parts.join(', '));
                    }
                } else {
                    console.log('reverse fail', results, status);
                    q.reject(results);
                }
            })

            return q.promise;
        },
        getLocation: function() {
            var q = $q.defer();

            navigator.geolocation.getCurrentPosition(function(position) {
                q.resolve(position);
            }, function(error) {
                q.reject(error);
            });

            return q.promise;
        }
    };
})

.factory('Complaints', function($http, $cordovaFile, UserInfo, RunMode, FileCache, LeanCloud) {
    var complaints = [];
    var complaintsByUser = [];
    var newComplaints = [];     // local cache for new posts
    var changeStatus = function(action, complaint_id, callback) {
        console.log('change status', action, complaint_id);
        $http({
            method: 'POST',
            url: RunMode.srvUrl() + '/api/Complaints/' + action,
            data: { 'UserName': UserInfo.name(), 'ComplaintId': complaint_id },
            //data: 'UserName=' + UserInfo.name() + '&ComplaintId=' + complaint_id,
            headers: getHeaders(),
            cache: false
        })
        .success(function() {
            UserInfo.getMy(callback);
        })
        .error(function() {
            console.log('put error')
        });
    };
    var getHeaders = function() {
        if (UserInfo.token())
            return {"Authorization": "Bearer " + UserInfo.token()};
    };
    var objName = "Complaints";

    return {
        getTest: function() {
            return $http({
                method: 'GET',
                url: 'data/complaints.json',
                cache: true
            }).then(function(response) {
                if (response.data.length > complaints.length) {
                    complaints = response.data;
                }
                return complaints;
            });
        },
        getTestMy: function() {
            var name = 'user1'; //UserInfo.name();
            return $http({
                method: 'GET',
                url: 'data/complaints.json',
                cache: true
            }).then(function(response) {
                if (response.data.length > complaints.length) {
                    complaints = response.data;
                }
                var myComplaints = newComplaints.slice();
                for (var i=0; i<complaints.length; i++)
                    if (complaints[i].UserName == name)
                        myComplaints.push(complaints[i]);
                return myComplaints;
            });
        },
        getTestByUser: function(name) {
            var userComplaints = [];
            return $http({
                method: 'GET',
                url: 'data/complaints.json',
                cache: true
            }).then(function(response) {
                complaints = response.data.complaints;
                for (var i=0; i<complaints.length; i++)
                    if (complaints[i].user == name)
                        userComplaints.push(complaints[i]);
                return userComplaints;
            });
        },
        getAll: function(callback) {
            FileCache.readFile(objName + '.json', callback, true);
            if (RunMode.local())
                LeanCloud.getData(callback, objName);
            else
                $http({
                    method: 'GET',
                    url: RunMode.srvUrl() + '/api/Complaints/GetAll',
                    cache: false
                }).success(function(data) {
                    console.log('Complaints.getAll success');
                    FileCache.saveFile(data, objName + '.json', true);
                    callback(data);
                }).error(function(error) {
                    console.log('Complaints.getAll error', '\nTry to fetch from backup ...');
                    LeanCloud.getData(callback, objName);
                });
        },
        getById: function(complaintId, callback) {
            var queryItem = "ComplaintId";
            FileCache.readFile(objName + '_' + complaintId + '.json', callback, false);
            if (RunMode.local())
                LeanCloud.getData(callback, objName, queryItem, complaintId, 1);
            else
                $http({
                    method: 'GET',
                    url: RunMode.srvUrl() + '/api/Complaints/GetById',
                    params: {id: complaintId},
                    cache: false
                }).success(function(data) {
                    console.log('Complaints.getByID success', complaintId);
                    FileCache.saveFile(data, objName + '_' + complaintId + '.json', false);
                    callback(data);
                }).error(function(error) {
                    console.log('Complaints.getByID error', complaintId, '\nTry to fetch from backup ...');
                    LeanCloud.getData(callback, objName, queryItem, complaintId, 1);
                });
        },
        getByUser: function(userName, callback) {
            var queryItem = "UserName";
            FileCache.readFile(objName + '_' + userName + '.json', callback, false);
            if (RunMode.local())
                LeanCloud.getData(callback, objName, queryItem, userName);
            else
                $http({
                    method: 'GET',
                    url: RunMode.srvUrl() + '/api/Complaints/GetByName',
                    params: {UserName: userName},
                    cache: false
                }).success(function(data) {
                    console.log('Complaints.getByUser success', userName);
                    FileCache.saveFile(data, objName + '_' + userName + '.json', false);
                    callback(data);
                }).error(function(error) {
                    console.log('Complaints.getByUser error', userName, '\nTry to fetch from backup ...');
                    LeanCloud.getData(callback, objName, queryItem, userName);
                });
        },
        addMyPost: function(post, callback) {
            //newComplaints.unshift(post);
            LeanCloud.saveData(callback, 'Complaints', post);
            // TODO http post
        },
        savePhotos: function(file, callback) {
            var filename = file.split('/').pop();
            var path = file.replace(/\\/g,'/').replace(/\/[^\/]*$/, '/');
            console.log('imgURI: ' + path + filename);
            $cordovaFile.readAsBinaryString(path, filename)
                  .then(function (data) {
                      // success
                      var b64data = btoa(data);
                      var avFile = new AV.File(filename, {base64: b64data});
                      avFile.save().then(function() {
                          // The file has been saved to AV.
                          console.log('avFile save success: ' + avFile.url());
                          callback(avFile.url());
                      }, function(error) {
                          // The file either could not be read, or could not be saved to AV.
                          console.log('avFile save failed: ' + JSON.stringify(avFile));
                      });
                  }, function (error) {
                      // error
                      console.log('read as binary failed: ' + file + JSON.stringify(error));
                  });
        },
        addFollow: function(complaint_id, callback) {
            changeStatus('Followed', complaint_id, callback);
        },
        unFollow: function(complaint_id, callback) {
            changeStatus('UnFollowed', complaint_id, callback);
        },
        addLike: function(complaint_id, callback) {
            console.log('like id', complaint_id);
            changeStatus('Liked', complaint_id, callback);
        },
        unLike: function(complaint_id, callback) {
            changeStatus('UnLiked', complaint_id, callback);
        },
        /*
        addComment: function(comment) {
            for (var i=0; i<complaints.length; i++)
                if (complaints[i].id == comment["post_id"])
                    complaints[i].comments.unshift(comment);
            // TODO http post
        },
        */
        followedList: function(complaint_id, callback) {
            $http({
                method: 'GET',
                url: RunMode.srvUrl() + '/api/Complaints/FollowedList',
                params: {ComplaintId: complaint_id},
                headers: getHeaders(),
                cache: false
            }).success(callback);
        },
        likedList: function(complaint_id, callback) {
            $http({
                method: 'GET',
                url: RunMode.srvUrl() + '/api/Complaints/LikedList',
                params: {ComplaintId: complaint_id},
                headers: getHeaders(),
                cache: false
            }).success(callback);
        }
    };
})

.factory('Quiz', function($http) {
    return {
        get: function(callback) {
            $http({
                method: 'GET',
                url: 'data/questions.json',
                cache: true
            }).success(callback);
        }
    };
})

.factory('Community', function($http, RunMode, FileCache, LeanCloud) {
    objName = 'CommTopics';
    queryItem = 'Id';
    return {
        getAll: function(callback) {
            FileCache.readFile(objName + '.json', callback, true);
            if (RunMode.local())
                LeanCloud.getData(callback, objName, queryItem);
            else
                $http({
                    method: 'GET',
                    url: RunMode.srvUrl() + '/api/Community/GetAll',
                    cache: false
                }).success(function(data) {
                    console.log('Community.getAll success');
                    FileCache.saveFile(data, objName + '.json', true);
                    callback(data);
                }).error(function(error) {
                    console.log('Community.getAll error', '\nTry to fetch from backup ...');
                    LeanCloud.getData(callback, objName, queryItem);
                });
        },
        getById: function(topicID, callback) {
            FileCache.readFile(objName + '_' + topicID + '.json', callback, false);
            if (RunMode.local())
                LeanCloud.getData(callback, objName, queryItem, topicID, 1);
            else
                $http({
                    method: 'GET',
                    url: RunMode.srvUrl() + '/api/Community/GetById',
                    params: {id: topicID},
                    cache: false
                }).success(function(data) {
                    console.log('Community.getByID success', topicID);
                    FileCache.saveFile(data, objName + '_' + topicID + '.json', false);
                    callback(data);
                }).error(function(error) {
                    console.log('Community.getByID error', topicID, '\nTry to fetch from backup ...');
                    LeanCloud.getData(callback, objName, queryItem, topicID, 1);
                });
        }
    };
})

.factory('FileCache', function($cordovaFile) {

    document.addEventListener('deviceready', function () {
        console.log('deviceready done')
    })

    // Check if file exists
    var checkFile = function(dir, filename, callback) {
        $cordovaFile.checkFile(dir, filename)
            .then(function (success) {
                // success TODO rm JSON...
                console.log('cached file found', JSON.stringify(success));
                callback();
            }, function (error) {
                // error
                console.log('no cached file found');
            });
    };

    return {
        readFile: function(filename, callback, persist) {
            if (typeof cordova === 'undefined')
                console.log('readFile: no cordova found');
            else {
                var dir = ( persist ? cordova.file.dataDirectory : cordova.file.cacheDirectory );
                checkFile(dir, filename, function() {
                    $cordovaFile.readAsText(dir, filename)
                        .then(function (data) {
                            console.log('cached file read success: ' + filename);
                            console.log(JSON.parse(data));
                            callback(JSON.parse(data));
                        }, function (error) {
                            console.log('cached file read error', filename);
                        });
                });
            }
        },

        saveFile: function(data, filename, persist) {
            if (typeof cordova === 'undefined')
                console.log('saveFile: no cordova found');
            else {
                var dir = ( persist ? cordova.file.dataDirectory : cordova.file.cacheDirectory );
                console.log('saving data to file', filename);
                $cordovaFile.writeFile(dir, filename, JSON.stringify(data), true);
            }
        }
    };
})

.factory('LeanCloud', function(FileCache) {
    return {
        getFileUrl: function(filePath, pos) {
            var url = '';
            var _File = AV.Object.extend('_File');
            var query = new AV.Query(_File);
            pos = pos || 4;
            query.equalTo('name', filePath.substr(pos));
            query.first({
                success: function(object) {
                    console.log('Query success', object.objectId);
                    url = object.url;
                },
                error: function(error) {
                    console.log("Error: " + error.code + " " + error.message);
                }
            });
            return url;
        },
        saveData: function(callback, objName, data) {
            var _obj = AV.Object.new(objName);
            _obj.save(data, {
                success: function(_obj) {
                    console.log("AV save success", objName, JSON.stringify(data));
                    callback(_obj);
                },
                error: function(_obj, error) {
                    console.log("AV save failed", objName, JSON.stringify(data));
                    console.log(JSON.stringify(error));
                }
            });

        },
        getData: function(callback, objName, queryItem, itemID, limit) {
            var _obj = AV.Object.extend(objName);
            var query = new AV.Query(_obj);
            if (itemID)
                query.equalTo(queryItem, itemID);
            query.limit(limit || 100);
            query.ascending("updatedAt");
            query.find({
                success: function(data) {
                    console.log('av query success:', objName, itemID);
                    data = JSON.parse(JSON.stringify(data));
                    if (itemID) {
                        if (data.length) {
                            console.log(objName, 'data [all]', itemID, JSON.stringify(data));
                            if (limit == 1)
                                data = data[0];
                            FileCache.saveFile(data, objName + '_' + itemID + '.json', false);
                        }
                        else
                            console.log(objName, 'data [all] error', itemID, JSON.stringify(data));
                    }
                    else {
                        FileCache.saveFile(data, objName + '.json', true);
                    }
                    callback(data);
                },
                error: function(error) {
                    console.log('av query error:', objName, itemID);
                }
            });
        }
    };
})

.factory('News', function($http, FileCache, RunMode, LeanCloud) {

    objName = 'News';
    queryItem = 'NewsId';

    return {
        getAll: function(callback) {
            FileCache.readFile(objName + '.json', callback, true);
            if (RunMode.local())
                LeanCloud.getData(callback, objName, queryItem);
            else
                $http({
                    method: 'GET',
                    url: RunMode.srvUrl() + '/api/News/GetNews',
                    cache: false
                }).success(function(data) {
                    console.log('News.getAll success');
                    FileCache.saveFile(data, objName + '.json', true);
                    callback(data);
                }).error(function(error) {
                    console.log('News.getAll error', '\nTry to fetch from backup ...');
                    LeanCloud.getData(callback, objName, queryItem);
                });
        },
        getById: function(newsID, callback) {
            FileCache.readFile(objName + '_' + newsID + '.json', callback, false);
            if (RunMode.local())
                LeanCloud.getData(callback, objName, queryItem, newsID, 1);
            else
                $http({
                    method: 'GET',
                    url: RunMode.srvUrl() + '/api/News/GetById',
                    params: {id: newsID},
                    cache: false
                }).success(function(data) {
                    console.log('News.getByID success', newsID);
                    FileCache.saveFile(data, objName + '_' + newsID + '.json', false);
                }).error(function(error) {
                    console.log('News.getByID error', newsID, '\nTry to fetch from backup ...');
                    LeanCloud.getData(callback, objName, queryItem, newsID, 1);
                });
        }
    };
})

.factory('Discussions', function($http) {
    var quotas = [];
    $http.get('data/quota.json').success(function(data) {
        quotas = data;
    });
    return {
        getAll: function(callback) {
            $http.get('data/discussions.json')
                .success(callback);
        },
        getRandom: function() {
            var d = new Date().toISOString();
            var n = parseInt(d[21]+d[22]) || 0;
            console.log(d, n, n % quotas.length);
            return quotas[n % quotas.length];
        }
    }
})

.factory('CurrentInfo', function($http) {
    return {
        get: function(callback) {
            $http({
                method: 'GET',
                url: 'data/currentInfo.json',
                cache: true
            }).success(callback);
        },
        getHistory: function(city, callback) {
            console.log('using local city aqi history');
            $http({
                method: 'GET',
                url: 'data/hz-aqi-history.json',
                cache: false
            }).success(callback);
        }
    }
})
.factory('AQI', function($http, RunMode) {
    var aqiUrl = 'http://www.pm25.in/api/querys/aqi_details.json';
    var lvcolors = ['#0CAF0C', '#C0C218', '#DC8026', '#CB3325', '#AF32BA', '#950C32', '#000000'];

    var getAQI = function(url, callback) {
            $http({
                method: 'GET',
                url: url,
                headers: {'Cache-Control': 'max-age=0'},
                cache: false
            }).success(callback);
    };

    return {
        getToday: function(callback) {
            var aqiUrl = 'http://107.191.60.73:9036/api/currentAQI.json';
            console.log('get AQI today vlr', RunMode.local());
            getAQI(aqiUrl, callback);
        },
        getHZTest: function(city, callback) {
            var aqiUrl = 'data/hz_aqi.json';
            console.log('getHZTest', RunMode.local());
            getAQI(aqiUrl, callback);
        },
        getHZ: function(city, callback) {
            var aqiUrl = 'http://107.191.60.73:9036/pm25/hz_aqi.json';
            console.log('getHZ vlr', RunMode.local());
            getAQI(aqiUrl, callback);
        },
        getByCity: function(city, callback) {
            var param = {city: city, token: token};
            $http({
                method: 'GET',
                url: aqiUrl,
                cache: false,
                params: param
            }).success(callback);
        },
        getHistory: function(city, callback) {
            var HistoryAQI = AV.Object.extend('HistoryAQI');
            var query = new AV.Query(HistoryAQI);
            query.limit(30);
            query.descending("Date")
            query.startsWith('City', city);
            query.find({
                success: function(data) {
                    console.log('av query service success: history AQI');
                    //console.log(JSON.stringify(data));
                    callback(JSON.parse(JSON.stringify(data)));
                },
                error: function(error) {
                    console.log('av query service error: history AQI');
                }
            });
        }
    };
})

.factory('CurrentWeather', function($http) {
    var baseurl = 'http://api.datatang.com/data/open';
    var citylist = function(callback) {
        $http({
            method: 'GET',
            url: 'data/citylist.json',
            cache: true
        }).success(callback);
    };
    var cityid = '';
    return {
        getHzTest: function(callback) {
            $http({
                method: 'GET',
                url: 'data/tp_hz_now.json',
                cache: true
            })
            .success(callback);
        },
        getHz: function(callback) {
            var thinkpage = 'https://api.thinkpage.cn/v2/weather/now.json?city=hangzhou&language=zh-chs&unit=c&key=M0O7RTDY1G';
            $http({
                method: 'GET',
                url: thinkpage,
                cache: true
            }).success(callback)
            .error(function() {
                console.log('tp now weather error');
                $http({
                    method: 'GET',
                    url: 'http://107.191.60.73:9036/api/tp_hz_now.json',
                    cache: true
                }).success(callback)
                .error(function() {
                    console.log('vlr now weather error');
                });
            });
        },
        getInfo: function(cityname, apicode, callback) {
            var apikey = '';
            if (apicode == 'weather_today_ci')  // Today
                apikey = 'ede8a0d49876547218b2898ba81faa51';
            else if (apicode == 'weather_today_sk') // Current
                apikey = 'a57c82b61ed67b1b791bc8190f775790';
            console.log('find cityid', cityname);
            citylist(function(citylist) {
                for (i in citylist) {
                    if (citylist[i].d2 == cityname) {
                        cityid = citylist[i].d1;
                        console.log('cityname', cityname, 'cityid', cityid);
                        var param = {
                            'rettype': 'json',
                            'apikey': apikey,
                            'apicode': apicode,
                            'cityid': cityid
                        }
                        $http({
                            method: 'GET',
                            url: baseurl,
                            params: param,
                            cache: true
                        })
                        .success(callback)
                            .error(function(data, status, headers, config) {
                                console.log('err', data, status, headers, JSON.stringify(config));
                            });
                        return;
                    }
                }
            });
        }
    }
})
;
