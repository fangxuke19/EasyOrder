angular.module('starter.services', [])

.factory('DataService', function($q, $http, AccountService, CONFIG, $rootScope) {
        function getRestaurantByQRCode(Url, cb_id) {
            var vars = {};
            var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi,
                function(m, key, value) {
                    vars[key] = value;
                    cb_id(value);
                });
            return vars;
        }

        var dataFactory = {};
        dataFactory.cart = [];
        dataFactory.reservation  = {};
        dataFactory.getAllRestaurants = function() {
            return $http.get(CONFIG.serverUrl + '/restaurant/');
        }
        dataFactory.getRestaurant = function(id) {
            return $http.get(CONFIG.serverUrl + '/restaurant/' + id)
                .then(
                    function(resp) {
                        dataFactory.restaurant = resp.data;
                        return resp.data;
                    },
                    function(err) {
                        return err;
                    }
                );
        }
        dataFactory.calculate = function(latitude, longitude, other) {
            if (!other || other === undefined || other.position === undefined || latitude === undefined || longitude === undefined) {
                return false;
            } else {

                var dist = distance(other.position[0], other.position[1], latitude, longitude);
                console.log("distance: " + dist);
                if (dist < CONFIG.distance)
                    return true;
            }
            return false;


        }

        function distance(lat1, lon1, lat2, lon2, unit) {
            var radlat1 = Math.PI * lat1 / 180
            var radlat2 = Math.PI * lat2 / 180
            var radlon1 = Math.PI * lon1 / 180
            var radlon2 = Math.PI * lon2 / 180
            var theta = lon1 - lon2
            var radtheta = Math.PI * theta / 180
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            dist = Math.acos(dist)
            dist = dist * 180 / Math.PI
            dist = dist * 60 * 1.1515
            if (unit == "K") {
                dist = dist * 1.609344
            }
            if (unit == "N") {
                dist = dist * 0.8684
            }
            return dist
        }
        dataFactory.setRestaurantLocation = function(id, lat, lan) {
            $http.get(CONFIG.serverUrl + '/restaurant/update/' + id + '?position=' + lat + '&position' + lan);
        }
        dataFactory.isFavorite = function(restaurant_id) {
            return $http.get(CONFIG.serverUrl + '/user/isFavorite?user=' + AccountService.user.id + "&restaurant=" + restaurant_id)
                .then(
                    function(resp) {
                        console.log(resp.data);
                        return resp.data;
                    },
                    function(err) {
                        console.log(err);
                        return err;
                    }
                );
        }
        dataFactory.addToFavorite = function(restaurant_id) {
            var requestData = {};
            requestData.user = AccountService.user.id;
            requestData.restaurant = restaurant_id;
            return $http.post(CONFIG.serverUrl + '/user/addToFavorite', requestData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(
                function(resp) {
                    console.log("addToFavorite: " + resp.data);
                    return resp.data;
                },
                function(err) {
                    console.log(err);
                    return err;
                }
            );
        }
        dataFactory.deleteFromFavorite = function(restaurant_id) {
            var requestData = {};
            requestData.user = AccountService.user.id;
            requestData.restaurant = restaurant_id;
            return $http.post(CONFIG.serverUrl + '/user/deleteFromFavorite', requestData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(
                function(resp) {
                    console.log("delete favorite: " + resp.data);
                    return resp.data;
                },
                function(err) {
                    console.log(err);
                    return err;
                }
            );
        }
        dataFactory.getFavoriateRestaurant = function() {
            return $http.get(CONFIG.serverUrl + '/User/getFavorite?user=' + AccountService.user.id)
                .then(
                    function(resp) {
                        console.log(resp.data);
                        dataFactory.favoriteRestaurants = resp.data[0].favoriteRestaurant;
                        //console.log("dataFactory.favoriteRestaurant: "+dataFactory.favoriteRestaurant);
                        return resp.data;
                    },
                    function(err) {
                        return err;
                    }
                );
        }
        dataFactory.getMenu = function(id) {
            return $http.get(CONFIG.serverUrl + '/menu/' + id + '/all')
                .then(
                    function(resp) {
                        console.log(resp.data);
                        dataFactory.menu = resp.data;
                        return resp.data;
                    },
                    function(err) {
                        console.log(err);
                        console.log(dataFactory.restaurant.menu);
                        return err;
                    }
                );
        }
        dataFactory.getDish = function(id) {
            return $http.get(CONFIG.serverUrl + '/dish/' + id)
                .then(
                    function(resp) {
                        console.log(resp.data);
                        return resp.data;
                    },
                    function(err) {
                        console.log(err);
                        return err;
                    }
                );
        }
        dataFactory.getRestaurantByQRCode = function(Image_data, fun) {}
        dataFactory.cart = {};
        dataFactory.addToCart = function(dish, num) {

            if (dish.id in dataFactory.cart) {
                dataFactory.cart[dish.id].num += parseInt(num);
                console.log("add exist");
                console.log(dataFactory.cart);


            } else {

                dish.num = parseInt(num);
                //push new
                dataFactory.cart[dish.id] = dish;
                console.log("new add");
                console.log(dataFactory.cart);
                // console.log(Cart.dishes);
                // console.log(Cart.dish_map);

            }
            return;
        }
        dataFactory.getCart = function() {
            return dataFactory.cart;
        }

        dataFactory.clearCart = function() {
            dataFactory.cart.length = 0;
            return;
        }
        dataFactory.checkout = function(tableId,cb) {
            var requestData = {};
            if (AccountService.user) {
                requestData.user = AccountService.user.id;
            } else {
                requestData.user = 0;
            }
            console.log(tableId);
            requestData.tableId = tableId;
            requestData.dishes = dataFactory.cart;
            requestData.restaurant = dataFactory.restaurant.id;
            requestData.status='unconfirmed';
            io.socket.post('/Order/createOrder', requestData, function(data,jwres){
                    console.log(data);
                    dataFactory.order = data;    
                    cb(data);
            })
        }
        dataFactory.reserve= function(people,time,cb){
            var requestData = {};
            if (AccountService.user) {
                requestData.user = AccountService.user.id;
            } else {
                requestData.user = 0;
            }
            requestData.people = people;
            console.log(time);
            requestData.time = time
            requestData.restaurant = dataFactory.restaurant.id;
            requestData.status='unconfirmed';
            io.socket.post('/Reservation/createReservation', requestData, function(data,jwres){
                    console.log(data);
                    dataFactory.reservation[data.restaurant] = data;    
                    cb(data);
            })
        }
        dataFactory.rejectReservation=function(id,callback){
            var x = 0;
            console.log(dataFactory.reservation);
            for(rid in  dataFactory.reservation) {
                if(dataFactory.reservation[rid].id==id){
                    dataFactory.reservation[rid].status="rejected";
                }
            }
            callback();
        }
        return dataFactory;
    })
    .factory('AccountService', function($http, $ionicHistory, $q, LocalStorage, CONFIG) {
        var AccountFactory = {};
        AccountFactory.login = function(credential) {
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });
            return $http.post(CONFIG.serverUrl + "/auth/login/", credential)
                .then(
                    function(respUser) {
                        return $http.get(CONFIG.serverUrl + "/user/jwt")
                            .then(
                                function(respToken) {
                                    AccountFactory.setUser(respUser.data);
                                    return {
                                        user: respUser.data,
                                        token: respToken.data
                                    }
                                }
                            )
                    }
                );

        }
        AccountFactory.register = function(credential) {
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });
            return $http.post(CONFIG.serverUrl + "/auth/register/", credential)
                .then(
                    function(respUser) {
                        return respUser.data;
                    }
                );
        }
        AccountFactory.loginWithToken = function(token) {
            return
        }
        AccountFactory.logout = function() {
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });
            LocalStorage.del('EZ_LOCAL_TOKEN');
            delete AccountFactory.user;
            return $http.get(CONFIG.serverUrl + "/auth/logout");
        }
        AccountFactory.getToken = function() {
            return $http.get(CONFIG.serverUrl + "/user/jwt")
        }
        AccountFactory.getUser = function() {
            console.log('gerUser Start!');
            var d = $q.defer();
            if (AccountFactory.user) {
                console.log('exist user' + AccountFactory.user);
                d.resolve(AccountFactory.user);
            } else {
                console.log('user not exist');
                var ret;
                if (!LocalStorage.exist('EZ_LOCAL_TOKEN')) {
                    console.log('No local token');
                    d.reject('No local token');
                } else {
                    LocalStorage.get('EZ_LOCAL_TOKEN', function(data) {
                        if (data) {
                            $http.get(CONFIG.serverUrl + "/auth/loginWithToken?access_token=" + data)
                                .then(
                                    function(resp) {
                                        console.log('GET User by login with token' + data);
                                        AccountFactory.setUser(resp.data);
                                        d.resolve(resp.data);
                                    },
                                    function(err) {
                                        console.log('error token');
                                        LocalStorage.del('EZ_LOCAL_TOKEN');
                                        d.reject('Error local token');
                                    }
                                );
                        }
                    });

                }
            }
            return d.promise;
        }
        AccountFactory.setUser = function(user) {
            AccountFactory.user = user;
        }
        AccountFactory.editUser = function(att, val) {
            return $http.get(CONFIG.serverUrl + "/user/update/" + AccountFactory.user.id + "?" + att + '=' + val)
                .then(
                    function(resp) {
                        return resp.data;
                    }
                );
        }
        AccountFactory.checkLogin = function($scope, $state, $ionicHistory) {
            return AccountFactory.getUser().then(function(data) {
                $scope.user = data;
                var x = true;
                return x;
            }, function(err) {
                $ionicHistory.nextViewOptions({
                    disableAnimate: true,
                    disableBack: true
                });
                $state.go('tab.login');
                var x = false;
                return x;
            })
        }

        return AccountFactory;
    })
    .factory('ErrorService', function($ionicPopup) {
        var Error = {};
        Error.popUp = function(err) {
            $ionicPopup.alert({
                title: "error",
                template: err
            });
        }
        return Error;

    });