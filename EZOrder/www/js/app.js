// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.paymentService', 'localStorageServices', 'ngCordova', 'starter.uploadFile'])
    .config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.withCredentials = true;
    }])
    .constant('CONFIG', {
        //serverUrl: "http://btxlzh.xicp.net:1337", //'http://btxlzh.xicp.net:1337'
        serverUrl: "http://localhost:1337",
        distance: 50
    })
    .run(function($ionicPlatform, AccountService, $rootScope) {
        //$rootScope.serverUrl = "http://btxlzh.xicp.net:1337";
        $rootScope.serverUrl = "http://localhost:1337";
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
            AccountService.getUser();
        });
    })
    .directive('imageonload', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.bind('load', function() {
                    // alert("file loaded ");
                });
            }
        };
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

        .state('tab.search', {
                url: '/search',
                views: {
                    'tab-search': {
                        templateUrl: 'templates/tab-search.html',
                        controller: 'SearchCtrl'
                    }
                }
            })
            .state('tab.map', {
                url: '/map',
                views: {
                    'tab-search': {
                        templateUrl: 'templates/map.html',
                        controller: 'MapCtrl'
                    }
                }
            })
            .state('tab.restaurant', {
                url: '/restaurant/:id',

                views: {
                    'tab-search': {
                        templateUrl: 'templates/restaurant.html',
                        controller: 'RestaurantCtrl',

                    }
                },
                resolve: {
                    restaurant_data: function(DataService, $stateParams) {
                        return DataService.getRestaurant($stateParams.id);
                    }
                }

            })
            .state('tab.menu', {
                url: '/menu/:id',

                views: {
                    'tab-search': {
                        templateUrl: 'templates/restaurant-menu.html',
                        controller: 'RestaurantMenuCtrl',
                    }
                },
                resolve: {
                    menu_data: function(DataService, $stateParams) {
                        return DataService.getMenu($stateParams.id);
                    }
                }

            })
            .state('tab.dish', {
                url: '/dish/:id',

                views: {
                    'tab-search': {
                        templateUrl: 'templates/restaurant-dish.html',
                        controller: 'RestaurantDishCtrl',
                    }
                },
                resolve: {
                    dish_data: function(DataService, $stateParams) {
                        return DataService.getDish($stateParams.id);
                    }
                }

            })
            .state('tab.cart', {
                url: '/cart',
                views: {
                    'tab-cart': {
                        templateUrl: 'templates/tab-cart.html',
                        controller: 'CartCtrl',
                    }
                }
            })
            .state('tab.checkout', {
                url: '/cart/checkout',
                views: {
                    'tab-cart': {
                        templateUrl: 'templates/Payment.html',
                        controller: 'PaymentCtrl',
                    }
                }
            })
            .state('tab.success', {
                url: '/cart/checkout/success',
                views: {
                    'tab-cart': {
                        templateUrl: 'templates/success.html'
                    }
                }
            })
            .state('tab.cancel', {
                url: '/cart/checkout/cancel',
                views: {
                    'tab-cart': {
                        templateUrl: 'templates/cancel.html'
                    }
                }
            })
            .state('tab.login', {
                url: '/login',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/login.html',
                        controller: 'LoginCtrl'
                    }
                }
            })
            .state('tab.account', {
                url: '/account',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/account.html',
                        controller: 'AccountCtrl',
                    }
                }
            })
            .state('tab.editPrifile', {
                url: '/account/edit',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/edit-profile.html',
                        controller: 'ProfileCtrl',
                    }
                }
            })
            .state('tab.favorite', {
                url: '/account/favorite',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/favorite.html',
                        controller: 'favoriteCtrl',
                    }
                }
            })


        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/search');

    });
