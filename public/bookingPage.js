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

//when document is ready, check changes to the selected professional field
$(document).ready(function () {

    professionalId = $('#profId').val();

    getProfDetails(professionalId);

    $('#profId').change(function () {
        professionalId = $('#profId').val();
        getProfDetails(professionalId);
    });
});
