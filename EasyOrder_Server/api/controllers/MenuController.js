/**
 * MenuController
 *
 * @description :: Server-side logic for managing Menus
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    getDetail: function(req, res) {
        thisId = req.param('id');
        Menu.findOne({
                id: thisId
            })
            .populate('dishes')
            .exec(function findOneCB(err, found) {
                return res.send(found);
            });
    }
};