angular.module('starter.controllers', ['ionic', 'ngCordova'])

    .controller("OrderCtrl", function($scope, $cordovaBarcodeScanner, $http, $state, ErrorService, OrderService,AccountService,ReservationService) {

        $scope.orders = OrderService.orders;
        $scope.reservations = ReservationService.reservations;
        $scope.listen = function() {
            io.socket.get('/Order/listenOrder?rid=' + AccountService.restaurant.id, function serverResponded(body, JWR) {

                // JWR ==> "JSON WebSocket Response"
                console.log('Sails responded with: ', body);
                console.log('with headers: ', JWR.headers);
                console.log('and with status code: ', JWR.statusCode);
            });
        }
        io.socket.on('order', function onServerSentEvent(obj) {
            if (obj.verb === 'created') {
                console.log(obj.data);
                $scope.orders.push(obj.data);
                // Add the data to current chatList
                // Call $scope.$digest to make the changes in UI
                $scope.$digest();
            }
        });
        $scope.confirm = function(index) {
            $scope.orders[index].status = "confirmed";
            OrderService.update($scope.orders[index]).then(function(data){
                console.log(data);
            });
        }
        $scope.complete = function(index) {
            var id =$scope.orders[index].id;
            OrderService.complete(id).then(function(data){
                $scope.orders.splice(index, 1);
            })
        }
        io.socket.on('reservation', function onServerSentEvent(obj) {
            if (obj.verb === 'created') {
                console.log(obj.data);
                $scope.reservations.push(obj.data);
                console.log($scope.reservations);
                // Add the data to current chatList
                // Call $scope.$digest to make the changes in UI
                $scope.$digest();
            }
        });
        
        $scope.approve = function(index) {
            $scope.reservations[index].status = "approved";
            ReservationService.approve($scope.reservations[index]).then(function(data){
                console.log(data);
            });
        }
        $scope.reject = function(index) {
            var id =$scope.reservations[index].id;
            ReservationService.reject(id).then(function(data){
                $scope.reservations.splice(index, 1);
            })
        }


    })


.controller('OrderDetailCtrl', function($scope, $stateParams, AccountService, $ionicModal, OrderService) {
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.order = OrderService.orders[$stateParams.index];
    });

    $ionicModal.fromTemplateUrl('changeQuantityModal.html', {
        scope: $scope,
        animation: 'slide-in-up',
    }).then(function(modal) {
        $scope.modalQuantity = modal
    })
    $scope.finishChangeQuantity = function(newQuntity) {
        console.log($scope.key);
        console.log($scope.order);
        $scope.order.dishes[$scope.key].num = newQuntity;
        $scope.modalQuantity.hide();
    }
    $scope.openModal = function(key) {
        $scope.key = key;
        $scope.modalQuantity.show();
    }
    $scope.closeModal = function() {
        $scope.modalQuantity.hide();
    };
    $scope.delete = function(key) {
        delete $scope.order.dishes[key];
    };
    $scope.$on('$destroy', function() {
        $scope.modalQuantity.remove();
    });
})

.controller('LoginCtrl', function($q, $scope, $http, $state, $ionicPopup, $ionicHistory, AccountService, ErrorService, LocalStorage, $ionicModal) {

        $scope.postData = {};
        $scope.login = function() {
            AccountService.login($scope.postData).then(function(data) {
                console.log(data);
                var promise1 = AccountService.setUser(data.user);
                var promise2 = LocalStorage.set('EZ_LOCAL_TOKEN', data.token.token);
                $q.all([promise1, promise2]).then(function() {
                    $state.go('tab.restaurant');
                });
            }, function(err) {
                ErrorService.popUp("WRONG email OR password!");
            });
            return;
        };
        $scope.register = function() {
            console.log("register called");
            if ($scope.postData.password !== $scope.postData.password2) {
                ErrorService.popUp("please enter same password");
            } else if ($scope.postData.password.length < 8) {
                ErrorService.popUp("password needs to be at least 8 characters long");
            } else {
                $scope.modal.hide();
                AccountService.register(
                    $scope.postData
                ).then(function(data) {
                    $scope.login();
                }, function(err) {
                    ErrorService.popUp(err.data);
                });
            }

            return;
        };
        $ionicModal.fromTemplateUrl('Register.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
        });

        $scope.openModal = function() {
            $scope.modal.show();
        };
        $scope.closeModal = function() {
            $scope.postData = {};
            $scope.modal.hide();
        };
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
        });
    })
    .controller('RestaurantCtrl', function($rootScope, $ionicModal, $scope, $http, $state, $ionicHistory, AccountService, LocalStorage) {

        $scope.$on('$ionicView.beforeEnter', function() {
            AccountService.getUser().then(function(data) {
                $scope.restaurant = data;
                $rootScope.restaurant_ = data;
                console.log(data);
            }, function(err) {
                $ionicHistory.nextViewOptions({
                    disableAnimate: true,
                    disableBack: true
                });
                $state.go('login');
            })
        });

        $ionicModal.fromTemplateUrl('changeNameModal.html', {
            scope: $scope,
            animation: 'slide-in-up',
            backdropClickToClose: true
        }).then(function(modal) {
            $scope.modalName = modal
        })
        $ionicModal.fromTemplateUrl('changePriceModal.html', {
            scope: $scope,
            animation: 'slide-in-up',
            backdropClickToClose: true
        }).then(function(modal) {
            $scope.modalPrice = modal
        })
        $ionicModal.fromTemplateUrl('changeDescriptionModal.html', {
            scope: $scope,
            animation: 'slide-in-up',
            backdropClickToClose: true
        }).then(function(modal) {
            $scope.modalDescription = modal
        })
        
        $scope.openModal = function(mode) {
            switch (mode) {
                case 0:
                    $scope.modalName.show();
                    break;
                case 1:
                    $scope.modalPrice.show();
                    break;
                case 2:
                    $scope.modalDescription.show();
                    break;
                case 3:
                    $scope.modalImage.show();
                    break;
            }
        }
        $scope.closeModal = function(mode) {
            switch (mode) {
                case 0:
                    $scope.modalName.hide();
                    break;
                case 1:
                    $scope.modalPrice.hide();
                    break;
                case 2:
                    $scope.modalDescription.hide();
                    break;
                case 3:
                    $scope.modalImage.hide();
                    break;
            }
        };
        $scope.changeName = function(newName) {
            $scope.restaurant.name = newName;
            AccountService.editRestaurant($scope.restaurant.id, 'name', newName);
            $scope.modalName.hide();
        }
        $scope.changePrice = function(newPrice) {
            $scope.restaurant.price = newPrice;
            AccountService.editRestaurant($scope.restaurant.id, 'price', newPrice);
            $scope.modalPrice.hide();
        }
        $scope.changeDescripthon = function(newDescription) {
            $scope.restaurant.description = newDescription;
            AccountService.editRestaurant($scope.restaurant.id, 'description', newDescription);
            $scope.modalDescription.hide();
        };
        $scope.openMap = function() {
            $state.go('tab.map');
        }


        $scope.logout = function() {
            AccountService.logout()
                .success(function(resp) {
                    $state.go('login');
                    // For JSON responses, resp.data contains the result
                });


        }
    })





.controller("RestaurantQRCodeCtrl", function($stateParams, $scope, AccountService) {
        $scope.restaurant = AccountService.restaurant;
        console.log(AccountService.restaurant);
        $scope.qrSrc = AccountService.getQRSrc($stateParams.id);
    })
    .controller("RestaurantMenuCtrl", function($q, $scope, $state, $http, $stateParams, ErrorService, AccountService) {
        $scope.$on('$ionicView.beforeEnter', function() {
            AccountService.getMenu($stateParams.id).then(function(data) {
                $scope.menu = data;
            }, function(err) {})
        });
        $scope.listCanSwipe = true;
        $scope.add = function() {
            AccountService.createDish(AccountService.menu.id).then(function callback(data) {
                console.log(data);
                $state.go('tab.dish', {
                    id: data.id
                });
            })
        }
        $scope.delete = function(index) {

            AccountService.deleteDish($scope.menu.dishes[index].id).then(function callback(data) {
                $scope.menu.dishes.splice(index, 1);
            })
        }

    })
    .controller("RestaurantDishCtrl", function($scope, $http, dish_data, ErrorService, $ionicModal, AccountService, FileService, $cordovaCamera, $ionicLoading, $timeout, CONFIG) {
        $scope.dish = dish_data;
        $scope.baseURL = CONFIG.serverUrl + "/images/";

        $ionicModal.fromTemplateUrl('changeNameModal.html', {
            scope: $scope,
            animation: 'slide-in-up',
            backdropClickToClose: true
        }).then(function(modal) {
            $scope.modalName = modal
        })
        $ionicModal.fromTemplateUrl('changePriceModal.html', {
            scope: $scope,
            animation: 'slide-in-up',
            backdropClickToClose: true
        }).then(function(modal) {
            $scope.modalPrice = modal
        })
        $ionicModal.fromTemplateUrl('changeDescriptionModal.html', {
            scope: $scope,
            animation: 'slide-in-up',
            backdropClickToClose: true
        }).then(function(modal) {
            $scope.modalDescription = modal
        })
        $ionicModal.fromTemplateUrl('addPicModal.html', {
            scope: $scope,
            animation: 'slide-in-up',
            backdropClickToClose: true
        }).then(function(modal) {
            $scope.modalImage = modal
        })
        $scope.openModal = function(mode) {
            switch (mode) {
                case 0:
                    $scope.modalName.show();
                    break;
                case 1:
                    $scope.modalPrice.show();
                    break;
                case 2:
                    $scope.modalDescription.show();
                    break;
                case 3:
                    $scope.modalImage.show();
                    break;
            }
        }
        $scope.closeModal = function(mode) {
            switch (mode) {
                case 0:
                    $scope.modalName.hide();
                    break;
                case 1:
                    $scope.modalPrice.hide();
                    break;
                case 2:
                    $scope.modalDescription.hide();
                    break;
                case 3:
                    $scope.modalImage.hide();
                    break;
            }
        };

        $scope.changeName = function(newName) {
            $scope.dish.name = newName;
            AccountService.editDish(dish_data.id, 'name', newName);
            $scope.modalName.hide();
        }
        $scope.changePrice = function(newPrice) {
            $scope.dish.price = newPrice;
            AccountService.editDish(dish_data.id, 'price', newPrice);
            $scope.modalPrice.hide();
        }
        $scope.changeDescripthon = function(newDescription) {
            $scope.dish.description = newDescription;
            AccountService.editDish(dish_data.id, 'description', newDescription);
            $scope.modalDescription.hide();
        }
        var fail = function(error) {
            alert("An error has occurred: Code = " + error.code);
            console.log("upload error source " + error.source);
            console.log("upload error target " + error.target);
            $scope.modalImage.hide();
        }
        var success = function(r) {
            console.log("Code = " + r.responseCode);
            console.log("Response = " + r.response);
            console.log("Sent = " + r.bytesSent);
            $scope.modalImage.hide();
            $ionicLoading.show({
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
            $timeout(function() {
                $ionicLoading.hide();

                if (dish_data.image_urls == null) {
                    dish_data.image_urls = [];
                }
                dish_count = dish_data.image_urls.length;
                filename = dish_data.id + "_" + dish_count + "_dish.jpg";
                AccountService.addDishPic(dish_data.id, filename).then(function(data) {
                    dish_data.image_urls.push(filename);

                    $scope.image_urls.push($scope.baseURL + filename);
                });

            }, 2000);

        }

        $scope.takePicture = function() {
            var options = {
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 100,
                targetHeight: 100,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false
            };

            $cordovaCamera.getPicture(options).then(function(imageData) {
                var image = document.getElementById('profile-image');
                image.src = "data:image/jpeg;base64," + imageData;
                alert(image.src);
            }, function(err) {
                // error
            });
        };

        $scope.choose = function() {
            var options = {
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY
            };
            $cordovaCamera.getPicture(options).then(
                function(imageURI) {
                    window.resolveLocalFileSystemURI(imageURI, function(fileEntry) {
                        $scope.picData = fileEntry.nativeURL;
                        $scope.ftLoad = true;
                        dish_count = 0;
                        console.log("before upload: image_urls: " + dish_data.image_urls);
                        if (dish_data.image_urls != null) {
                            dish_count = dish_data.image_urls.length;
                        }
                        filename = dish_data.id + "_" + dish_count + "_dish.jpg";
                        FileService.upload(CONFIG.serverUrl + "/file/upload", fileEntry.nativeURL, filename, success, fail);
                    });
                },
                function(err) {
                    $ionicLoading.show({
                        template: 'Error',
                        duration: 500
                    });
                })
        };

    })
    .controller('MapCtrl', function($rootScope, $scope, $ionicLoading, $compile, AccountService) {
        $scope.init = function() {
            $ionicLoading.show({
                content: 'Getting current location...',
                showBackdrop: false
            });
            var mapOptions = {
                //center: myLatlng,
                zoom: 16,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(document.getElementById("map"),
                mapOptions);
            var contentString = "<div style='height=100px;'>" + AccountService.restaurant.address + "</div>";
            var compiled = $compile(contentString)($scope);

            var infowindow = new google.maps.InfoWindow({
                content: compiled[0]
            });
            if (AccountService.restaurant.position === undefined) {
                navigator.geolocation.getCurrentPosition(function(pos) {
                    $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
                    myLatlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                    $ionicLoading.hide();
                    var marker = new google.maps.Marker({
                        position: myLatlng,
                        map: $scope.map,
                    });
                }, function(error) {
                    alert('Unable to get location: ' + error.message);
                });
            } else {
                myLatlng = new google.maps.LatLng(AccountService.restaurant.position[0], AccountService.restaurant.position[1]);
                map.setCenter(myLatlng);

                $ionicLoading.hide();
                var marker = new google.maps.Marker({
                    position: myLatlng,
                    map: map,

                });
                google.maps.event.addListener(marker, 'click', function() {
                    infowindow.open($scope.map, marker);
                });
            }

            $scope.map = map;
        };
        //google.maps.event.addDomListener(window, 'load', initialize);
        $scope.search_data = {
            location: ''
        };
        $scope.centerOnMe = function() {
            if (!$scope.map) {
                return;
            }

            $ionicLoading.show({
                content: 'Getting current location...',
                showBackdrop: false
            });

            navigator.geolocation.getCurrentPosition(function(pos) {
                $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
                myLatlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                $ionicLoading.hide();
                var marker = new google.maps.Marker({
                    position: myLatlng,
                    map: $scope.map,

                });
            }, function(error) {
                alert('Unable to get location: ' + error.message);
            });
        };

        $scope.addToAddres = function() {
            AccountService.setLocation($rootScope.restaurant_.id, $scope.info, $scope.latitude, $scope.longitude);
            AccountService.restaurant.address = $scope.info;

        };
        $scope.search = function(info, latitude, longitude) {
            $scope.info = info;
            $scope.latitude = latitude;
            $scope.longitude = longitude;
            //Marker + infowindow + angularjs compiled ng-click
            var contentString = "<div style='height=100px;'>" + info + "</a><button class=\"button-clear\" ng-click='addToAddres()' >select address</button></div>";
            var compiled = $compile(contentString)($scope);

            var infowindow = new google.maps.InfoWindow({
                content: compiled[0]
            });
            $scope.map.setCenter(new google.maps.LatLng(latitude, longitude));
            myLatlng = new google.maps.LatLng(latitude, longitude);
            $ionicLoading.hide();
            var marker = new google.maps.Marker({
                position: myLatlng,
                map: $scope.map,

            });
            google.maps.event.addListener(marker, 'click', function() {
                infowindow.open($scope.map, marker);
            });
        }
        $scope.$watch('search_data.location', function(newVal, oldVal) {
            console.log('watch', newVal, oldVal)
            if (newVal.hasOwnProperty('formatted_address')) {
                console.log($scope.search_data.location);

                $scope.search($scope.search_data.location.formatted_address, $scope.search_data.location.geometry.location.A, $scope.search_data.location.geometry.location.F);
            }
        });
    });