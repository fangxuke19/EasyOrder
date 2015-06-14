/**
 * RestaurantController
 *
 * @description :: Server-side logic for managing restaurants
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var qr = require('qr-image');
module.exports = {
    getAll: function(req, res) {
        var xx;
        Restaurant.find().exec(function(err, found) {
            return res.send(found);
        });
    },
    getQRcode: function(req, res) {
        id = req.param('id');
        console.log("getQRcode");
        var text = id;
        var img = qr.image(text);
        res.writeHead(200, {
            'Content-Type': 'image/png'
        });
        img.pipe(res);
    },
    authSession: function(req, res) {
        return res.send("session got it");
    },
    token: function(req, res) {
        return res.send(" token got it");
    },
    getDetailAll: function(req, res) {
        thisId = req.param('id');
        Restaurant.findOne({
                id: thisId
            })
            .populateAll()
            .exec(function findOneCB(err, found) {
                return res.send(found);
            });
    },
    createRestaurant: function(req, res) {
        var owner = req.param('owner');
        Restaurant.create({
            owner: owner
        }).exec(function createCB(err, created_restaurant) {
            Menu.create({
                owner: created_restaurant.id
            }).exec(function createCB(err, created_menu) {
                User.update({
                    id: owner
                }, {
                    restaurant: created_restaurant.id
                }).exec(function updateCB(err, updated_user) {
                    Restaurant.update({
                        id: created_restaurant.id
                    }, {
                        menu: created_menu.id
                    }).exec(function updateCB(err, updated) {
                        return res.send({
                            user: updated_user[0],
                            restaurant: updated[0]
                        });
                    });
                });

            });
        });
    },
    getRestaurant: function(req, res) {
        var owner = req.param('uid');
        var id = req.param('rid');
        if (id) {

        }
    }
};