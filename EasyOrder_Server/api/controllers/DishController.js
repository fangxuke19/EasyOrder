/**
 * DishController
 *
 * @description :: Server-side logic for managing dishes
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    createDish: function(req, res) {
        var id = req.param('owner');
        Dish.create({
            owner: id,
            name: 'default'
        }).exec(function createCB(err, created_dish) {
            return res.send(created_dish);
        });
    },
    addPic: function(req, res) {
        var id = req.param('id');
        var url = req.param("url");
        console.log(req.params.all());

        var msg = "succ";
        Dish.find(id).exec(function(err, r) {
            if (err) return res.send(err);
            if (r[0].image_urls == null) {
                r[0].image_urls = [];
            }
            r[0].image_urls.push(url);
            r[0].save(function(err) {

                msg = "err"
            });
            return res.send(msg);

        })
    }
};