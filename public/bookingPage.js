"use strict";

var professionalId;

//ajax call to get all professional details
function getProfDetails(professionalId) {
    $.get("/getProfDetails/" + professionalId, function (data, status) {
        var profDetails = JSON.parse(data);
        $('#location').val(profDetails.location);
        $('#specialty').val(profDetails.specialty);
    });
}

function getProfBookings(professionalId) {
    $.get("/getProfBookings/" + professionalId, function (data, status) {
        var profBookings = JSON.parse(data);
        console.log(profBookings);
        if (profBookings) {
            var bookingsDisplay = $('#profBookings');
            bookingsDisplay.empty();
            var profBookingsTable = '<table class="table table-striped table-responsive"> ' + 
            '<thead> <tr> <th>Name</th> <th>Date</th> <th>Time</th> <th>Location</th> <th></th> </tr> ' + 
            '</thead> <tbody>';
            for (var i = 0; i < profBookings.length; i++) {
                profBookingsTable += '<tr> ' +
                '<td>' + profBookings[i].fname + ' ' + profBookings[i].lname + '</td> ' +
                '<td>' + profBookings[i].bookingDate + '</td>' +
                '<td>' + profBookings[i].bookingTime + '</td>' +
                '<td>' + profBookings[i].location + '</td>' +
                '<td><button type="button" class="btn btn-primary" data-toggle="modal" data-target="#booking-"' + profBookings[i].bookingId + '>View</button></td>' +
                '</tr>'; 
            }
            profBookingsTable += '</tbody> </table>';
            console.log(profBookingsTable);
            bookingsDisplay.append(profBookingsTable);
        }
    });
}

//when document is ready, check changes to the selected professional field
$(document).ready(function () {

    professionalId = $('#profId').val();

    getProfDetails(professionalId);
    getProfBookings(professionalId);

    $('#profId').change(function () {
        professionalId = $('#profId').val();
        getProfDetails(professionalId);
        getProfBookings(professionalId);
    });
});
