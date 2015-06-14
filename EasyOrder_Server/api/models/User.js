/**
 * User
 *
 * @module      :: Model
 * @description :: This is the base user model
 * @docs        :: http://waterlock.ninja/documentation
 */

module.exports = {

    attributes: require('waterlock').models.user.attributes({


        phoneNumber: {
            type: 'string',
            defaultsTo: '111-222-3333'
        },
        nickName: {
            type: 'string',
            defaultsTo: 'OtherMan'
        },
        photoUrl: {
            type: 'string',
            defaultsTo: 'defaultPhoto.jpg'
        },
        restaurant: {
            model: 'Restaurant',
            via: 'owner'
        },
        favoriteRestaurant: {
            collection: 'Restaurant',
            via: 'follower'
        }
    }),

    beforeCreate: require('waterlock').models.user.beforeCreate,
    beforeUpdate: require('waterlock').models.user.beforeUpdate
};