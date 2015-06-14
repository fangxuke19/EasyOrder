/**
 * UserController.js 
 * 
 * @module      :: Controller
 * @description :: Provides the base user
 *                 actions used to make waterlock work.
 *                 
 * @docs        :: http://waterlock.ninja/documentation
 */

module.exports = require('waterlock').actions.user({
    me: function(req, res) {
        console.log(req.session.user);
        return res.send(req.session.user);
    },
    addToFavorite: function(req, res) {
        var user = req.param('user');
        var rest = req.param('restaurant');
        console.log(req.params.all());
        User.find({
            id: user
        }).exec(function(err, r) {
            if (err) return res.send("err");
            r[0].favoriteRestaurant.add(rest);
            var msg = "succ";
            r[0].save(function(err) {
                msg = "err";
            });
            return res.send(msg);
        });
    },
    deleteFromFavorite: function(req, res) {
        var user = req.param('user');
        var rest = req.param('restaurant');
        console.log(req.params.all());
        User.find({
            id: user
        }).exec(function(err, r) {
            if (err) return res.send("err");
            r[0].favoriteRestaurant.remove(rest);
            var msg = "succ";
            r[0].save(function(err) {
                msg = "err";
            });
            return res.send(msg);
        });
    },
    getFavorite: function(req, res) {
        var user = req.param('user');
        console.log(req.params.all());
        User.find({
            id: user
        }).populate('favoriteRestaurant').exec(function(err, r) {
            if (err) return res.send("err");
            console.log(r);
            return res.send(r);
        });
    },
    isFavorite: function(req, res) {
        var user = parseInt(req.param('user'));
        var rest = parseInt(req.param('restaurant'));
        User.find({
            id: user
        }).populate('favoriteRestaurant', {
            id: rest
        }).exec(function(err, r) {
            if (err) return res.send("err");
            console.log(r);
            console.log(r[0].favoriteRestaurant.length);
            if (r[0].favoriteRestaurant.length > 0)
                return res.send("succ");
            else
                return res.send("fail");
        })
    }
});