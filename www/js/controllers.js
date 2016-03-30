angular.module('starter.controllers', [])

.controller('TabsCtrl', function($scope, $rootScope, $state, $ionicModal, $http, $timeout, $ionicSlideBoxDelegate, UserInfo, RunMode) {
    $rootScope.$on('$ionicView.beforeEnter', function() {

        $rootScope.hideTabs = false;

        if ($state.current.name === 'tabs.events-create') {
            $rootScope.hideTabs = true;
        }
    });

    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalLogin = modal;
    });

    /*
    // Create the signup modal that we will use in login modal
    $ionicModal.fromTemplateUrl('templates/account-signup.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalSignup = modal;
    });
    */

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
        $scope.modalLogin.hide();
    };

    // Auto login
    if (RunMode.local())
        UserInfo.setName('user1');

    // Open the login modal
    $scope.goComplaint = function() {
        $scope.topage = 'tab.complaint';
        console.log('Login: ' + UserInfo.loggedin());
        if (UserInfo.loggedin()) {
            console.log('Login: ' + UserInfo.loggedin());
            //$ionicSlideBoxDelegate.update();
            RunMode.openCamera(true);
            $state.go($scope.topage);
        }
        else
            $scope.modalLogin.show();
    };
    // Open the login modal
    $scope.login = function(page) {
        $scope.topage = page;
        if (UserInfo.loggedin())
            $state.go($scope.topage);
        else
            $scope.modalLogin.show();
    };

    $scope.goTopics = function() {
        $state.go('tab.topics');
    };
    $scope.goProfile = function() {
        $scope.topage = 'tab.account';
        console.log('go profile', UserInfo.loggedin());
        if (UserInfo.loggedin())
            $state.go($scope.topage);
        else
            // Go to settings page when not logged in
            //$state.go($scope.topage+'-settings');
            $scope.modalLogin.show();
    };
    $scope.logout = function() {

        if (RunMode.local()) {
            UserInfo.logout();
        }
        else {
            $http({
                method: 'POST',
                headers: UserInfo.getHeaders(),
                url: RunMode.srvUrl() + '/api/Account/Logout'
                    //,data: $scope.token TODO
            })
            .success(function(data, status) {
                UserInfo.logout();
                console.log('logout success', status);
                $state.go('tab.home');
            })
            .error(function(data, status) {
                console.log('logout failed', status);
                RunMode.showAlert(status, data);
                // TODO err handle
            });
        }
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {

        // auto fill
        $scope.loginData.RememberMe = true;
        $scope.loginData.grant_type = 'password';

        if (!$scope.loginData.UserName) {
            //RunMode.showAlert("请确认", "用户名无效");
            // auto login (remove this)
            $scope.loginData.UserName = '测试3';
            //return;
        }
        if (!$scope.loginData.Password) {
            //RunMode.showAlert("请确认", "密码不能为空");
            // auto login (remove this)
            $scope.loginData.Password = 'Abc_123';
            //return;
        }

        if (RunMode.local()) {
            console.log('Doing login', JSON.stringify($scope.loginData));
            UserInfo.setName($scope.loginData.UserName);
            $scope.modalLogin.hide();
            $state.go($scope.topage);
        }
        else {
            UserInfo.login($scope.loginData, function() {
                UserInfo.getMy(function() {;});
                $scope.modalLogin.hide();
                $state.go($scope.topage);
            });
        }

        /*
        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function() {
            $scope.closeLogin();
        }, 1000);
        */
    };

    $scope.signup = function() {
        $scope.modalLogin.hide();
        $state.go('tab.account-signup');
    };

})

// Home Tab
.controller('HomeCtrl', function($scope, $ionicModal, $ionicScrollDelegate, $ionicActionSheet, $cordovaSocialSharing, $localstorage, Geo, CurrentInfo, CurrentWeather, RunMode, AQI, $http) {

    $scope.width = window.innerWidth;
    $scope.height = window.innerHeight;
    $scope.contentHeight = $scope.height - 47;

    $scope.scrollTop = function() {
        $ionicScrollDelegate.scrollTop(true);
    };
    $scope.scrollTo2 = function() {
        $ionicScrollDelegate.scrollTo(0, $scope.contentHeight, true);
    };
    /*
    $scope.scrollBottom = function() {
        $ionicScrollDelegate.scrollBottom(true);
    };
    $scope.scrollTo = function() {
        $ionicScrollDelegate.scrollTo(0, top, true);
    };
    $scope.scrollUp = function() {
        var pos = $ionicScrollDelegate.getScrollPosition();
        console.log('pos', JSON.stringify(pos));
        $ionicScrollDelegate.scrollTo(0, pos.top-$scope.height, true);
    };
    */

    // Show the action sheet
    $scope.shareHome = function() {

        // Share Data
        var message = $scope.city + "空气质量指数：" + $scope.quality + "\n等等等等";
        var subject = "";
        var photo = null;
        var link = "然后是app下载地址";    // TODO

        // umshare
        // TODO more info
        var shareOpt = {
            'data' : {
                'content' : {
                    'text' : message + '\n' + link,
                    'img' : ''
                }
            }
        }
        var share2 = function(plat) {
            $.fn.umshare.share(plat, shareOpt);
        }

        var hideSheet = $ionicActionSheet.show({
            buttons: [
            { text: '<i class="icon ion-chatbubble-working"></i>腾讯微博' },
            { text: '<i class="icon ion-android-wifi"></i>新浪微博' },
            { text: '<i class="icon ion-leaf"></i>豆瓣' },
            { text: '<i class="icon ion-social-twitter"></i>其他' }
            ],
            //destructiveText: '删除投诉',
            titleText: '分享到',
            cancelText: '取消',
            cancel: function() {
                // add cancel code..
            },
            buttonClicked: function(index) {
                switch (index) {
                    case 0:
                        share2('tencent');
                        break;
                    case 1:
                        share2('sina');
                        break;
                    case 2:
                        share2('douban');
                        break;
                    default:
                        $cordovaSocialSharing
                            .share(message, subject, photo, link) // Share via native share sheet
                            .then(function(result) {
                                console.log('share success', result);
                                // Success!
                            }, function(err) {
                                console.log('share failed', result);
                                // An error occured. Show a message to the user
                            });
                }
                return true;
            }
        });
    };

    var drawGauge = function() {
        require.config({
            paths: {
                echarts: 'js/echarts'
            }
        });

        // 使用
        require(
                [
                'echarts',
                'echarts/chart/gauge',
                ],
                function (ec) {
                    // 基于准备好的dom，初始化echarts图表
                    var myGauge = ec.init(document.getElementById('guagua'));

                    var option = {
                        tooltip : {
                            formatter: "{a} <br/>{c}"
                        },
                        toolbox: {
                            show : false,
                            feature : {
                                mark : {show: true},
                                restore : {show: true},
                                saveAsImage : {show: true}
                            }
                        },
                        series : [
                        {
                            name:'当前空气质量',
                            type:'gauge',
                            center : ['50%', '50%'],    // 默认全局居中
                            radius : [0, '75%'],
                            startAngle: 140,
                            endAngle : -140,
                            min: 0,                     // 最小值
                            max: 400,                   // 最大值
                            precision: 0,               // 小数精度，默认为0，无小数点
                            splitNumber: 0,             // 分割段数，默认为5
                            axisLine: {            // 坐标轴线
                                show: true,        // 默认显示，属性show控制显示与否
                                lineStyle: {       // 属性lineStyle控制线条样式
                                    color:[[0.125, '#0CAF0C',], [0.25, '#C0C218'], [0.375, '#DC8026'], [0.5, '#CB3325'], [0.75, '#AF32BA'], [1, '#950C32']],
                                    width: 10
                                }
                            },
                            axisTick: {            // 坐标轴小标记
                                show: false,        // 属性show控制显示与否，默认不显示
                                splitNumber: 5,    // 每份split细分多少段
                                length :8,         // 属性length控制线长
                                lineStyle: {       // 属性lineStyle控制线条样式
                                    color: '#eee',
                                    width: 1,
                                    type: 'solid'
                                }
                            },
                            axisLabel: {           // 坐标轴文本标签，详见axis.axisLabel
                                show: true,
                                formatter: function(v){
                                    switch (v+''){
                                        case '10': return '弱';
                                        case '30': return '低';
                                        case '60': return '中';
                                        case '90': return '高';
                                        default: return '';
                                    }
                                },
                                textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                                    color: '#333'
                                }
                            },
                            splitLine: {           // 分隔线
                                show: true,        // 默认显示，属性show控制显示与否
                                length :30,        // 属性length控制线长
                                lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                                    color: '#eee',
                                    width: 2,
                                    type: 'solid'
                                }
                            },
                            pointer : {
                                length : '80%',
                                width : 8,
                                color : 'auto'
                            },
                            title : {
                                show : true,
                                offsetCenter: ['-65%', -10],    // x, y，单位px
                                textStyle: {                    // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                                    color: '#333',
                                    fontSize : 15
                                }
                            },
                            detail : {
                                show : true,
                                backgroundColor: 'rgba(0,0,0,0)',
                                borderWidth: 0,
                                borderColor: '#ccc',
                                width: 100,
                                height: 40,
                                offsetCenter: ['-70%', '-28%'],       // x, y，单位px
                                formatter:'{value}',
                                textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                                    color: 'auto',
                                    fontSize : 30
                                }
                            },
                            data:[{value: $scope.quality, name: ''}]
                        }
                        ]
                    };
                    myGauge.setOption(option);
                }
        );
    };

    Geo.getLocation().then(function(position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;

        console.log('lat, lng', lat, lng);
        Geo.reverseGeocodeDetail(lat, lng).then(function(locString) {
            $localstorage.set('adresse', locString);
            var city = locString.split(', ')[2];
            $scope.city = city || $scope.city;
            console.log('city', $scope.city);
            // TODO do before doRefresh
            // $scope.doRefresh(function(){});
        });
    });

    $scope.date = new Date().toDateString();
    $scope.quality = '--';
    $scope.info = [];
    $scope.doDoRefresh = function() {
        $scope.doRefresh(function() {
            console.log('do nothing');
        });
    };

    $scope.doRefresh = function(callback) {
        // hangzhou only
        var getAQIInfo;
        if (RunMode.realtime())
            getAQIInfo = AQI.getHZ;
        else
            getAQIInfo = AQI.getHZTest;
        /* TODO uncomment to get aqi details of other cities
        if (RunMode.viaPM25in())
            // pm25.in API (testing)
            getAQIInfo = AQI.getByCity;
        else
            getAQIInfo = AQI.getHZ;
        */

        getAQIInfo($scope.city, function(data) {
            var aqiAvg = data[data.length-1];
            var setWeatherIcon = function() {
                if ($scope.weather.indexOf('晴') > -1)
                    $scope.weatherIcon = 'ion-ios-sunny';
                if ($scope.weather.indexOf('阴') > -1)
                    $scope.weatherIcon = 'ion-ios-cloudy';
                if ($scope.weather.indexOf('多云') > -1)
                    $scope.weatherIcon = 'ion-ios-partlysunny';
                if ($scope.weather.indexOf('雨') > -1)
                    $scope.weatherIcon = 'ion-ios-rainy';
                if ($scope.weather.indexOf('雪') > -1)
                    $scope.weatherIcon = 'ion-ios-snowy';
                if ($scope.weather.indexOf('雷') > -1)
                    $scope.weatherIcon = 'ion-ios-thunderstorm';
            };
            // TODO no data
            $scope.city = aqiAvg.area;
            if (RunMode.realtime()) {
                console.log('weather start');
                CurrentWeather.getHz(function(data) {
                    //console.log('wwww', JSON.stringify(data));
                    $scope.weather = data.weather[0].now.text;
                    setWeatherIcon();
                    $scope.temperature = data.weather[0].now.temperature + '℃';
                    $scope.humidity = data.weather[0].now.humidity + '%';
                });
                /* Datatang seems not working
                CurrentWeather.getInfo($scope.city, 'weather_today_ci', function(data) {
                    $scope.temp = data.weatherinfo.temp2 + '-' + data.weatherinfo.temp1;
                    $scope.weather = data.weatherinfo.weather;
                    console.log('current weather', JSON.stringify(data));
                });
                CurrentWeather.getInfo($scope.city, 'weather_today_sk', function(data) {
                    $scope.SD = data.weatherinfo.SD;
                });
                */
                console.log('weather end');
            } else {
                CurrentWeather.getHzTest(function(data) {
                    $scope.weather = data.weather[0].now.text;
                    setWeatherIcon();
                    $scope.temp = data.weather[0].now.temperature + '℃';
                    $scope.SD = data.weather[0].now.humidity + '%';
                });
            }

            // Bars with icons
            /*
            AQI.getToday(function(data) {
                for (var i in data) {
                    if (data[i].City.startsWith($scope.city))
                        $scope.quality = data[i].AQI;
                }
            });
            */
            $scope.quality = aqiAvg.aqi;
            $scope.desc = aqiAvg.quality;
            $scope.info[$scope.info.length] = {"name": "PM2.5", "value": aqiAvg.pm2_5, "icon": "ion-PM10"};
            $scope.info[$scope.info.length] = {"name": "PM10", "value": aqiAvg.pm10, "icon": "ion-PM10"};
            $scope.info[$scope.info.length] = {"name": "O<sub>3</sub>", "value": aqiAvg.o3, "icon": "ion-NO2"};
            $scope.info[$scope.info.length] = {"name": "SO<sub>2</sub>", "value": aqiAvg.so2, "icon": "ion-NO2"};
            $scope.info[$scope.info.length] = {"name": "NO<sub>2</sub>", "value": aqiAvg.no2, "icon": "ion-NO2"};
            $scope.info[$scope.info.length] = {"name": "CO", "value": aqiAvg.co * 1000, "icon": "ion-O3"};

            // Detail Table
            $scope.reverse = false;
            $scope.showCol = 'aqi';
            $scope.predicate = $scope.showCol;
            $scope.changeCol = function(showCol) {
                console.log("showCol was changed to:"+showCol);
                for (var i in $scope.records) {
                    $scope.records[i].showCol = showCol;
                    $scope.records[i].value = $scope.records[i][showCol];
                }
            };
            $scope.records = [];
            for (var i in data) {
                if (data[i].position_name && data[i].aqi !== 0)
                    $scope.records.push(data[i]);
            }
            $scope.changeCol($scope.showCol);

            $http.get("data/aqi.json").success(function(aqi) {
                var lvcolors = ['#0CAF0C', '#C0C218', '#DC8026', '#CB3325', '#AF32BA', '#950C32', '#000000'];
                // Quality color
                for (var prop in aqi.level)
                    if( aqi.level.hasOwnProperty( prop ) ) {
                        if( aqi.level[prop] === aqiAvg.quality )
                            $scope.descolor = lvcolors[parseInt(prop)];
                        else if( aqi.level[prop].indexOf(aqiAvg.quality) > -1 )
                            $scope.descolor = lvcolors[parseInt(prop)];
                    }
                if (!$scope.descolor)
                    $scope.descolor = lvcolors[0];
                // Pollutants color
                for (var i in $scope.info) {
                    //console.log(JSON.stringify($scope.info[i]));
                    var pname = $scope.info[i].name;
                    $scope.info[i].level = 0;
                    for (var lv in aqi[pname]) {
                        if (aqi[pname][lv] < $scope.info[i].value ) {
                            $scope.info[i].level = lv;
                        }
                    }
                    $scope.info[i].color = lvcolors[parseInt($scope.info[i].level)];
                }

                // Detail Table Colors
                $scope.levelColor = function(record) {

                    if (record.showCol === 'aqi') {
                        switch (record.quality) {
                            case '优':       return lvcolors[0];    // '#00E400'; data[i].textColor = '#000'; break;
                            case '良':       return lvcolors[1];    // '#FFFF00'; data[i].textColor = '#000'; break;
                            case '轻度污染': return lvcolors[2];    // '#FF7E00'; data[i].textColor = '#000'; break;
                            case '中度污染': return lvcolors[3];    // '#FF0000'; data[i].textColor = '#FFF'; break;
                            case '重度污染': return lvcolors[4];    // '#99004C'; data[i].textColor = '#FFF'; break;
                            case '严重污染': return lvcolors[5];    // '#7E0023'; data[i].textColor = '#FFF'; break;
                            default: return '#FFF';
                        }
                    }

                    var pname = record.showCol;
                    //console.log('pname', pname, aqi[pname], JSON.stringify(record));
                    var level = 0;
                    for (var lv in aqi[pname])
                        if (aqi[pname][lv] < record.value)
                            level = lv;
                    //console.log('level', level);
                    return lvcolors[parseInt(level)];
                };

                for (var i in data) {
                    if (!data[i].position_name)
                        data[i].position_name = $scope.city;
                    var bracket = -1;
                    var bracket_right = -1;
                    if (data[i].primary_pollutant) {
                        bracket = data[i].primary_pollutant.indexOf('(');
                        bracket_right = data[i].primary_pollutant.indexOf(')');
                    }
                    if ( bracket > -1)
                        data[i].primary_pollutant = data[i].primary_pollutant.slice(bracket+1, bracket_right);
                }

                // Advices
                CurrentInfo.get(function(data) {
                    var advices = data.advices;
                    for (var adv=0; adv<4 && adv<advices.length; adv++) {
                        if (advices[adv].hint.indexOf("不适") > -1)
                            advices[adv].color = lvcolors[4];
                        else if (advices[adv].hint.indexOf("易") > -1)
                            advices[adv].color = lvcolors[3];
                        else if (advices[adv].hint.indexOf("较") > -1)
                            advices[adv].color = lvcolors[1];
                        else
                            advices[adv].color = lvcolors[0];
                        if (advices[adv].name.indexOf("口罩") > -1)
                            advices[adv].icon = "ion-respirator";
                        if (advices[adv].name.indexOf("晨练") > -1)
                            advices[adv].icon = "ion-morning-exercise";
                        if (advices[adv].name.indexOf("过敏") > -1)
                            advices[adv].icon = "ion-Hismanal";
                        if (advices[adv].name.indexOf("旅游") > -1)
                            advices[adv].icon = "ion-travel";
                        $scope.info[adv].advice = advices[adv];
                    }
                });
            }).finally(function() {
                $scope.$broadcast('scroll.refreshComplete');
            });
            callback();
        });
    };
    // TODO remove this
    $scope.doRefresh(drawGauge);
})

// Search Tab
.controller('SearchCtrl', ['$scope', '$http', 'Complaints', '$state', 'RunMode', '$timeout', function (scope, http, Complaints, state, RunMode, timeout) {

    scope.$on('$ionicView.enter', function () {
        scope.srvUrl = RunMode.srvUrl();
    });
    scope.items = [];
    var i = 0;

    scope.loadMore = function () {
        if(scope.complaints && scope.items.length<scope.complaints.length) {
            console.log('show 2 more', scope.complaints);
            timeout(function () {
                for (var j = 0; j < 2 && i<scope.complaints.length; j++) {
                    if (scope.complaints[i].PicturePath)
                        scope.complaints[i].photos = scope.complaints[i].PicturePath.split('|');
                    if (scope.complaints[i].Tag)
                        scope.complaints[i].tags = scope.complaints[i].Tag.split('|');
                    if (!scope.complaints[i].follow) {
                        scope.complaints[i].follow = 0;
                        if (scope.complaints[i].follows)
                            scope.complaints[i].follow = scope.complaints[i].follows.length;
                    }
                    scope.items.push(scope.complaints[i]);
                    i++;
                    scope.$broadcast('scroll.infiniteScrollComplete');
                }
            }, 800);
        }
        else{
            scope.$broadcast('scroll.infiniteScrollComplete');
        }
    };
    if (RunMode.realtime()) {
        Complaints.getAll(function (data) {
            scope.complaints = data;
        });
    }
    else {
        Complaints.getTest().then(function(data) {
            scope.complaints = data;
        });
    }
    http.get('data/companies.json').success(function (data) {
        scope.companies = data.companies;
    });

    //scope.$on('$ionicView.beforeLeave', function () {
    //    scope.items = [];
    //});

    /*
    scope.$on('$ionicView.enter', function () {
        i=0;
        if (scope.complaints)
            scope.loadMore();
    });
    */


    scope.width = window.innerWidth;

}])

.controller('SearchResultCtrl', function($scope) {})

// Community Tab
.controller('CommunityCtrl', function($scope, $timeout, RunMode, Community) {
    $scope.lb_topic = '话题：';
    $scope.$on('$ionicView.enter', function () {
        $scope.srvUrl = RunMode.srvUrl();
    });

    Community.getAll(function(data) {
        $timeout(function() {
            console.log('cloud community topics fetch success');
            $scope.topics = data;
            $scope.rtopics = data.slice().reverse();
        }, 0);
    });

    $scope.search = {};
    $scope.doSearch = function(topic) {
        var found = false;
        if ($scope.search.Text === undefined || $scope.search.Text.length === 0)
            found = true;
        if (topic.Title.indexOf($scope.search.Text) > -1)
            found = true;
        if (topic.Text.indexOf($scope.search.Text) > -1)
            found = true;
        return found;
    };
})

// Complaint Tab
.controller('ComplaintCtrl', function($scope, $state, $localstorage, $ionicSlideBoxDelegate, $http,
            $cordovaCapture, Camera, Geo, UserInfo, RunMode, Complaints) {
    $scope.photos = [];
    $scope.videos = [];
    $scope.photoPath = [];
    $scope.post = {};

    $scope.clrPhoto = function() {
        $scope.photos = [];
        $scope.videos = [];
        $scope.photoPath = [];
        //$ionicSlideBoxDelegate.update();
    }

    $scope.getPhoto = function() {
        $scope.photos = [];
        $scope.videos = [];
        $scope.photoPath = [];
        $scope.addPhoto();
    }

    $scope.addPhoto = function() {
        console.log('add photo');
        Camera.getPicture().then(function(imageURI) {
            //console.log(imageURI);
            $scope.lastPhoto = imageURI;
            $scope.photos[$scope.photos.length] = imageURI;
            //$ionicSlideBoxDelegate.update();
            doUploadPhoto(imageURI);
        }, function(err) {
            console.log(err);
        }, {
            quality: 50,
            targetWidth: 700,
            targetHeight: 700,
            saveToPhotoAlbum: true,
            allowEdit: true,
            mediaType: 2
        });
    };

    $scope.captureVideo = function() {
        var options = { limit: 1, duration: 5 };

        $cordovaCapture.captureVideo(options).then(function(videoData) {
            $scope.videos[$scope.videos.length] = videoData;
            // Success! Video data is here
        }, function(err) {
            RunMode.showAlert("Failed to capture video", "rt");
            // An error occurred. Show a message to the user
        });
    };

    // Uncomment to start camera on first click (only works on device)
    $scope.$on('$ionicView.enter', function () {
        //console.log(viewInfo.name, 'views: ', document.querySelectorAll('ion-view').length);

        if (!navigator.camera)
            RunMode.showAlert("提醒", "设备未启用相机功能");
        else
            if (RunMode.toOpenCamera()) {
                $scope.getPhoto();
                RunMode.openCamera(false);
            }
    });

    $scope.width = window.innerWidth;
    $scope.height = window.innerHeight;
    /*
    $scope.nextSlide = function() {
        if ($ionicSlideBoxDelegate.currentIndex() + 1 === $ionicSlideBoxDelegate.slidesCount())
            $ionicSlideBoxDelegate.slide(0);
        else
            $ionicSlideBoxDelegate.next();
    };
    */

    $scope.currentPlace = "重新定位";

    // TODO
    $scope.refreshData = function() {
        Geo.getLocation().then(function(position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;

            Geo.reverseGeocodeDetail(lat, lng).then(function(locString) {
                $scope.currentPlace = locString;
                // TODO location and place
                $scope.currentLocation = [lat, lng];
                console.log('current place', $scope.currentPlace);
                //_this.getBackgroundImage(lat, lng, locString);
            });
            //_this.getCurrent(lat, lng);
        }, function(error) {
            $scope.currentPlace = "获取地理位置失败，点击重试";
            console.log('Unable to get current location: ' + error);
        });
    };
    $scope.refreshData();
    $scope.changePlace = function() {
        $scope.refreshData();
    }
    /*
    var posOptions = {timeout: 10000, enableHighAccuracy: true};
    $cordovaGeolocation
        .getCurrentPosition(posOptions)
        .then(function (position) {
            var lat  = position.coords.latitude;
            var lon = position.coords.longitude;
            alert(lat, lon);
            $scope.currentPlace = lat + lon;
        }, function(err) {
            alert('location fail');
            // error
        });
    */

    $scope.resetPost = function() {
        console.log($scope.post.content);
        $scope.post.content = '';
        $scope.post.tags = '';
        $scope.clrPhoto();
        console.log($scope.post.content);
    };

    // Upload photos first
    var doUploadPhoto = function(imageURI) {

        if(RunMode.local()) {
            Complaints.savePhotos(imageURI, function(url) {
                    $scope.photoPath.push(url);
                    RunMode.showAlert('照片上传成功', url);
            });
        }
        else {
            console.log('upload photos start');
            if (typeof (FileUploadOptions) === 'undefined') {
            }

            var uploadUrl = RunMode.srvUrl() + '/api/Helper/UploadPicture';
            var uploadOptions = new FileUploadOptions();
            uploadOptions.fileKey = "file";
            uploadOptions.mimeType = "image/jpeg";
            //uploadOptions.headers = {};

            var uploadSuccess = function(r) {
                //RunMode.showAlert('test', 'POST success');
                console.log("Code = " + r.responseCode);
                console.log("Response = " + r.response);
                console.log("Sent = " + r.bytesSent);
                var resp = JSON.parse(r.response);
                if (resp.error == 0) {
                    $scope.photoPath.push(resp.msg);
                    RunMode.showAlert('照片上传成功', resp.msg);
                }
                else {
                    console.log('response msg', resp.msg);
                    RunMode.showAlert('照片上传失败', resp.msg);
                }
            };

            var uploadError = function(error) {
                alert("An error has occurred: Code = " + error.code);
                console.log("upload error source " + error.source);
                console.log("upload error target " + error.target);
                RunMode.showAlert('照片上传失败');
            };

            var ft = new FileTransfer();
            uploadOptions.fileName = imageURI.substr(imageURI.lastIndexOf('/')+1);
            console.log('Uploading photo', uploadOptions.fileName, imageURI);
            ft.upload(imageURI, encodeURI(uploadUrl), uploadSuccess, uploadError, uploadOptions);
        }
    };

    $scope.doPost = function() {
        //console.log('name@post', UserInfo.name());
        // validtion
        if (!UserInfo.loggedin()) {
            RunMode.showAlert("发送失败", "请先登录");
            $state.go('tab.account-settings');
        }
        else if (!($scope.photos || RunMode.debug()))
            RunMode.showAlert("发送失败", "请添加照片");
        else if (!$scope.post.tags)
            RunMode.showAlert("发送失败", "请添加标签");
        else if (!$scope.post.content)
            RunMode.showAlert("发送失败", "请添加投诉内容");
        else if (!RunMode.debug() && ($scope.currentPlace == "重新定位" ||
                    $scope.currentPlace == "获取地理位置失败，点击重试"))
            RunMode.showAlert("发送失败", "请添加地理位置");
        else {
            console.log($scope.photoPath);
            var photo2up = $scope.photoPath.toString().replace(/,/g, '|');
            console.log(photo2up);
            if (!RunMode.debug() && $scope.photoPath.length == 0) {
                RunMode.showAlert("请稍等", "照片正在上传中……");
                return
            }
            if (RunMode.debug() && !$scope.currentLocation)
                $scope.currentLocation = [];
            var postData = {
                UserName: UserInfo.name(),
                Text: $scope.post.content,
                PicturePath: photo2up,
                Tag: $scope.post.tags.replace(' ', '|'),
                Location: $scope.currentPlace,
                Coordinate: $scope.currentLocation.toString(),
                Company: '无'
            };

            if (RunMode.local()) {
                var newPost = {
                    ComplaintId: (new Date().getMilliseconds() + 100).toString(),   // fake id
                    UserName: postData.UserName,
                    Location: postData.Location,
                    Coordinate: postData.Coordinate,
                    PublishedDate: new Date().toDateString(),
                    tags: $scope.post.tags.split(' '),
                    follow: 0,
                    PicturePath: '',
                    Text: postData.Text,
                    status: ""
                };
                if ($scope.photoPath.length > 0)
                    newPost.PicturePath = $scope.photoPath[0];
                console.log('nnn', newPost.location);
                if (!newPost.location) {
                    newPost.location = [null, null, "火星"];
                    console.log('xxx', newPost.location);
                }
                Complaints.addMyPost(newPost, function() {
                    console.log('postData', JSON.stringify(postData));
                    RunMode.showAlert("发送成功", "接下来将跳转到“我的投诉”页面", function() {
                        $scope.resetPost();
                        $state.go('tab.my-complaints');
                    });
                });
            }
            else {

                console.log('online postData', JSON.stringify(postData));
                // Post content
                var postComplaint = function() {
                    if (RunMode.debug()) {
                        if (!postData.PicturePath)
                            postData.PicturePath = '/Image/News/1.jpg';
                        if (!postData.Location)
                            postData.Location = '月球测试';
                        if (!postData.Coordinate)
                            postData.Coordinate = '22,33';
                    }

                    $http({
                        method: 'POST',
                        url: RunMode.srvUrl() + '/api/Complaints/Post',
                        headers: UserInfo.getHeaders(),
                        data: postData
                    })
                    .success(function(data, status) {
                        console.log(status, data);
                        RunMode.showAlert("发送成功", "接下来将跳转到“我的投诉”页面", function() {
                            $scope.resetPost();
                            // TODO Complaints Refresh here ?
                            $state.go('tab.my-complaints');
                        });
                    })
                    .error(function(data, status) {
                        console.log(status, JSON.stringify(data));
                        console.log('post failed, postData', JSON.stringify(postData));
                        // TODO err handle
                    });
                }

                postComplaint();
            }
        }
    };
})

.controller('MyComplaintsCtrl', function($scope, $state, $ionicHistory, $localstorage, $timeout, Complaints, RunMode, UserInfo) {
    $scope.$on('$ionicView.enter', function (viewInfo) {
        //console.log(viewInfo.name, 'views: ', document.querySelectorAll('ion-view').length);
        if (RunMode.realtime())
            Complaints.getByUser(UserInfo.name(), function(data) {
                $timeout(function() {
                    $scope.complaints = data.reverse();
                }, 0);
            });
        else
            Complaints.getTestMy().then(function(complaints) {
                $scope.complaints = complaints.reverse();
            });
    });
    var tabs = document.body.querySelector('.tabs');
    $scope.$on('$ionicView.beforeLeave', function () {
        tabs.style[ionic.CSS.TRANSFORM] = 'translate3d(0, 0, 0)';
        //console.log(JSON.stringify(tabs.style));
        for(var i = 0, j = tabs.children.length; i < j; i++) {
            tabs.children[i].style.opacity = 1;
        }
    });
})

// Topics Tab
.controller('TopicsCtrl', function($scope, $state, RunMode) {})
.controller('TopicsComplaintsCtrl', function($scope, $timeout, Complaints, RunMode) {
    /* TODO
     * pull to refresh
    */
    $scope.isHidden = function(complaint) {
        if ($.inArray(complaint.status, ['accepted', 'processing', 'done']) > -1) {
            return false;
        }
        return true;
    };

    if (RunMode.realtime()) {
        Complaints.getAll(function(data) {
            $timeout(function() {
                $scope.complaints = data;
            }, 0);
        });
    }
    else {
        Complaints.getTest().then(function(complaints) {
            $scope.complaints = complaints;
        });
    }
})
.controller('ComplaintDetailCtrl', function($scope, $stateParams, $timeout, Complaints, RunMode) {
    //$scope.showComments = true;
    if (RunMode.realtime()) {
        Complaints.getById($stateParams.complaintID, function(complaint) {
            $timeout(function() {
                $scope.complaints = [complaint,];
            }, 0);
        });
    } else {
        Complaints.getTest().then(function(complaints) {
            $scope.complaints = [];
            for (var i = 0; i < complaints.length; i++)
                if ($stateParams.complaintID === complaints[i].id) {
                    $scope.complaints = [complaints[i]];
                    //console.log('ccc detail', $scope.complaints);
                    break;
                }
        });
    }

    // TODO
})
.controller('ComplaintCardCtrl', function($scope, $localstorage, $ionicPopover, $ionicActionSheet, $timeout, Geo, RunMode, UserInfo, Complaints, $cordovaSocialSharing) {
    $scope.srvUrl = RunMode.srvUrl();
    console.log('srvurl', $scope.srvUrl);
    if ($scope.complaint.Coordinate) {
        console.log('coor', $scope.complaint.Coordinate);
        var coor = $scope.complaint.Coordinate.split(',');
        var lat = parseFloat(coor[0]);
        var lng = parseFloat(coor[1]);
        //if ((isNaN(lat) || isNaN(lng)) && $scope.complaint.place)
        if (!$scope.complaint.Location)
            Geo.reverseGeocodeDetail(lat, lng).then(function(locString) {
                $scope.complaint.Location = locString;
                console.log($scope.complaint.place);
            });
    }

    switch ($scope.complaint.AllowedPublished) {
        case false:
            $scope.complaint.status = 'rejected';
            break;
        case true:
            $scope.complaint.status = 'accepted';
            switch ($scope.complaint.HadProcessed) {
                case false:
                    $scope.complaint.status = 'processing';
                case true:
                    $scope.complaint.status = 'done';
            };
            break;
        default:
            if (!$scope.complaint.status)
                $scope.complaint.status = '';
    }

    if ($scope.complaint.PicturePath) {
        $scope.complaint.photos = $scope.complaint.PicturePath.split('|');
        console.log($scope.complaint.photos, $scope.complaint.PicturePath.split('|'));
    }

    if (RunMode.local()) {
        $scope.complaint.avatar = 'http://ac-mbqjf2p8.clouddn.com/HGdpG1q4AEmVA7owhvuT3KcvUrttRuipL2qw2d1E.jpg';
    }
    else {
        UserInfo.getAll(function(data) {
            for (var i in data) {
                if (data[i].UserName === $scope.complaint.UserName) {
                    $scope.complaint.avatar = RunMode.srvUrl() + data[i].AvatarPath;
                    break;
                }
            }
        });
    }

    $scope.isFollowed = "加关注";
    $scope.complaint.likeIcon = "ion-ios-heart-outline";
    $scope.complaint.follows = [];
    $scope.complaint.likes = [];
    if (!RunMode.local()) {
        // TODO save to cloud
        Complaints.followedList($scope.complaint.ComplaintId, function(users) {
            console.log('followedList users', JSON.stringify(users));
            $scope.complaint.follows = users;
            if ($.inArray(UserInfo.name(), $scope.complaint.follows) > -1) {
                $scope.isFollowed = "已关注";
            }
        });
        Complaints.likedList($scope.complaint.ComplaintId, function(users) {
            console.log('likes', JSON.stringify(users));
            $scope.complaint.likes = users;
            if ($.inArray(UserInfo.name(), $scope.complaint.likes) > -1) {
                $scope.complaint.likeIcon = "ion-ios-heart";
            }
        });
    }
    $scope.toggleFollow = function() {
        if (RunMode.local()) {
            if ($.inArray(UserInfo.name(), $scope.complaint.follows) > -1) {
                console.log('has followed', JSON.stringify($scope.complaint.follows));
                var index = $scope.complaint.follows.indexOf(UserInfo.name());
                if (index > -1)
                    $scope.complaint.follows.splice(index, 1);
                $scope.isFollowed = "加关注";
            }
            else {
                $scope.complaint.follows.push(UserInfo.name());
                $scope.isFollowed = "已关注";
            }
        }
        else {
            if (UserInfo.loggedin())
                if ($.inArray(UserInfo.name(), $scope.complaint.follows) > -1) {
                    console.log('has followed', JSON.stringify($scope.complaint.follows));
                    Complaints.unFollow($scope.complaint.ComplaintId, function() {
                        var index = $scope.complaint.follows.indexOf(UserInfo.name());
                        if (index > -1)
                            $scope.complaint.follows.splice(index, 1);
                        $scope.isFollowed = "加关注";
                    });
                } else {
                    Complaints.addFollow($scope.complaint.ComplaintId, function() {
                        $scope.complaint.follows.push(UserInfo.name());
                        $scope.isFollowed = "已关注";
                    });
                }
            else
                ;//TODO ask Login();
        }
    };

    $scope.toggleLike = function() {
        if (RunMode.local()) {
            if ($.inArray(UserInfo.name(), $scope.complaint.likes) > -1) {
                console.log('has liked', JSON.stringify($scope.complaint.likes));
                var index = $scope.complaint.likes.indexOf(UserInfo.name());
                if (index > -1)
                    $scope.complaint.likes.splice(index, 1);
                $scope.complaint.likeIcon = "ion-ios-heart-outline";
            }
            else {
                $scope.complaint.likes.push(UserInfo.name());
                $scope.complaint.likeIcon = "ion-ios-heart";
            }
        }
        else {
            if (UserInfo.loggedin())
                if ($.inArray(UserInfo.name(), $scope.complaint.likes) > -1) {
                    console.log('has liked', JSON.stringify($scope.complaint.likes));
                    Complaints.unLike($scope.complaint.ComplaintId, function() {
                        var index = $scope.complaint.likes.indexOf(UserInfo.name());
                        if (index > -1)
                            $scope.complaint.likes.splice(index, 1);
                        $scope.complaint.likeIcon = "ion-ios-heart-outline";
                    });
                }
                else {
                    Complaints.addLike($scope.complaint.ComplaintId, function() {
                        $scope.complaint.likes.push(UserInfo.name());
                        $scope.complaint.likeIcon = "ion-ios-heart";
                    });
                }
            else
                ;//TODO ask Login();
        }
    };

    if ($scope.complaint.Tag)
        $scope.complaint.tags = $scope.complaint.Tag.split('|');

    /*
    if (!$scope.complaint.comments)
        $scope.complaint.comments = [];
    for (var i in $scope.complaint.comments)
        $scope.complaint.comments[i].icon = "img/social.umeng/" + imgs[i];
        //$scope.complaint.comments[i].icon = randomAvatar($scope.complaint.comments[i].date);

    if (!$scope.showComments)
        $scope.showComments = false;
    $scope.viewComments = function() {
        $scope.showComments = !$scope.showComments;
    };
    // TODO save comments to local?
    $scope.addComment = function() {
        var newComment = {
            "post_id": $scope.complaint.id,
            "user": UserInfo.name(),
            "date": new Date().toISOString().replace('T', ' ').substring(0,19),
            "text": $scope.complaint.newCommentText
        };
        newComment.icon = "img/social.umeng/" + imgs[7];
        //newComment.icon = randomAvatar(newComment.date);
        //$scope.complaint.comments.unshift(newComment);
        Complaints.addComment(newComment);
        //UserInfo.addComment($scope.complaint.newComment.id);
        console.log(JSON.stringify($scope.complaint.newCommentText));
        $scope.complaint.newCommentText = '';
    };

    // Comment Avatar
    var imgs = [
        "umeng_socialize_google.png",
        "umeng_socialize_facebook.png",
        "umeng_socialize_douban_on.png",
        "umeng_socialize_qq_on.png",
        "umeng_socialize_qzone_on.png",
        "umeng_socialize_renren_on.png",
        "umeng_socialize_sina_on.png",
        "umeng_socialize_sms.png",
        "umeng_socialize_twitter.png",
        "umeng_socialize_tx_on.png",
        "umeng_socialize_wechat.png",
        "umeng_socialize_wxcircle.png"
    ];
    var randomAvatar = function(date) {
        var ii = parseInt(date[17]+date[18]);
        if (!ii)
            ii = 0;
        ii %= 12;
        //console.log('iii', ii, imgs[ii]);
        //RunMode.showAlert(ii.toString(), "img/social.umeng/" + imgs[ii]);
        return "img/social.umeng/" + imgs[ii];
    };
    */

    // Share Actions
    var message = $scope.complaint.Text;
    var subject = $scope.complaint.Location;
    var photo = null;
    if ($scope.complaint.photos && $scope.complaint.photos.length > 0)
        photo = $scope.complaint.photos[0];
    var link = null;    // TODO
    var shareAction = function() {
        $cordovaSocialSharing
            .share(message, subject, photo, link) // Share via native share sheet
            .then(function(result) {
                console.log('share success', result);
                // Success!
            }, function(err) {
                console.log('share failed', result);
                // An error occured. Show a message to the user
            });
    };
    $scope.showAction = function() {

        // umshare
        // TODO more info
        var shareOpt = {
            'data' : {
                'content' : {
                    'text' : message,
                    'img' : photo
                }
            }
        }
        var share2 = function(plat) {
            $.fn.umshare.share(plat, shareOpt);
        }

        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({
            buttons: [
            { text: '<i class="icon ion-chatbubble-working"></i>腾讯微博' },
            { text: '<i class="icon ion-android-wifi"></i>新浪微博' },
            { text: '<i class="icon ion-leaf"></i>豆瓣' },
            { text: '<i class="icon ion-social-twitter"></i>其他' }
            ],
            //destructiveText: '删除投诉',
            titleText: '分享到',
            cancelText: '取消',
            cancel: function() {
                // add cancel code..
            },
            buttonClicked: function(index) {
                // TODO share
                switch (index) {
                    case 0:
                        share2('tencent');
                        break;
                    case 1:
                        share2('sina');
                        break;
                    case 2:
                        share2('douban');
                        break;
                    default:
                        shareAction();
                }
                return true;
            }
        });

        // For example's sake, hide the sheet after two seconds
        $timeout(function() {
            hideSheet();
        }, 7000);
    };

})

.controller('TopicsNewsCtrl', function ($scope, $timeout, RunMode, News, ImgCache) {

    $scope.$on('$ionicView.enter', function () {
        $scope.srvUrl = RunMode.srvUrl();
    });

    News.getAll(function(data) {
        $timeout(function() {
            console.log('news fetch success');
            $scope.news = data;
        }, 0);
    });
})

.controller('TopicsNewsDetailCtrl', function($scope, $timeout, $stateParams, News, RunMode) {
    $scope.lb_source = 'Azure新闻　';
    $scope.lb_author = '作者：';
    $scope.$on('$ionicView.enter', function () {
        $scope.srvUrl = RunMode.srvUrl();
    });

    console.log('NewID', $stateParams.NewID);
    News.getById($stateParams.NewID, function(data) {
        $timeout(function() {
            $scope.New = data;
        }, 0);
    });
})

.controller('TopicsChartCtrl', function($scope) {
    require.config({
        paths: {
            echarts: 'js/echarts'
        }
    });

    // 使用
    require(
        [
            'echarts',
            'echarts/chart/line',
            'echarts/chart/pie',
            'echarts/chart/bar'
        ],
        DrawEChart
    );
    function DrawEChart(ec) {
        MainEChart(ec);
        NewlyEChart(ec);
        AcceptEChart(ec);
        DisposeEChart(ec);
        RectifyEChart(ec);
    }
    //渲染ECharts图表
    function MainEChart(ec) {
        //图表渲染的容器对象
        var chartContainer = document.getElementById("main");
        //加载图表
        var myChart = ec.init(chartContainer);
        myChart.setOption({
            title : {
                text: '上月投诉报表',
                subtext: '',
                x:'center'
            },
            tooltip : {
                trigger: 'axis'
            },
            legend: {
                data:['新增投诉','受理投诉','处理投诉','整改投诉'],
                y:'50px'
            },
            toolbox: {
                show : false,
                feature : {
                    mark : {show: true},
                    dataView : {show: true, readOnly: false},
                    magicType : {show: true, type: ['line', 'bar', 'stack', 'tiled']},
                    restore : {show: true},
                    saveAsImage : {show: true}
                }
            },
            grid:{
                y:'80px'
            },
            calculable : true,
            xAxis : [
            {
                type : 'category',
                boundaryGap : false,
                data : ['周一','周二','周三','周四','周五','周六','周日']
            }
            ],
            yAxis : [
            {
                type : 'value'
            }
            ],
            series : [
            {
                name:'整改投诉',
                type:'line',
                stack: '总量',
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data:[120, 132, 101, 134, 90, 230, 210]
            },
            {
                name:'处理投诉',
                type:'line',
                stack: '总量',
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data:[150, 232, 201, 154, 190, 330, 410]
            },
            {
                name:'受理投诉',
                type:'line',
                stack: '总量',
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data:[220, 182, 191, 234, 290, 330, 310]
            },
            {
                name:'新增投诉',
                type:'line',
                stack: '总量',
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data:[320, 332, 301, 334, 390, 330, 320]
            }
            ]
        });
    }
    function NewlyEChart(ec) {
        //图表渲染的容器对象
        var chartContainer = document.getElementById("newly");
        //加载图表
        var myChart = ec.init(chartContainer);
        myChart.setOption({
            title : {
                text: '关注的城市上月新增投诉',
                subtext: '',
                x:'center'
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient : 'vertical',
                x : 'left',
                data:['杭州','上海','乌鲁木齐','重庆','北京']
            },
            toolbox: {
                show : false,
                feature : {
                    mark : {show: true},
                    dataView : {show: true, readOnly: false},
                    magicType : {
                        show: true,
                        type: ['pie', 'funnel'],
                        option: {
                            funnel: {
                                x: '25%',
                                width: '50%',
                                funnelAlign: 'left',
                                max: 1548
                            }
                        }
                    },
                    restore : {show: true},
                    saveAsImage : {show: true}
                }
            },
            calculable : true,
            series : [
            {
                name:'访问来源',
                type:'pie',
                radius : '55%',
                center: ['50%', '60%'],
                data:[
                {value:335, name:'杭州'},
                {value:310, name:'上海'},
                {value:234, name:'乌鲁木齐'},
                {value:135, name:'重庆'},
                {value:1548, name:'北京'}
                ]
            }
            ]
        });
    }
    function AcceptEChart(ec) {
        //图表渲染的容器对象
        var chartContainer = document.getElementById("accept");
        //加载图表
        var myChart = ec.init(chartContainer);
        myChart.setOption({
            title : {
                text: '关注的城市上月受理投诉',
                subtext: '',
                x:'center'
            },
            tooltip : {
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            toolbox: {
                show : false,
                feature : {
                    mark : {show: true},
                    dataView : {show: true, readOnly: false},
                    magicType : {show: true, type: ['line', 'bar', 'stack', 'tiled']},
                    restore : {show: true},
                    saveAsImage : {show: true}
                }
            },
            calculable : true,
            xAxis : [
            {
                type : 'value'
            }
            ],
            yAxis : [
            {
                type : 'category',
                data : ['北京','杭州','上海','重庆','乌鲁木齐']
            }
            ],
            series : [
            {
                name:'受理投诉数量',
                type:'bar',
                stack: '总量',
                itemStyle : { normal: {label : {show: true, position: 'insideRight'}}},
                data:[320, 302, 301, 334, 390]
            }
            ]
        });
    }
    function DisposeEChart(ec) {
        //图表渲染的容器对象
        var chartContainer = document.getElementById("dispose");
        //加载图表
        var myChart = ec.init(chartContainer);
        myChart.setOption({
            title : {
                text: '关注的城市上月处理投诉',
                subtext: '',
                x:'center'
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient : 'vertical',
                x : 'left',
                data:['北京','杭州','重庆','乌鲁木齐','上海']
            },
            toolbox: {
                show : false,
                feature : {
                    mark : {show: true},
                    dataView : {show: true, readOnly: false},
                    restore : {show: true},
                    saveAsImage : {show: true}
                }
            },
            calculable : false,
            series : (function (){
                var series = [];
                for (var i = 0; i < 30; i++) {
                    series.push({
                        name:'',
                        type:'pie',
                        itemStyle : {normal : {
                            label : {show : i > 28},
                            labelLine : {show : i > 28, length:20}
                        }},
                        radius : [i * 4 + 0, i * 4 + 3],
                        data:[
                        {value: i * 128 + 80,  name:'北京'},
                        {value: i * 64  + 160,  name:'杭州'},
                        {value: i * 32  + 320,  name:'重庆'},
                        {value: i * 16  + 640,  name:'乌鲁木齐'},
                        {value: i * 8  + 1280, name:'上海'}
                        ]
                    })
                }
                series[0].markPoint = {
                    symbol:'emptyCircle',
                    symbolSize:series[0].radius[0],
                    effect:{show:true,scaleSize:12,color:'rgba(250,225,50,0.8)',shadowBlur:10,period:30},
                    data:[{x:'50%',y:'50%'}]
                };
                return series;
            })()
        });
    }
    function RectifyEChart(ec) {
        //图表渲染的容器对象
        var chartContainer = document.getElementById("rectify");
        //加载图表
        var myChart = ec.init(chartContainer);
        myChart.setOption({
            title : {
                text: '关注的城市上月整改投诉',
                subtext: '',
                x:'center'
            },
            tooltip : {
                trigger: 'axis'
            },
            toolbox: {
                show : false,
                feature : {
                    mark : {show: true},
                    dataView : {show: true, readOnly: false},
                    magicType : {show: true, type: ['line', 'bar']},
                    restore : {show: true},
                    saveAsImage : {show: true}
                }
            },
            calculable : true,
            xAxis : [
            {
                type : 'category',
                data : ['北京','杭州','上海','重庆','乌鲁木齐']
            }
            ],
            yAxis : [
            {
                type : 'value'
            }
            ],
            series : [
            {
                name:'整改投诉',
                type:'bar',
                data:[2.6, 5.9, 9.0, 26.4, 28.7],
            }
            ]
        });
    }
})
.controller('TopicsQueryCtrl', function($scope) {})
.controller('TopicsDataCtrl', function($scope) {
    $scope.today = new Date().toISOString().slice(0,10);
})
.controller('TopicsLawCtrl', function($scope) {
    $scope.width = window.innerWidth;
    $scope.height = window.innerHeight;
})
.controller('TopicsDataHistoryCtrl', function($scope, $http, RunMode) {

    var realDate = new Date();
    var toMonth = function(time) {
        realDate.setTime(time.getTime() + (1000 * 60 * 60 * 10) );
        //console.log('rd', realDate.toISOString());
        return realDate.toISOString().slice(0,7);
    };

    var doFilter = function() {
        console.log('do filter');

        if ($scope.userInput.city === '' || typeof $scope.userInput.city === 'undefined')
            return;

        $scope.records = [];
        var month;

        if (typeof $scope.userInput.month !== 'undefined')
            month = toMonth($scope.userInput.month);

        for (var i in $scope.allRecords) {
            // filter
            if (typeof $scope.userInput.city !== 'undefined' && $scope.allRecords[i].City.indexOf($scope.userInput.city) < 0)
                continue;
            if (typeof month !== 'undefined' && month !== $scope.allRecords[i].Date.slice(0,7))
                continue;
            // Set color & background
            switch ($scope.allRecords[i].Level) {
                case '优': $scope.allRecords[i].levelColor = '#00E400'; $scope.allRecords[i].textColor = '#000'; break;
                case '良': $scope.allRecords[i].levelColor = '#FFFF00'; $scope.allRecords[i].textColor = '#000'; break;
                case '轻度污染': $scope.allRecords[i].levelColor = '#FF7E00'; $scope.allRecords[i].textColor = '#000'; break;
                case '中度污染': $scope.allRecords[i].levelColor = '#FF0000'; $scope.allRecords[i].textColor = '#FFF'; break;
                case '重度污染': $scope.allRecords[i].levelColor = '#99004C'; $scope.allRecords[i].textColor = '#FFF'; break;
                case '严重污染': $scope.allRecords[i].levelColor = '#7E0023'; $scope.allRecords[i].textColor = '#FFF'; break;
            }
            // Remove 2nd Pollutant
            var rmit = $scope.allRecords[i].Pollutant.indexOf(',');
            if ( rmit > -1)
                $scope.allRecords[i].Pollutant = $scope.allRecords[i].Pollutant.slice(0, rmit);
            // Add to list
            $scope.records.push($scope.allRecords[i]);
        }
    };

    var searchCloud = function(city, month) {
        var HistoryAQI = AV.Object.extend('HistoryAQI');
        var query = new AV.Query(HistoryAQI);
        query.limit(100);
        query.descending("Date");
        query.startsWith('City', city);
        query.startsWith('Date', month);
        query.find({
            success: function(data) {
                $scope.$apply(function() {
                    $scope.allRecords = JSON.parse(JSON.stringify(data));
                    console.log('av query success: history AQI');
                    doFilter();
                });
            },
            error: function(error) {
                console.log('av query error: history AQI');
            }
        });
    };

    $scope.showTable = true;

    $scope.userInput = {};
    $scope.userInput.city = '杭州';
    $scope.userInput.month = new Date();

    if (RunMode.realtime()) {
        searchCloud($scope.userInput.city, toMonth($scope.userInput.month));
    }
    else {
        $http.get('data/aqi-history.json')
            .success(function(data) {
                $scope.allRecords = data;
                doFilter();
            }).error(function() {
                console.log('err')
            });
    }

    $scope.doSearch = function() {
        if (RunMode.realtime())
            searchCloud($scope.userInput.city, toMonth($scope.userInput.month));
        else
            doFilter();
    };

})
// TODO hour data
.controller('TopicsDataTodayCtrl', function($scope, $http, RunMode, AQI) {
    $scope.records = [];
    $scope.recordsToday = [];
    $scope.reverse = false;

    var doUpdate = function(data) {
        $scope.recordsToday = data;
        console.log('len', $scope.recordsToday.length);

        for (var i in $scope.recordsToday) {
            // Set color & background
            switch ($scope.recordsToday[i].Level) {
                case '优': $scope.recordsToday[i].levelColor = '#00E400'; $scope.recordsToday[i].textColor = '#000'; break;
                case '良': $scope.recordsToday[i].levelColor = '#FFFF00'; $scope.recordsToday[i].textColor = '#000'; break;
                case '轻度污染': $scope.recordsToday[i].levelColor = '#FF7E00'; $scope.recordsToday[i].textColor = '#000'; break;
                case '中度污染': $scope.recordsToday[i].levelColor = '#FF0000'; $scope.recordsToday[i].textColor = '#FFF'; break;
                case '重度污染': $scope.recordsToday[i].levelColor = '#99004C'; $scope.recordsToday[i].textColor = '#FFF'; break;
                case '严重污染': $scope.recordsToday[i].levelColor = '#7E0023'; $scope.recordsToday[i].textColor = '#FFF'; break;
            }
            // Remove 2nd Pollutant
            var rmit = $scope.recordsToday[i].Pollutant.indexOf(',');
            if ( rmit > -1)
                $scope.recordsToday[i].Pollutant = $scope.recordsToday[i].Pollutant.slice(0, rmit);
        }
    };

    if (RunMode.realtime()) {
        AQI.getToday(doUpdate);
    }
    else {
        $http.get('data/aqi-history.json')
            .success(function(data) {
                for (var i in data) {
                    if (data[i].Date === '2015-05-13')
                        $scope.recordsToday.push(data[i]);
                }
                doUpdate($scope.recordsToday);
            })
            .error(function() {
                console.log('err');
            });
    }

    $scope.showTable = true;

    $scope.userInput = {};
    $scope.userInput.city = '西';

    $scope.doSearch = function() {
        console.log('do search');

        if ($scope.userInput.city === '' || typeof $scope.userInput.city === 'undefined')
            return;

        $scope.records = [];
        var month;

        if (typeof $scope.userInput.month !== 'undefined')
            month = toMonth($scope.userInput.month);

        for (var i in $scope.allRecords) {
            // filter
            if (typeof $scope.userInput.city !== 'undefined' && $scope.allRecords[i].City.indexOf($scope.userInput.city) < 0)
                continue;
            if (typeof month !== 'undefined' && month !== $scope.allRecords[i].Date.slice(0,7))
                continue;
            // Add to list
            $scope.records.push($scope.allRecords[i]);
        }
    };
})

.controller('TopicsDataPollutionCtrl', function($scope, $http, RunMode) {
    $scope.showTable = true;
    $scope.pollutants = {
        NH : "氨氮排放量（万吨）",
        NOx: "氮氧化物排放量（万吨）",
        O  : "化学需氧量排放量（万吨）",
        SO2: "二氧化硫排放量（万吨）"
    };
    $scope.userInput = {};
    $scope.userInput.item = 'NH';
    $scope.records = [];

    if (RunMode.realtime()) {
        var YearsPollution = AV.Object.extend('YearsPollution');
        var query = new AV.Query(YearsPollution);
        query.descending("Year")
        query.limit(200);
        query.find({
            success: function(data) {
                $scope.records = JSON.parse(JSON.stringify(data));;
                $scope.changeItem('NH');
                console.log('av query success: years pollution');
            },
            error: function(error) {
                console.log('av query error: years pollution');
            }
        });
    }
    else {
        $http.get('data/years-pollution.json')
            .success(function(data) {
                $scope.records = data;
                $scope.changeItem('NH');
                console.log('local fetch success: years pollution');
            }).error(function() {
                console.log('local fetch error: years pollution');
            });
    }

    $scope.changeItem = function(item) {
        for ( var i in $scope.records) {
            $scope.records[i].Pollutant = $scope.records[i][item];
        }
    };
})

.controller('TopicsQuizCtrl', function($scope, $timeout, $state, UserInfo) {

    $scope.myName = "既然琴声起" || UserInfo.name();
    $scope.myLevel = "环保小卫士";
    $scope.myFrom = "来自 杭州";
    $scope.myAvatar = "img/community-user1.jpg";

    $scope.levelAvatar = "img/ionic.png";

    $scope.height = window.innerHeight;
    $scope.cardHeight = ($scope.height - 40) / 2;
    $scope.rowHeight = ($scope.cardHeight - 40) / 5;
    console.log('hhh', $scope.cardHeight, $scope.rowHeight);

    $scope.$on('$ionicView.beforeEnter', function () {
        $scope.levelAvatar = "img/ionic.png";
        $scope.message = "";
        $scope.action = "开始匹配";
    });

    var doMatch = function() {
        $scope.message = "等待对手应答";
        $scope.action = "取消";
        $timeout(function() {
            $scope.levelAvatar = "img/community-user2.jpg";
            $scope.message = "匹配成功";
            $scope.action = "开始答题";
        }, 1840);
    };

    $scope.buttonAction = function() {
        if ($scope.action == "开始匹配")
            doMatch();
        if ($scope.action == "开始答题")
            $state.go('tab.topics-quiz-vs');
    };

})

.controller('TopicsQuizVSCtrl', function($scope, $timeout, $state, Quiz, RunMode) {

    $scope.width = window.innerWidth;
    $scope.height = window.innerHeight;

    $scope.timerRunning = false;

    $scope.startTimer = function (){
        $scope.$broadcast('timer-start');
        $scope.timerRunning = true;
    };

    $scope.stopTimer = function (){
        $scope.$broadcast('timer-stop');
        $scope.timerRunning = false;
    };

    // TODO not work
    $scope.timeUp = function() {
        console.log('zzz');
        RunMode.showAlert("恭喜", "你以2:0的比分战胜了对手！");
        $state.go('tab.topics-quiz');
    };

    var i = 0;
    var myPoint = 0;
    Quiz.get(function(questions) {
        $scope.question = questions[i];

        $scope.choose = function(nth, choice) {
            console.log(nth, choice, $scope.question.answer);
            $scope.question.myChoice = choice;
            if (nth == $scope.question.answer)
                rightAction();
            else
                wrongAction();

            $timeout($scope.nextQuestion, 1000);
        };

        var rightAction = function() {
            myPoint += 1;
            $scope.question.message = "正确！";
        };
        var wrongAction = function() {
            $scope.question.message = "答错了";
        };

        $scope.nextQuestion = function() {
            console.log('nextQ', i, $scope.question);
            i += 1;
            if (i < questions.length) {
                $scope.question = questions[i];
            }
            else {
                console.log('endgame', i, $scope.question);
                $scope.say = "您的分数是：" + myPoint;
                RunMode.showAlert("恭喜", "您答对了" + myPoint + "题")
            }
        };
        $scope.prevQuestion = function() {
            if (i > 0) {
                i -= 1;
                $scope.question = questions[i];
            }
            else
                $scope.say = "没有更前了";
        };
    });
})

.controller('ShareToCtrl', function($scope) {
})

// Account Tab
.controller('AccountCtrl', function($scope, UserInfo, RunMode) {
    $scope.settings = {
        enableFriends: true
    };
    $scope.myPost = 0;
    $scope.myFollow = 0;
    $scope.myLike = 0;
    $scope.$on('$ionicView.beforeEnter', function () {
        $scope.userName = UserInfo.name();
        if (!RunMode.local()) {
            UserInfo.getMy(function(details) {
                if ((typeof details) !== 'undefined')
                    $scope.myPost = details.Complaints.length;
            });
            UserInfo.followedList($scope.userName, function(complaints) {
                $scope.myFollow = complaints.length;
            });
            UserInfo.likedList($scope.userName, function(complaints) {
                $scope.myLike = complaints.length;
            });
        }
    });
})
.controller('AccountAuthCtrl', function($scope, $http, UserInfo, RunMode) {
    if (!RunMode.local()) {
        UserInfo.getMy(function(details) {
            console.log('myDetails', JSON.stringify(details));
            $scope.myDetails = details;
        });
    }
    $scope.doAuth = function() {
        $http({
            method: 'POST',
            url: RunMode.srvUrl() + '/api/Account/RealNameAuth',
            headers: UserInfo.getHeaders(),
            data: { Id: $scope.myDetails.Id, RealName: $scope.myDetails.RealName }
        })
        .success(function(data, status) {
            console.log('auth success');
        })
        .error(function(data, status) {
            console.log('auth failed');
        })
    };
})
.controller('AccountShareCtrl', function($scope) {
    console.log('hello');
    $scope.login2 = function(plat) {
        console.log('login', plat);
        $.fn.umshare.login(plat, function(user){
            $.fn.umshare.tip('登录成功, token: ' + user.token + ', uid: ' + user.uid);
            console.log('登录成功, token: ' + user.token + ', uid: ' + user.uid);
        });
    };
})
.controller('AccountCreditsCtrl', function($scope) {})
.controller('AccountDiscussionsCtrl', function($scope, Discussions, RunMode) {
    var icons = ["tmp_avatar.jpg", "community-user1.jpg", "community-user2.jpg", "community-user3.jpg", "credits4.jpg"];
    Discussions.getAll(function(data) {
        $scope.discussions = data;
        for (var i in $scope.discussions) {
            var d = $scope.discussions[i].createTime;
            var n = parseInt(d[17]+d[18]) || 0;
            console.log('dn', d, n);
            $scope.discussions[i].icon = "img/" + icons[n % icons.length];
        }
    });
})
.controller('DiscussionCtrl', function($scope, $timeout, $ionicScrollDelegate, $stateParams, UserInfo, Discussions, RunMode) {

    $scope.width = window.innerWidth;

    $scope.title = "";
    Discussions.getAll(function(data) {
        for (var i in data)
            if (data[i].id == $stateParams.discussionID) {
                var disc = data[i];
                $scope.title = disc.title;
                for (var i in disc.messages) {
                    disc.messages[i].icon = RunMode.getRandomIcon();
                    $scope.messages.push(disc.messages[i]);
                }
            }
    });

    $scope.showTime = true;

    isIOS = ionic.Platform.isWebView() && ionic.Platform.isIOS();

    $scope.sendMessage = function() {

        var d = new Date();
        d = d.toLocaleTimeString().replace(/:\d+ /, ' ');

        //console.log($scope.data.message);

        $scope.messages.push({
            icon: RunMode.getRandomIcon(),
            userId: $scope.myId,
            text: $scope.data.message,
            time: d
        });

        // robot
        $timeout(function() {
            $scope.messages.push({
                icon: RunMode.getRandomIcon(),
                userId: 'haruna',
                text: Discussions.getRandom(),
                time: d
            });
            $ionicScrollDelegate.scrollBottom(true);
        }, 1200);

        delete $scope.data.message;
        //$ionicScrollDelegate.scrollBottom(true);

    };

    $scope.inputUp = function() {
        if (isIOS) $scope.data.keyboardHeight = 216;
        $timeout(function() {
            $ionicScrollDelegate.scrollBottom(true);
        }, 300);

    };

    $scope.inputDown = function() {
        if (isIOS) $scope.data.keyboardHeight = 0;
        $ionicScrollDelegate.resize();
    };

    $scope.closeKeyboard = function() {
        // cordova.plugins.Keyboard.close();
    };


    $scope.data = {};
    $scope.myId = UserInfo.name();
    $scope.messages = [];

})

.controller('AccountSettingsCtrl', function($scope, RunMode) {
    $scope.settings = {};
    $scope.settings.srvUrl = RunMode.srvUrl();
    $scope.settings.saveUrl = function() {
        RunMode.setSrv($scope.settings.srvUrl);
        console.log($scope.settings.srvUrl, RunMode.srvUrl());
    };
    $scope.settings.online = !RunMode.local();
    $scope.localSwitch = function() {
        RunMode.localSwitch();
        $scope.settings.online = !RunMode.local();
        $scope.settings.srvUrl = RunMode.srvUrl();
    };
    $scope.settings.useRealtimeData = RunMode.realtime();
    $scope.realtimeSwitch = function() {
        RunMode.realtimeSwitch();
        $scope.settings.useRealtimeData = RunMode.realtime();
    };
    $scope.settings.debug = RunMode.debug();
    $scope.debugSwitch = function() {
        RunMode.debugSwitch();
        $scope.settings.debug = RunMode.debug();
    };
    $scope.settings.onMars = RunMode.onMars();
    $scope.gcj02Switch = function() {
        RunMode.gcj02Switch();
        $scope.settings.onMars = RunMode.onMars();
    };
})

// TODO
.controller('LoadingCtrl', ['$scope', '$ionicLoading', function($scope, $ionicLoading) {

    // Trigger the loading indicator
    $scope.show = function() {

        // Show the loading overlay and text
        $scope.loading = $ionicLoading.show({

            // The text to display in the loading indicator
            content: 'Loading',

            // The animation to use
            animation: 'fade-in',

            // Will a dark overlay or backdrop cover the entire view
            showBackdrop: true,

            // The maximum width of the loading indicator
            // Text will be wrapped if longer than maxWidth
            maxWidth: 200,

            // The delay in showing the indicator
            showDelay: 500
        });
    };

    // Hide the loading indicator
    $scope.hide = function(){
        $scope.loading.hide();
    };
}])

.controller('GraphCtrl', function($scope, CurrentInfo, $http, RunMode, AQI) {

    // listen to window size (jQuery way)
    $(window).on("resize.doResize", function (){
        $scope.$apply(function(){
            $scope.width = window.innerWidth;
            $scope.height = window.innerHeight * 2 / 5;
        });
    });
    $scope.$on("$destroy",function (){
        $(window).off("resize.doResize"); //remove the handler added earlier
    });

    /*
    $scope.gauge_data = [
        {label: "AQI", value: 35, suffix: "", color: "#00930E"}
    ];
    $scope.gauge_options = {thickness: 5, mode: "gauge", total: 100};
    */

    // Switch for Line Chart
    $scope.weekLine = true;
    $scope.showWeek = function() {
        $scope.weekLine = true;
    };
    $scope.showMonth = function() {
        $scope.weekLine = false;
    };

    // Line Chart
    $scope.width = window.innerWidth;
    $scope.height = window.innerHeight;
    $scope.chartType = 'line';
    $scope.chartConfig = {
        title: '', // chart title. If this is false, no title element will be created.
        tooltips: false,
        labels: false, // labels on data points
        // exposed events
        mouseover: function() {},
        mouseout: function() {},
        click: function() {},
        // legend config
        legend: {
            display: false, // can be either 'left' or 'right'.
            position: 'left',
            // you can have html in series name
            htmlEnabled: false
        },
        // override this array if you're not happy with default colors
        colors: ['#E5E5E5', 'yellow'],
        innerRadius: 0, // Only on pie Charts
        lineLegend: 'lineEnd', // Only on line Charts
        lineCurveType: 'cardinal', // change this as per d3 guidelines to avoid smoothline
        isAnimate: true, // run animations while rendering chart
        yAxisTickFormat: 's', //refer tickFormats in d3 to edit this value
        xAxisMaxTicks: 7, // Optional: maximum number of X axis ticks to show if data points exceed this number
        yAxisTickFormat: 's', // refer tickFormats in d3 to edit this value
        waitForHeightAndWidth: true // if true, it will not throw an error when the height or width are not defined (e.g. while creating a modal form), and it will be keep watching for valid height and width values
    };

    var drawEline = function() {
        require.config({
            paths: {
                echarts: 'js/echarts'
            }
        });

        // 使用
        require(
                [
                'echarts',
                'echarts/chart/line',
                'echarts/chart/bar',
                'echarts/chart/scatter',
                'echarts/chart/k',
                'echarts/chart/pie',
                ],
                function (ec) {
                    // 基于准备好的dom，初始化echarts图表
                    var myEline = ec.init(document.getElementById('sEline'));

                    option = {
                        title : {
                            text: '',
                            subtext: ''
                        },
                        tooltip : {
                            trigger: 'axis'
                        },
                        legend: {
                            data:['AQI']
                        },
                        toolbox: {
                            show : false,
                            feature : {
                                mark : {show: false},
                                dataView : {show: false, readOnly: false},
                                magicType : {show: true, type: ['line', 'bar',]},
                                restore : {show: false},
                                saveAsImage : {show: true}
                            }
                        },
                        calculable : false,
                        xAxis : [
                        {
                            type : 'category',
                            boundaryGap : false,
                            data : $scope.weekData.x
                        }
                        ],
                        yAxis : [
                        {
                            type : 'value'
                        }
                        ],
                        series : [
                        {
                            name:'AQI',
                            type:'line',
                            smooth:true,
                            itemStyle: {normal: {areaStyle: {type: 'default'}}},
                            data: $scope.weekData.y
                        }
                        ]
                    };

                    myEline.setOption(option);
                }
        );
    };

    // TODO save city to localStorage
    console.log('scope city in graph', $scope.city);
    $scope.city = '杭州';

    var getHistory = AQI.getHistory;
    if (!RunMode.realtime())
        getHistory = CurrentInfo.getHistory;

    getHistory($scope.city, function(data) {
        //var week = data.weekLog;
        $scope.weekData = {};
        $scope.weekData.x = [];
        $scope.weekData.y = [];
        var acWeekData = [];

        /*
        for (var i=0; i<week.length; i++)
            weekData.push({x: week[i].date, y: [week[i].value]});
            */
        for (var i=0; i<7; i++) {
            var xxx = {x: data[i].Date.slice(8,10), y: [parseInt(data[i].AQI)]};
            acWeekData.unshift(xxx);
            $scope.weekData.x.unshift(data[i].Date.slice(8,10));
            $scope.weekData.y.unshift(parseInt([data[i].AQI]));
        }

        $scope.chartWeekData = {
            series: ['AQI'],
            data: acWeekData
        };

        //var month = data.monthLog;
        var monthData = [];
        for (var i=0; i<29 && i<data.length; i++) {
            var xxx = {x: data[i].Date.slice(8,10), y: [parseInt(data[i].AQI)]};
            monthData.unshift(xxx);
        }

        $scope.chartMonthData = {
            series: ['AQI'],
            data: monthData
        };

        //drawEline();
    });
})

.controller('LoginCtrl', function($scope) {
    $scope.l_close = "关闭";
    $scope.l_user = "用户名";
    $scope.l_passwd = "密码";
    $scope.l_login = "登录";
    $scope.l_signup = "注册";
})
.controller('SignupCtrl', function($scope, $state, $http, RunMode) {
    $scope.l_close = "关闭";
    $scope.l_user = "用户名";
    $scope.l_passwd = "密码";
    $scope.l_repeat = "再来";
    $scope.l_login = "登录";
    $scope.l_signup = "注册";
    $scope.l_email = "邮件地址";
    $scope.l_genders = ["男", "女"];
    $scope.l_male = "男";
    $scope.l_female = "女";
    $scope.l_location = "位置";

    $scope.doSignup = function(signupData) {
        console.log('signup data', JSON.stringify(signupData));
        $http({
            method: 'POST',
            url: RunMode.srvUrl() + '/api/Account/Register',
            data: signupData
        })
        .success(function(data, status) {
            console.log(status, data);
            var loginData = {
                UserName: signupData.UserName,
                Password: signupData.Password,
                RememberMe: true,
                grant_type: 'password'
            };
            UserInfo.login(loginData, function() {
                $state.go('tab.home');
            });
        })
        .error(function(data, status) {
            console.log(status);
            // TODO err handle
        });
    };
})

.controller('MapCtrl', function($scope, $ionicLoading, Geo, RunMode, Complaints) {

    var doMark = function(complaints) {
        for (var i in complaints) {
            createMark(complaints[i]);
        }
    }
    var infowindow;
    var createMark = function(complaint) {
        // coords
        var coor = complaint.Coordinate.split(',');
        var lat = parseFloat(coor[0]);
        var lng = parseFloat(coor[1]);
        console.log(lat, lng);
        if (isNaN(lat) || isNaN(lng))
            return;
        var myLatlng = new google.maps.LatLng(lat, lng);
        // follow
        var foN = complaint.follow;
        var label;
        if (!foN)
            foN = 0;
        if (foN > 9999) {
            foN = Math.round(foN / 1000) + 'k+';
            label = 'label-black';
        }
        else if (foN > 999) {
            foN = Math.round(foN / 1000) + 'k+';
            label = 'label-red';
        }
        else if (foN > 99) {
            label = 'label-yellow';
        }
        else if (foN > 9) {
            label = 'label-blue';
        }
        else {
            label = 'label-green';
        }
        // info
        var place = complaint.Location || '';
        if (complaint.Text.length > 30)
            var abstr = complaint.Text.substring(0, 30) + '...';
        else
            var abstr = complaint.Text;
        var infocontent = {
            content: '<h5>' + place + '</h5>' + abstr + ' (关注数' + foN.toString() + ') <a href="#/tab/topics/complaints/' + complaint.ComplaintId + '">详情</a>'
        };

        var marker = new MarkerWithLabel({
            position: myLatlng,
            map: $scope.map,
            labelContent: foN.toString(),
            labelAnchor: new google.maps.Point(-15, 40),
            labelClass: label, // the CSS class for the label
            labelInBackground: false
        });
        /*
        marker = new google.maps.Marker({
            position: myLatlng,
            map: $scope.map,
            title: complaint.tags.toString()
        });
        */
        google.maps.event.addListener(marker, 'click', function() {
            if (infowindow) infowindow.close();
            infowindow = new google.maps.InfoWindow(infocontent);
            infowindow.open($scope.map, marker);
        });
    };

    var myMarker;
    $scope.mapCreated = function(map) {
        $scope.map = map;

        // Load complaint json
        if (RunMode.realtime()) {
            Complaints.getAll(function(complaints) {
                doMark(complaints);
            });
        }
        else {
            Complaints.getTest().then(function(complaints) {
                doMark(complaints);
            });
        }

        $scope.centerOnMe();
    };

    $scope.currentLocationString = "地图";
    $scope.refreshData = function() {
        Geo.getLocation().then(function(position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;

            Geo.reverseGeocode(lat, lng).then(function(locString) {
                $scope.currentLocationString = locString;
                console.log($scope.currentLocationString);
                //_this.getBackgroundImage(lat, lng, locString);
            });
            //_this.getCurrent(lat, lng);
        }, function(error) {
            //RunMode.showAlert('Geo Error! ', error);
        });
    };
    $scope.refreshData();

    $scope.centerOnMe = function () {
        console.log("Centering");
        if (!$scope.map) {
            return;
        }

        $scope.loading = $ionicLoading.show({
            content: 'Getting current location...',
            showBackdrop: false
        });

        $scope.refreshData();

        Geo.getLocation().then(function(pos) {
            console.log('Got pos', pos.coords.latitude, pos.coords.longitude);
            var myLatlng;
            if (RunMode.onMars()) {
                // convert right coords to Mars coords (for devices use normal GPS)
                var GCJ02loc = new WGS84_to_GCJ02().transform(pos.coords.latitude, pos.coords.longitude);
                myLatlng = new google.maps.LatLng(GCJ02loc[0], GCJ02loc[1]);
            } else {
                myLatlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            }
            if (myMarker)
                myMarker.setMap(null);;
            myMarker = new MarkerWithLabel({
                position: myLatlng,
                map: $scope.map,
                labelContent: '当前位置',
                labelClass: 'label-white',
                labelAnchor: new google.maps.Point(-15, 40),
                labelInBackground: false
            });
            $scope.map.setCenter(myLatlng);
            $scope.map.setZoom(15);
        }, function (error) {
            console.log('Geo Error!', error.message);
            RunMode.showAlert("定位失败", "请确认已经启用地理位置功能");
        });
        $ionicLoading.hide();
    };
})

// TODO
/*
.controller('GeoCtrl', function($cordovaGeolocation) {

    var posOptions = {timeout: 30000, enableHighAccuracy: false};
    $cordovaGeolocation
        .getCurrentPosition(posOptions)
        .then(function (position) {
            var lat  = position.coords.latitude;
            var lon = position.coords.longitude;
        }, function(err) {
            // error
        });

    var watchOptions = {
        frequency : 1000,
        timeout : 3000,
        enableHighAccuracy: false // may cause errors if true
    };

    var watch = $cordovaGeolocation.watchPosition(watchOptions);
    watch.then(
            null,
            function(err) {
                // error
            },
            function(position) {
                var lat  = position.coords.latitude;
                var lon = position.coords.longitude;
            });


    watch.clearWatch();
    // OR
    $cordovaGeolocation.clearWatch(watch)
        .then(function(result) {
            // success
        }, function (error) {
            // error
        });
})
*/
;
