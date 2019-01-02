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
        if (profBookings) {
            var bookingsDisplay = $('#profBookings');
            bookingsDisplay.empty();
            var profBookingsTable = '<table class="table table-striped table-responsive"> ' + 
            '<thead> <tr> <th>Name</th> <th>Date</th> <th>Time</th> <th>Location</th> </tr> ' + 
            '</thead> <tbody>';
            for (var i = 0; i < profBookings.length; i++) {
                profBookingsTable += '<tr> ' +
                '<td><a href="/editBooking/' + profBookings[i].bookingId + '">' + profBookings[i].fname + ' ' + profBookings[i].lname + ' </a></td> ' +
                '<td>' + profBookings[i].bookingDate + '</td>' +
                '<td>' + profBookings[i].bookingTime + '</td>' +
                '<td>' + profBookings[i].location + '</td>' +
                '</tr>'; 
            }
            profBookingsTable += '</tbody> </table>';
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
