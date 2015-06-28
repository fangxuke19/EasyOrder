// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'localStorageServices', 'ngCordova', 'ion-google-place'])
    .config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.withCredentials = true;

    }])
    .constant('CONFIG', {
        //serverUrl: "http://btxlzh.xicp.net:1337"
        serverUrl: "http://localhost:1337"
    })
    .run(function($ionicPlatform, AccountService, $rootScope) {
        $ionicPlatform.ready(function() {
            //$rootScope.serverUrl = "http://btxlzh.xicp.net:1337"
            $rootScope.serverUrl = "http://localhost:1337";
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)ionic 
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleLightContent();
            }
        });
    })

.config(function($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
        .state('tab', {
        url: "/tab",
        abstract: true,
        templateUrl: "templates/tabs.html"
    })

    // Each tab has its own nav history stack:

    .state('tab.order', {
            url: '/order',
            views: {
                'tab-order': {
                    templateUrl: 'templates/order.html',
                    controller: 'OrderCtrl'
                }
            }
        })
        .state('tab.orderdetail', {
            url: '/order/:index',

            views: {
                'tab-order': {
                    templateUrl: 'templates/orderdetail.html',
                    controller: 'OrderDetailCtrl',
                }
            },
            resolve: {

            }

        })
        .state('tab.dish', {
            url: '/dish/:id',

            views: {
                'tab-restaurant': {
                    templateUrl: 'templates/restaurant-dish.html',
                    controller: 'RestaurantDishCtrl',
                }
            },
            resolve: {
                dish_data: function(AccountService, $stateParams) {
                    return AccountService.getDish($stateParams.id);
                }
            }

        })
        .state('tab.menu', {
            url: '/menu/:id',
            views: {
                'tab-restaurant': {
                    templateUrl: 'templates/restaurant-menu.html',
                    controller: 'RestaurantMenuCtrl',
                }
            },
            resolve: {

            },
        })
        .state('tab.restaurant', {
            url: '/restaurant',
            views: {
                'tab-restaurant': {
                    templateUrl: 'templates/restaurant.html',
                    controller: 'RestaurantCtrl',
                }
            }
        })
        .state('tab.map', {
            url: '/restaurant/map',
            views: {
                'tab-restaurant': {
                    templateUrl: 'templates/map.html',
                    controller: 'MapCtrl'
                }
            }
        })
        // .state('tab.restaurantedit', {
        //     url: '/restaurantedit',
        //     views: {
        //       'tab-restaurant': {
        //         templateUrl: 'templates/restaurantedit.html',
        //         controller: 'RestaurantEditCtrl',
        //       }
        //     },
        //   })
        .state('login', {
            url: '/login',
            templateUrl: 'templates/login.html',
            controller: 'LoginCtrl'
        })
        .state('tab.qrcode', {
            url: '/qrcode/:id',
            views: {
                'tab-restaurant': {
                    templateUrl: 'templates/qrcode.html',
                    controller: 'RestaurantQRCodeCtrl',
                }
            },
            resolve: {
                menu_data: function(AccountService, $stateParams) {
                    return AccountService.getMenu($stateParams.id);
                }
            },
        })

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/restaurant');

});
