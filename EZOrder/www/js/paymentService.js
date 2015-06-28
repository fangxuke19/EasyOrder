angular.module('starter.paymentService', [])

.factory('payment', function($http, $ionicHistory, $q, CONFIG, LocalStorage, AccountService) {
    var payment = {};
    payment.charge = function(channel, amount) {
        var charge = {};
        charge.user = AccountService.user.id;
        charge.channel = channel;
        charge.amount = amount;
        return $http.post(CONFIG.serverUrl + '/payment/charge', charge, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(
            function(resp) {
                console.log("success");
                console.log(resp.data);
                return resp.data;
            },
            function(err) {
                console.log(err);
                return err;
            }
        );

    }

    return payment;
});
