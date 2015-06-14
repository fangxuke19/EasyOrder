/**
 * OrderController
 *
 * @description :: Server-side logic for managing Orders
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    listenOrder: function(req, res) {

        var rid = req.param('rid');
        if (req.isSocket && req.method == 'GET') {
            // subscribe client to model changes 
            Order.watch(req);
            Reservation.watch(req);
            console.log('rid'+rid+';  User subscribed to ' + req.socket.id);
            return res.send("succ");
        }
        return res.send();
    },
    createOrder: function(req,res){
        var params = req.params.all();
        Order.create(params).exec(function createCB(err, created){
          console.log(created);
          Order.subscribe(req.socket,created,['create','destroy','update']);
          Order.publishCreate(created);
          return res.send(created);
        });

    }

};