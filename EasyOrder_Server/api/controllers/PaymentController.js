/**
 * PaymentController
 *
 * @description :: Server-side logic for managing payments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    charge: function(req, res) {
        var pingpp = require('pingpp')('sk_test_LafHu9azrbr5CiTSOGy9Cu50');
        // pingpp.parseHeaders(/*headers*/); // 把从客户端传上来的 Headers 传到这里
        var channel = req.param('channel');
        var amount = parseInt(req.param('amount'));
        console.log(req.params.all());
        // var extra = {
        //     'success_url': 'http://127.0.0.1:8100/#/tab/cart/checkout/success',
        //     'cancel_url': 'http://127.0.0.1:8100/#/tab/cart/checkout/cancel'
        // };

        var extra = {};
        switch (channel) {
            case 'alipay_wap':
                extra = {
                    'success_url': 'http://127.0.0.1:8100/#/tab/cart/checkout/success',
                    'cancel_url': 'http://127.0.0.1:8100/#/tab/cart/checkout/cancel'
                };
                break;
            case 'upacp_wap':
                extra = {
                    'result_url': 'http://127.0.0.1:8100/#/tab/cart/checkout/success'
                };
                break;
        }


        var crypto = require('crypto');
        var order_no = crypto.createHash('md5')
            .update(new Date().getTime().toString())
            .digest('hex').substr(0, 16);
        pingpp.charges.create({
            order_no: order_no,
            app: {
                id: "app_5yj9yHTKSizP8mvP"
            },
            channel: channel,
            amount: amount,
            client_ip: "127.0.0.1",
            currency: "cny",
            subject: "test",
            body: "charge",
            extra: extra
        }, function(err, charge) {
            if (err) {
                console.log(err);
                res.badRequest(err);
            } else {
                console.log(charge);
                res.ok(charge);
            }

        });
    }

}
