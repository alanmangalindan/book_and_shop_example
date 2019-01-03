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
            bookingsDisplay.append(profBookingsTable);
        }
    });
}

//ajax call to pre-check selected booking date and time for the selected professional
function preCheckBooking(professionalId, selectedDate, selectedTime) {
    $.get("/getProfBookings/" + professionalId, function (data, status) {
        var profDetails = JSON.parse(data);
        var matchedDate = profDetails.find(function (d) {
            return d.bookingDate == selectedDate;
        });
        if (matchedDate) {
            if (matchedDate.bookingTime == selectedTime) {
                $('#bookAppointment').attr("disabled", "disabled");
                $('#bookingExists').show();
            }
        }
    });
}

//when document is ready, check changes to the selected professional field
$(document).ready(function () {

    $('#bookingExists').hide();

    // pre-populate date field with today's date (from https://stackoverflow.com/questions/23593052/format-javascript-date-to-yyyy-mm-dd)
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    var todaysDate = [year, month, day].join('-');
    console.log(todaysDate);
    $('#date').val(todaysDate);

    professionalId = $('#profId').val();
    var selectedDate = $('#date').val();
    var selectedTime = $('#time').val();

    getProfDetails(professionalId);
    getProfBookings(professionalId);
    preCheckBooking(professionalId, selectedDate, selectedTime);

    $('#profId').change(function () {
        $('#bookAppointment').removeAttr("disabled");
        $('#bookingExists').hide();
        professionalId = $('#profId').val();
        selectedDate = $('#date').val();
        selectedTime = $('#time').val();
        getProfDetails(professionalId);
        getProfBookings(professionalId);
        preCheckBooking(professionalId, selectedDate, selectedTime);
    });

    $('#date').change(function () {
        $('#bookAppointment').removeAttr("disabled");
        $('#bookingExists').hide();
        professionalId = $('#profId').val();
        selectedDate = $('#date').val();
        selectedTime = $('#time').val();
        preCheckBooking(professionalId, selectedDate, selectedTime);
    });

    $('#time').change(function () {
        $('#bookAppointment').removeAttr("disabled");
        $('#bookingExists').hide();
        professionalId = $('#profId').val();
        selectedDate = $('#date').val();
        selectedTime = $('#time').val();
        preCheckBooking(professionalId, selectedDate, selectedTime);
    });

});
