angular.module('starter.directives', [])

.directive('complaints', function($timeout) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'templates/complaints.html',
        link: function($scope, $element, $attr) {
        }
    }
})

// All this does is allow the message
// to be sent when you tap return
.directive('input', function($timeout) {
    return {
        restrict: 'E',
        scope: {
            'returnClose': '=',
            'onReturn': '&',
            'onFocus': '&',
            'onBlur': '&'
        },
        link: function(scope, element, attr) {
            element.bind('focus', function(e) {
                if (scope.onFocus) {
                    $timeout(function() {
                        scope.onFocus();
                    });
                }
            });
            element.bind('blur', function(e) {
                if (scope.onBlur) {
                    $timeout(function() {
                        scope.onBlur();
                    });
                }
            });
            element.bind('keydown', function(e) {
                if (e.which == 13) {
                    if (scope.returnClose) element[0].blur();
                    if (scope.onReturn) {
                        $timeout(function() {
                            scope.onReturn();
                        });
                    }
                }
            });
        }
    }
})

.directive('gmap', function() {
    return {
        restrict: 'E',
        scope: {
            onCreate: '&'
        },
        link: function ($scope, $element, $attr) {
            function initialize() {
                var mapOptions = {
                    center: new google.maps.LatLng(30.2485736,120.1437163),
                    zoom: 11,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                var map = new google.maps.Map($element[0], mapOptions);

                $scope.onCreate({map: map});

                // Stop the side bar from dragging when mousedown/tapdown on the map
                google.maps.event.addDomListener($element[0], 'mousedown', function (e) {
                    e.preventDefault();
                    return false;
                });
            }

            if (document.readyState === "complete") {
                initialize();
            } else {
                google.maps.event.addDomListener(window, 'load', initialize);
            }
        }
    }
})

.directive('tabsShrink', function($document) {
    return {
        restrict: 'A',
        link: function($scope, $element, $attr) {
            var starty = $scope.$eval($attr.tabsShrink) || 0;
            var shrinkAmt;

            var amt;

            var y = 0;
            var prevY = 0;
            var scrollDelay = 0.4;

            var fadeAmt;

            var tabs = $document[0].body.querySelector('.tabs');
            var tabsHeight = tabs.offsetHeight;

            function onScroll(e) {
                //var scrollTop = e.detail.scrollTop;
                // jQuery ?
                var scrollTop = e.originalEvent.detail.scrollTop;

                if(scrollTop >= 0) {
                    y = Math.min(tabsHeight / scrollDelay, Math.max(0, y + scrollTop - prevY));
                } else {
                    y = 0;
                }
                //console.log(scrollTop);

                ionic.requestAnimationFrame(function() {
                    fadeAmt = 1 - (y / tabsHeight);
                    tabs.style[ionic.CSS.TRANSFORM] = 'translate3d(0, ' + y + 'px, 0)';
                    for(var i = 0, j = tabs.children.length; i < j; i++) {
                        tabs.children[i].style.opacity = fadeAmt;
                    }
                });

                prevY = scrollTop;
            }

            $element.bind('scroll', onScroll);
        }
    }
})

;
