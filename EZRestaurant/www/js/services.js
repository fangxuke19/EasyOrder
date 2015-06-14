angular.module('starter.services', [])
    .factory('OrderService', function($http, $ionicHistory, $q, LocalStorage,CONFIG) {
        var OrderFactory = {};
        OrderFactory.orders = [];
        OrderFactory.update =function(newObj){

            return $http.post(CONFIG.serverUrl + "/Order/update/"+newObj.id, newObj)
                    .then(
                        function(resp) {

                            return resp.data;
                        });

        }
        OrderFactory.complete =function(id){

            return $http.get(CONFIG.serverUrl + "/Order/destroy/"+id)
                    .then(
                        function(resp) {

                            return resp.data;
                        });

        }
        return OrderFactory;
    })
    .factory('ReservationService', function($http, $ionicHistory, $q, LocalStorage,CONFIG) {
        var ReservationFactory = {};
        ReservationFactory.reservations = [];
        ReservationFactory.approve =function(newObj){

            return $http.post(CONFIG.serverUrl + "/Reservation/update/"+newObj.id, newObj)
                    .then(
                        function(resp) {

                            return resp.data;
                        });

        }
        ReservationFactory.reject =function(id){

            return $http.get(CONFIG.serverUrl + "/Reservation/destroy/"+id)
                    .then(
                        function(resp) {
                            return resp.data;
                        });

        }
        return ReservationFactory;
    })
    .factory('FileService', function($http, $ionicHistory, $q, LocalStorage, CONFIG) {
        var FileFactory = {};
        FileFactory.upload = function(serverURL, fileURL, filename, success, fail) {

            var options = new FileUploadOptions();
            options.fileKey = "uploadFile";
            options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
            options.mimeType = "text/plain";

            var params = {};
            params.filename = filename;

            options.params = params;

            var ft = new FileTransfer();
            console.log("upload file called");
            ft.upload(fileURL, encodeURI(serverURL), success, fail, options);
        }
        return FileFactory;
    })
    .factory('AccountService', function($http, $ionicHistory, $q, LocalStorage, CONFIG) {
        var AccountFactory = {};
        AccountFactory.user = null;
        AccountFactory.restaurant = null;

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
        AccountFactory.logout = function() {
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });
            LocalStorage.del('EZ_LOCAL_TOKEN');
            delete AccountFactory.user;
            delete AccountFactory.restaurant;
            return $http.get(CONFIG.serverUrl + "/auth/logout");
        }
        AccountFactory.getToken = function() {
            return $http.get(CONFIG.serverUrl + "/user/jwt").then(function(resp) {
                LocalStorage.set('EZ_LOCAL_TOKEN', resp.data.token);
                return resp.data.token;
            });
        }
        AccountFactory.getUser = function() {
            console.log('gerUser Start!');
            var d = $q.defer();
            if (AccountFactory.user) {
                if (AccountFactory.restaurant) {
                    d.resolve(AccountFactory.restaurant);
                } else {
                    var promise = AccountFactory.getRestaurant(AccountFactory.user.restaurant, AccountFactory.user.id);
                    $q.all([promise]).then(function() {
                        d.resolve(AccountFactory.restaurant);
                    })
                }
            } else {
                console.log('user not exist');
                var ret;
                if (!LocalStorage.exist('EZ_LOCAL_TOKEN')) {
                    console.log('No local token');
                    d.reject('No local token');
                } else {
                    LocalStorage.get('EZ_LOCAL_TOKEN', function(data) {
                        if (data) {
                            console.log('GET User by login with token' + data);
                            $http.get(CONFIG.serverUrl + "/auth/loginWithToken?access_token=" + data)
                                .then(
                                    function(resp) {

                                        AccountFactory.user = resp.data;
                                        AccountFactory.getRestaurant(resp.data.restaurant, resp.data.id).then(function(data) {
                                            d.resolve(AccountFactory.restaurant);
                                        });
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
        AccountFactory.editDish = function(id, att, val) {
            return $http.get(CONFIG.serverUrl + "/dish/update/" + id + "?" + att + '=' + val)
                .then(
                    function(resp) {
                        return resp.data;
                    }
                );
        }
        AccountFactory.editRestaurant = function(id, att, val) {
            return $http.get(CONFIG.serverUrl + "/Restaurant/update/" + id + "?" + att + '=' + val)
                .then(
                    function(resp) {
                        return resp.data;
                    }
                );
        }

        AccountFactory.getQRSrc = function(id) {
            return CONFIG.serverUrl + "/restaurant/getQRcode?id=" + id;

        }
        AccountFactory.createDish = function(menu_id) {
            return $http.get(CONFIG.serverUrl + "/dish/createDish?owner=" + menu_id)
                .then(
                    function(resp) {
                        return resp.data;
                    }
                );

        }
        AccountFactory.deleteDish = function(dish_id) {
            return $http.get(CONFIG.serverUrl + "/dish/destroy/" + dish_id)
                .then(
                    function(resp) {
                        return resp.data;
                    }
                );

        }
        AccountFactory.addDishPic = function(dish_id, url) {
            return $http.get(CONFIG.serverUrl + "/dish/addPic?id=" + dish_id + "&url=" + url)
                .then(
                    function(resp) {
                        return resp.data;
                    }
                );
        }
        AccountFactory.getMenu = function(id) {
            return $http.get(CONFIG.serverUrl + '/menu/' + id + '/all')
                .then(
                    function(resp) {
                        console.log(resp.data);
                        AccountFactory.menu = resp.data;
                        return resp.data;
                    },
                    function(err) {
                        console.log(err);
                        return err;
                    }
                );
        }
        AccountFactory.getRestaurant = function(rid, uid) {
            if (rid != null) {
                return $http.get(CONFIG.serverUrl + '/restaurant/' + rid)
                    .then(
                        function(resp) {
                            console.log("getRestaurant");
                            console.log(resp.data);
                            AccountFactory.restaurant = resp.data;
                            return resp.data;
                        },
                        function(err) {
                            console.log(err);
                            return err;
                        }
                    );
            } else {
                return $http.get(CONFIG.serverUrl + "/restaurant/createRestaurant?owner=" + uid)
                    .then(
                        function(resp) {
                            console.log("create restaurant");
                            console.log(resp.data.restaurant);
                            AccountFactory.restaurant = resp.data.restaurant;
                            AccountFactory.user = resp.data.user;
                            return resp.data.restaurant;
                        }
                    );

            }
        }
        AccountFactory.getDish = function(id) {
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
        AccountFactory.getOrder = function(id) {
            return $http.get(CONFIG.serverUrl + '/order/' + id)
                .then(
                    function(resp) {
                        return resp.data;
                    },
                    function(err) {
                        console.log(err);
                        return err;
                    }
                );
        }
        AccountFactory.setLocation = function(id, addr, lat, lon) {
            return $http.get(CONFIG.serverUrl + '/restaurant/update/' + id + "?address=" + addr + "&position=" + lat + "&position=" + lon);
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