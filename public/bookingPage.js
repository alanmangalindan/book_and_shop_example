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

            // create new element to include in bookingsDisplay table
            var profBookingsTable = '<table class="table table-striped table-responsive"> ' +
                '<thead> <tr> <th>Name</th> <th>Date</th> <th>Time</th> <th>Location</th> <th></th> </tr> ' +
                '</thead> <tbody>';
            for (var i = 0; i < profBookings.length; i++) {
                profBookingsTable += '<tr> ' +
                    '<td>' + profBookings[i].fname + ' ' + profBookings[i].lname + '</td> ' +
                    '<td>' + profBookings[i].bookingDate + '</td>' +
                    '<td>' + profBookings[i].bookingTime + '</td>' +
                    '<td>' + profBookings[i].location + '</td>' +
                    '<td><button type="button" class="btn btn-primary" data-toggle="modal" data-target="#profDetailBooking-' + profBookings[i].bookingId + '">View</button></td>' +
                    '</tr>';
            }
            profBookingsTable += '</tbody> </table>';
            for (var j = 0; j < profBookings.length; j++) {
                profBookingsTable +=
                    '<div class="modal fade" id="profDetailBooking-' + profBookings[j].bookingId + '" tabindex="-1" role="dialog" aria-labelledby="ModalLabel" aria-hidden="true"> ' +
                        '<div class="modal-dialog" role="document"> ' +
                            '<div class="modal-content"> ' +
                                '<div class="modal-header"> ' +
                                    '<h5 class="modal-title" id="ModalLabel">Booking Detail</h5> ' +
                                    '<button type="button" class="close" data-dismiss="modal" aria-label="Close"> ' +
                                        '<span aria-hidden="true">&times;</span> ' +
                                    '</button> ' +
                                '</div> ' +
                                '<form method="POST"> ' +
                                    '<div class="modal-body"> ' +
                                        '<table class="table table-striped table-responsive"> ' +
                                            '<thead> ' +
                                                '<tr> ' +
                                                    '<th>Name</th> ' +
                                                    '<th>Date</th> ' +
                                                    '<th>Time</th> ' +
                                                    '<th>Location</th> ' +
                                                    '<th>Notes</th> ' +
                                                '</tr> ' +
                                            '</thead> ' +
                                            '<tbody> ' +
                                                '<tr> ' +
                                                '<td>' + profBookings[j].fname + ' ' + profBookings[j].lname + '</td> ' +
                                                '<td>' + profBookings[j].bookingDate + '</td>' +
                                                '<td>' + profBookings[j].bookingTime + '</td>' +
                                                '<td>' + profBookings[j].location + '</td>' +
                                                '<td><textarea id="updatedNotes" class="form-control" name="updatedNotes">' + profBookings[j].notes + '</textarea></td> ' +
                            '</tr> ' +
                        '</tbody> ' +
                    '</table> ' +
                '</div> ' +
                                '<div class="modal-footer"> ' +
                                    '<input type="hidden" name="bookingId" value="' + profBookings[j].bookingId + '"> ' +
                                        '<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button> ' +
                                        '<button type="submit" class="btn btn-primary" formaction="/updateNotes">Update Notes</button> ' +
                                        '<button type="submit" class="btn btn-danger" formaction="/deleteBooking">Delete</button> ' +
                '</div> ' +
            '</form> ' +
                            '</div> ' +
                        '</div> ' +
                    '</div> ';
            }
            console.log(profBookingsTable);
            bookingsDisplay.append(profBookingsTable);
        }
    });
}

//ajax call to pre-check selected booking date and time for the selected professional
function preCheckBooking(professionalId, selectedDate, selectedTime) {
    $.get("/getProfBookings/" + professionalId, function (data, status) {
        var profDetails = JSON.parse(data);
        var matchedDate = profDetails.find(function (d) {
            if (d.bookingDate = selectedDate) {
                return true;
            } else {
                return false;
            }
        });
        var matchedTime = profDetails.find(function (t) {
            if (t.bookingTime = selectedTime) {
                return true;
            } else {
                return false;
            }
        });
        if (matchedDate && matchedTime) {
            $('#bookAppointment').attr("disabled");
        }
    });
}

//when document is ready, check changes to the selected professional field
$(document).ready(function () {

    var selectedDate;
    var selectedTime;

    professionalId = $('#profId').val();

    getProfDetails(professionalId);
    getProfBookings(professionalId);

    $('#profId').change(function () {
        professionalId = $('#profId').val();
        getProfDetails(professionalId);
        getProfBookings(professionalId);
    });

    $('#date').change(function () {
        $('#bookAppointment').removeAttr("disabled");
        professionalId = $('#profId').val();
        selectedDate = $('#date').val();
        selectedTime = $('#time').val();
        preCheckBooking(professionalId, selectedDate, selectedTime);
    })
});
