// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
        'ionic', 'starter.controllers', 'starter.services', 'starter.directives',
        'ngCordova', 'timer', 'angularCharts', 'ImgCache', 'ionic.utils'
])

.run(function($ionicPlatform, $localstorage, ImgCache) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleLightContent();
        }

        // ImageCache.js init
        $ionicPlatform.ready(function() {
            console.log('ImageCache init ...');
            ImgCache.$init();
        });
    });

    // Social Share
    window.umappkey = '55387b9f67e58e1d07001d36';

    AV.initialize("mbqjf2p86ktyqjoibcwu3wbyrras1yg9fzozr4q8jgffiikj", "3qrrfzafyatbeacpd1sjzhni3fmtsoq9sndwhvqfcys9k8xr");

    $localstorage.setObject('myPosts', {complaints: []});
    /*
    // localStorage test
    $localstorage.set('name', 'Max');
    console.log($localstorage.get('name'));
    $localstorage.setObject('post', {
        name: 'Thoughts',
        text: 'Today was a good day'
    });

    var post = $localstorage.getObject('post');
    console.log(JSON.stringify(post));
    */
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider, ImgCacheProvider) {

    $ionicConfigProvider.tabs.position('bottom');
    $ionicConfigProvider.tabs.style('standard');
    $ionicConfigProvider.navBar.alignTitle('center');

    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    ImgCacheProvider.manualInit = true;
    ImgCacheProvider.setOptions({
        debug: true,
        usePersistentCache: true
    });

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
    .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
    })

    // Each tab has its own nav history stack:

    .state('tab.home', {
        url: '/home',
        views: {
            'tab-home': {
                templateUrl: 'templates/tab-home.html',
                controller: 'HomeCtrl'
            }
        }
    })

    .state('tab.community', {
        url: '/community',
        views: {
            'tab-community': {
                templateUrl: 'templates/tab-community.html',
                controller: 'CommunityCtrl'
            }
        }
    })

    .state('tab.complaint', {
        url: '/complaint',
        views: {
            'tab-complaint': {
                templateUrl: 'templates/tab-complaint.html',
                controller: 'ComplaintCtrl'
            }
        }
    })

    .state('tab.topics', {
        url: '/topics',
        views: {
            'tab-topics': {
                templateUrl: 'templates/tab-topics.html',
                controller: 'TopicsCtrl'
            }
        }
    })
    .state('tab.topics-complaints', {
        url: '/topics/complaints',
        views: {
            'tab-topics': {
                templateUrl: 'templates/topics-complaints.html',
                controller: 'TopicsComplaintsCtrl'
            }
        }
    })
    .state('tab.topics-complaint-detail', {
        url: '/topics/complaints/:complaintID',
        views: {
            'tab-topics': {
                templateUrl: 'templates/topics-complaint-detail.html',
                controller: 'ComplaintDetailCtrl'
            }
        }
    })
    .state('tab.topics-complaints-search', {
        url: '/topics/complaints-search',
        views: {
            'tab-topics': {
                templateUrl: 'templates/topics-complaints-search.html',
                controller: 'SearchCtrl'
            }
        }
    })
    .state('tab.map', {
        url: '/topics/map',
        views: {
            'tab-topics': {
                templateUrl: 'templates/map.html',
                controller: 'MapCtrl'
            }
        }
    })

    .state('tab.topics-news', {
        url: '/topics/news',
        views: {
            'tab-topics': {
                templateUrl: 'templates/topics-news.html',
                controller: 'TopicsNewsCtrl'
            }
        }
    })
    .state('tab.topics-news-detail', {
        url: '/topics/news/:NewID',
        views: {
            'tab-topics': {
                templateUrl: 'templates/topics-news-detail.html',
                controller: 'TopicsNewsDetailCtrl'
            }
        }
    })
    .state('tab.topics-chart', {
        url: '/topics/chart',
        views: {
            'tab-topics': {
                templateUrl: 'templates/topics-chart.html',
                controller: 'TopicsChartCtrl'
            }
        }
    })
    .state('tab.topics-query', {
        url: '/topics/query',
        views: {
            'tab-topics': {
                templateUrl: 'templates/topics-query.html',
                controller: 'TopicsQueryCtrl'
            }
        }
    })
    .state('tab.topics-data', {
        url: '/topics/data',
        views: {
            'tab-topics': {
                templateUrl: 'templates/topics-data.html',
                controller: 'TopicsDataCtrl'
            }
        }
    })
    .state('tab.topics-law', {
        url: '/topics/law',
        views: {
            'tab-topics': {
                templateUrl: 'templates/topics-law.html',
                controller: 'TopicsLawCtrl'
            }
        }
    })
    .state('tab.topics-law-0', {
        url: '/topics/law/0',
        views: {
            'tab-topics': {
                templateUrl: 'templates/topics-law-0.html'
            }
        }
    })
    .state('tab.topics-law-1', {
        url: '/topics/law/1',
        views: {
            'tab-topics': {
                templateUrl: 'templates/topics-law-1.html'
            }
        }
    })
    .state('tab.topics-law-2', {
        url: '/topics/law/2',
        views: {
            'tab-topics': {
                templateUrl: 'templates/topics-law-2.html'
            }
        }
    })
    .state('tab.topics-law-3', {
        url: '/topics/law/3',
        views: {
            'tab-topics': {
                templateUrl: 'templates/topics-law-3.html'
            }
        }
    })
    .state('tab.topics-law-4', {
        url: '/topics/law/4',
        views: {
            'tab-topics': {
                templateUrl: 'templates/topics-law-4.html'
            }
        }
    })
    .state('tab.topics-data-history', {
        url: '/topics/data/history',
        views: {
            'tab-topics': {
                templateUrl: 'templates/topics-data-history.html',
                controller: 'TopicsDataHistoryCtrl'
            }
        }
    })
    .state('tab.topics-data-today', {
        url: '/topics/data/today',
        views: {
            'tab-topics': {
                templateUrl: 'templates/topics-data-today.html',
                controller: 'TopicsDataTodayCtrl'
            }
        }
    })
    .state('tab.topics-data-pollution', {
        url: '/topics/data/pollution',
        views: {
            'tab-topics': {
                templateUrl: 'templates/topics-data-pollution.html',
                controller: 'TopicsDataPollutionCtrl'
            }
        }
    })
    .state('tab.topics-quiz', {
        url: '/topics/quiz',
        views: {
            'tab-topics': {
                templateUrl: 'templates/topics-quiz.html',
                controller: 'TopicsQuizCtrl'
            }
        }
    })
    .state('tab.topics-quiz-vs', {
        url: '/topics/quiz/vs',
        views: {
            'tab-topics': {
                templateUrl: 'templates/topics-quiz-vs.html',
                controller: 'TopicsQuizVSCtrl'
            }
        }
    })

    .state('tab.account', {
        url: '/account',
        views: {
            'tab-account': {
                templateUrl: 'templates/tab-account.html',
                controller: 'AccountCtrl'
            }
        }
    })
    .state('tab.account-messages', {
        url: '/account/messages',
        views: {
            'tab-account': {
                templateUrl: 'templates/account-messages.html',
            }
        }
    })
    .state('tab.account-discussions', {
        url: '/account/discussions',
        views: {
            'tab-account': {
                templateUrl: 'templates/account-discussions.html',
                controller: 'AccountDiscussionsCtrl'
            }
        }
    })
    .state('tab.account-discussion-in', {
        url: '/account/discussions/:discussionID',
        views: {
            'tab-account': {
                templateUrl: 'templates/discussion.html',
                controller: 'DiscussionCtrl'
            }
        }
    })
    .state('tab.my-complaints', {
        url: '/topics/my-complaints',
        views: {
            'tab-account': {
                templateUrl: 'templates/my-complaints.html',
                controller: 'MyComplaintsCtrl'
            }
        }
    })
    .state('tab.account-auth', {
        url: '/account/auth',
        views: {
            'tab-account': {
                templateUrl: 'templates/account-auth.html',
                controller: 'AccountAuthCtrl'
            }
        }
    })
    .state('tab.account-share', {
        url: '/account/share',
        views: {
            'tab-account': {
                templateUrl: 'templates/account-share.html',
                controller: 'AccountShareCtrl'
            }
        }
    })
    .state('tab.account-settings', {
        url: '/account/settings',
        views: {
            'tab-account': {
                templateUrl: 'templates/account-settings.html',
                controller: 'AccountSettingsCtrl'
            }
        }
    })
    .state('tab.account-credits', {
        url: '/account/credits',
        views: {
            'tab-account': {
                templateUrl: 'templates/account-credits.html',
                controller: 'AccountCreditsCtrl'
            }
        }
    })
    .state('tab.account-signup', {
        url: '/account/settings/signup',
        views: {
            'tab-account': {
                templateUrl: 'templates/account-signup.html',
                controller: 'SignupCtrl'
            }
        }
    })
    ;

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/home');

})
;
