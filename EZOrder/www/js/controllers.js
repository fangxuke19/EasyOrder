angular.module('starter.controllers', ['ionic', 'ngCordova'])

.controller('CartCtrl', function($scope, DataService, LocalStorage, $ionicModal) {
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.cart = DataService.cart;
        console.log(DataService.cart);
    })
    $scope.checkout = function(Tnum) {
        console.log(Tnum);
        DataService.checkout(Tnum,function(data) {

            $scope.order = DataService.order;
            if (DataService.cart.length != 0) {
                $scope.showRecent = true;
            }

            DataService.cart.length = 0;
            DataService.cart = {};
            $scope.$digest();
        });
    }
    $scope.deleteRecent = function() {
        DataService.order.length = 0;
        $scope.showRecent = false;
        DataService.order = {};
    }
    $scope.delete = function(key) {
        delete DataService.cart[key];
    }
    $ionicModal.fromTemplateUrl('changeQuantityModal.html', {
        scope: $scope,
        animation: 'slide-in-up',
    }).then(function(modal) {
        $scope.modalQuantity = modal
    })
    $scope.finishChangeQuantity = function(newQuntity) {
        DataService.cart[$scope.key].num = newQuntity;
        $scope.modalQuantity.hide();
    }
    $scope.openModal = function(key) {
        $scope.key = key;
        $scope.modalQuantity.show();
    }
    $scope.closeModal = function() {
        $scope.modalQuantity.hide();
    };

    $scope.$on('$destroy', function() {
        $scope.modalQuantity.remove();
    });
    io.socket.on('order', function onServerSentEvent(obj) {
            if (obj.verb === 'updated') {
                console.log(obj.data);
                $scope.order =obj.data;
                // Add the data to current chatList
                // Call $scope.$digest to make the changes in UI
                $scope.$digest();
            }
            if (obj.verb === 'destroyed') {
                console.log(obj.data);
                $scope.order={}
                $scope.showRecent=false;
                // Add the data to current chatList
                // Call $scope.$digest to make the changes in UI
                $scope.$digest();
            }
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
                    $state.go('tab.account');
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
                    $scope.login(username, password);
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
    .controller('AccountCtrl', function($scope, $http, $state, $ionicHistory, AccountService, CONFIG, LocalStorage) {

        $scope.$on('$ionicView.beforeEnter', function() {
            AccountService.checkLogin($scope, $state, $ionicHistory).then(function(data) {
                if (data == true) {
                    $scope.photoUrl = CONFIG.serverUrl + "/images/" + $scope.user.photoUrl + "?" + new Date().getTime();
                    console.log("photoUrl: " + $scope.photoUrl);
                }
            }, function(error) {
                ErrorService.popUp("unable to connect to server");
            });

        });
        $scope.logout = function() {
            AccountService.logout()
                .success(function(resp) {
                    $state.go('tab.login');
                    // For JSON responses, resp.data contains the result
                });
        }
    })
    .controller("RestaurantCtrl", function($scope, $http, $ionicModal,DataService, restaurant_data, ErrorService, AccountService, $ionicHistory, $state) {
        $scope.$on('$ionicView.beforeEnter', function() {
            $scope.restaurant = restaurant_data;
            if(DataService.reservation[$scope.restaurant.id]){
                $scope.reservation=DataService.reservation[$scope.restaurant.id];
                $scope.showRDetail=true;
            }else{

                $scope.showRDetail=false;
            }

            if (AccountService.user == null) {
                $scope.color = "black";
            } else {
                DataService.isFavorite(restaurant_data.id).then(function(data) {
                    if (data == 'succ') {
                        $scope.color = "red";
                    } else {
                        $scope.color = "black";
                    }
                });
            }
            if(DataService.reservation[$scope.restaurant.id]){
                $scope.reservation_status=DataService.reservation[$scope.restaurant.id].status;
            }else{
                $scope.reservation_status=null;
            }
        });
            $ionicModal.fromTemplateUrl('Reservation.html', {
                scope: $scope,
                animation: 'slide-in-up',
                backdropClickToClose: true
            }).then(function(modal) {
                $scope.modalReservation = modal
            });
            $scope.openModal =function(){
                $scope.modalReservation.show();
            }
            $scope.closeModal = function(){
                 $scope.modalReservation.hide();
            }
            $scope.reserve = function(people,time){
                DataService.reserve(people,time,function(data) {
                    $scope.showRDetail=true;
                    $scope.reservation=DataService.reservation[$scope.restaurant.id];
                    $scope.$digest();
                });
                $scope.modalReservation.hide();
            }
            io.socket.on('reservation', function onServerSentEvent(obj) {
            if (obj.verb === 'updated') {
                console.log(obj.data);
                //$scope.order =obj.data;
                // Add the data to current chatList
                // Call $scope.$digest to make the changes in UI
                DataService.reservation[obj.data.restaurant]=obj.data;
                
                $scope.reservation=DataService.reservation[$scope.restaurant.id];
                $scope.$digest();
            }
            if (obj.verb === 'destroyed') {
                console.log(obj.id);
                //$scope.order={}
                //$scope.showRecent=false;
                // Add the data to current chatList
                // Call $scope.$digest to make the changes in UI
                DataService.rejectReservation(obj.id,function(){
                    $scope.reservation=DataService.reservation[$scope.restaurant.id];
                     $scope.$digest();
                });

                
            }
     });
        $scope.addToFavorite = function() {
            AccountService.checkLogin($scope, $state, $ionicHistory).then(function(data) {
                if (data == true) {
                    if ($scope.color == "black") {
                        $scope.color = "red";
                        DataService.addToFavorite(restaurant_data.id);
                    } else {
                        $scope.color = "black";
                        DataService.deleteFromFavorite(restaurant_data.id);
                    }
                }
            }, function(error) {});
        };

    })
    .controller("RestaurantMenuCtrl", function($scope, $http, menu_data, ErrorService, DataService) {
        $scope.menu = menu_data;
        $scope.restaurant = DataService.restaurant;
        console.log(DataService.restaurant);

    })
    .controller("RestaurantDishCtrl", function($scope, $http, dish_data, ErrorService, DataService) {
        $scope.dish = dish_data;
        $scope.addToCart = function(dish, num) {
            DataService.addToCart(dish, num);
        }

    })
    .controller("SearchCtrl", function($scope, $cordovaBarcodeScanner, $http, $state, DataService, ErrorService) {

        // For JSON responses, resp.data contains the result
        // $scope.restaurants = [];
        // var one = {id:1, name: 'apoplo', type: 'chinese'};
        // $scope.restaurants.push(one);

        $scope.$on('$ionicView.beforeEnter', function() {
            DataService.getAllRestaurants()
                .success(function(resp) {
                    $scope.restaurants = resp;
                })
                .error(function(error) {
                    ErrorService.popUp("unable to get restaurants data from server");
                });
        });
        $scope.scanBarcode = function() {
            $cordovaBarcodeScanner.scan().then(function(imageData) {
                var x = parseInt(imageData.text);

                $state.go('tab.restaurant', {
                    'id': x
                });

            }, function(error) {
                alert("error");
            });
        };
        $scope.gotoMap = function() {
            $state.go('tab.map');
        };


    })
    .controller("ProfileCtrl", function($scope, $http, $state, AccountService, uploadFile, CONFIG, $timeout, $ionicLoading, $ionicModal, $ionicHistory, $cordovaCamera, $ionicBackdrop) {
        $scope.$on('$ionicView.beforeEnter', function() {
            AccountService.getUser().then(function(data) {
                $scope.user = data;
                $scope.photoUrl = CONFIG.serverUrl + "/images/" + $scope.user.photoUrl + "?" + new Date().getTime();
                console.log(data);
            }, function(err) {
                $ionicHistory.nextViewOptions({
                    disableAnimate: true,
                    disableBack: true
                });
                $state.go('tab.login');
            })
        });

        var uploadURL = CONFIG.serverUrl + "/file/upload";
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
            console.log("click upload");
            var options = {
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY
            };
            $cordovaCamera.getPicture(options).then(
                function(imageURI) {
                    console.log("upload succ");
                    window.resolveLocalFileSystemURI(imageURI, function(fileEntry) {
                        $scope.picData = fileEntry.nativeURL;
                        $scope.ftLoad = true;
                        filename = $scope.user.id + "_profile.jpg";
                        uploadFile.upload(uploadURL, fileEntry.nativeURL, filename, success, fail);
                    });
                },
                function(err) {
                    console.log("upload err");
                    $ionicLoading.show({
                        template: 'Error',
                        duration: 500
                    });
                })
        };
        var success = function(r) {
            baseURL = CONFIG.serverUrl + "/images/";
            $scope.modalPic.hide();
            $ionicLoading.show({
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
            $timeout(function() {
                $ionicLoading.hide();
                if ($scope.user.photoUrl == "defaultPhoto.jpg") {
                    $scope.user.photoUrl = $scope.user.id + "_profile.jpg";
                    AccountService.editUser("photoUrl", $scope.user.photoUrl);
                }
                $scope.photoUrl = baseURL + $scope.user.photoUrl + "?" + new Date().getTime();

            }, 2000);

        }
        var fail = function(error) {
            alert("An error has occurred: Code = " + error.code);
            console.log("upload error source " + error.source);
            console.log("upload error target " + error.target);
            $scope.modalPic.hide();
        }


        $ionicModal.fromTemplateUrl('changeNameModal.html', {
            scope: $scope,
            animation: 'slide-in-up',
        }).then(function(modal) {
            $scope.modalName = modal
        })

        $ionicModal.fromTemplateUrl('changePhoneModal.html', {
            scope: $scope,
            animation: 'slide-in-up',
        }).then(function(modal) {
            $scope.modalPhone = modal
        })
        $ionicModal.fromTemplateUrl('changePicModal.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modalPic = modal
        })
        $ionicModal.fromTemplateUrl('imageModal.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modalImage = modal
        })
        $scope.showImage = function() {
            $scope.imageSrc = $scope.user.photoUrl;
            $scope.openModal(3);
        }
        $scope.finishChangeName = function(newName) {
            $scope.user.nickName = newName;
            AccountService.editUser('nickName', newName);
            $scope.modalName.hide();
        }
        $scope.finishChangePhone = function(newPhone) {
            $scope.user.phoneNumber = newPhone;
            AccountService.editUser('phoneNumber', newPhone);
            $scope.modalPhone.hide();
        }
        $scope.openModal = function(mode) {
            switch (mode) {
                case 0:
                    $scope.modalName.show();
                    break;
                case 1:
                    $scope.modalPhone.show();
                    break;
                case 2:
                    $scope.modalPic.show();
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
                    $scope.modalPhone.hide();
                    break;
                case 2:
                    $scope.modalPic.hide();
                    break;
                case 3:
                    $scope.modalImage.hide();
                    break;
            }
        };

        $scope.$on('$destroy', function() {
            $scope.modalName.remove();
            $scope.modalPhone.remove();
            $scope.modalPic.remove();
            $scope.modalImage.remove();
        });
    })

.controller("favoriteCtrl", function($scope, $http, $state, DataService, AccountService, $timeout, $ionicLoading, $ionicModal, $ionicHistory, $cordovaCamera, $ionicBackdrop) {
    $scope.$on('$ionicView.beforeEnter', function() {
        AccountService.checkLogin($scope, $state, $ionicHistory).then(function(data) {
            if (data == true) {
                DataService.getFavoriateRestaurant().then(function(resp_data) {
                    $scope.restaurants = DataService.favoriteRestaurants;
                }, function(err) {
                    ErrorService.popUp("unable to get favoriteRestaurants from server");
                });
            }
        }, function(error) {
            //error
        });
    });
})

.controller('MapCtrl', function($scope, $ionicLoading, $compile, DataService) {
    $scope.init = function() {
            $ionicLoading.show({
                content: 'Getting current location...',
                showBackdrop: false
            });
            var myLatlng = new google.maps.LatLng(43.07493, -89.381388);

            var mapOptions = {
                //center: myLatlng,
                zoom: 16,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(document.getElementById("map"),
                mapOptions);
            var contentString = [];
            var compiled = [];

            var infowindow = [];

            navigator.geolocation.getCurrentPosition(function(pos) {
                $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
                myLatlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                $ionicLoading.hide();
                DataService.getAllRestaurants()
                    .success(function(data) {

                        console.log(data);
                        var infoWindow = new google.maps.InfoWindow();
                        for (var i = 0; i < data.length; i++) {
                            if (DataService.calculate(pos.coords.latitude, pos.coords.longitude, data[i]) === true) {
                                contentString[i] = "<div style='height=100px;'><h3><a class='btn btn-link' href='#/tab/restaurant/" + data[i].id + "''>" + data[i].name + "<h3></a><p>" + data[i].address + "<p></div>";

                                var resLatLng = new google.maps.LatLng(data[i].position[0], data[i].position[1]);
                                var markers = new google.maps.Marker({
                                    position: resLatLng,
                                    map: $scope.map,
                                    infoWindowContent: contentString[i]
                                });
                                console.log(infowindow[i]);
                                google.maps.event.addListener(markers, 'click', function() {
                                    infoWindow.setContent(this.infoWindowContent);
                                    infoWindow.open($scope.map, this);
                                });

                            }
                        }
                    })
                    .error(function(error) {
                        ErrorService.popUp("unable to get restaurants data from server");
                    });
            }, function(error) {
                alert('Unable to get location: ' + error.message);
            });
            $scope.map = map;
        }
        //google.maps.event.addDomListener(window, 'load', initialize);

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
                title: 'Uluru (Ayers Rock)'
            });
        }, function(error) {
            alert('Unable to get location: ' + error.message);
        });
    };

    $scope.clickTest = function() {
        alert('Example of infowindow with ng-click')
    };

});