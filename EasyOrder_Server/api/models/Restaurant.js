/**
 * Restaurant.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    attributes: {
        name: {
            type: 'string'
        },
        description: {
            type: 'string'
        },
        menu: {
            model: 'Menu',
            via: 'owner'
        },
        owner: {
            model: 'User',
            via: 'restaurant'
        },
        position: {
            type: 'array'
        },
        address: {
            type: 'string'
        },
        follower: {
            collection: 'User',
            via: 'favoriteRestaurant'
        }
    }
};