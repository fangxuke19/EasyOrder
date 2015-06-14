/**
 * ReservationController
 *
 * @description :: Server-side logic for managing Reservations
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	createReservation: function(req,res){
        var params = req.params.all();
        Reservation.create(params).exec(function createCB(err, created){
          console.log(created);
          Reservation.subscribe(req.socket,created,['create','destroy','update']);
          Reservation.publishCreate(created);
          return res.send(created);
        });

    }
};

