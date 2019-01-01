"use strict";

//ajax call to get all professionaldetails
function getProfDetails () {
    $.get("/getProfDetails", function (data, status) {
        $('#usernameCheck').hide();

        var usernames = JSON.parse(data);

        var usernameTyped = $('#username').val();

        for (var i = 0; i < usernames.length; i++) {
            if (usernameTyped == usernames[i].username) {
                $('#usernameCheck').show();
                break;
            }
        }

    });
}

//when document is ready, check changes to the selected professional field
$(document).ready(function () {

    $('#profId').change(getProfDetails);

});