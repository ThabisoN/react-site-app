//-----------------------------------------------------------------------------------
// Fedics feedback form ViewModel
// Author: Tanya Wilke, 08 June 2015 (Derived from Intervate (Mark Goosen) ViewModel)
//-----------------------------------------------------------------------------------
var ViewModelMeetingRoomBookings = function () {
    var self = this;
    var slm_LIST_MeetingRoomBookings_Title = "HOMeetingRoomBookingList";
    // constants
    self.api_feedbackquery_query = get_slm_URL_Intranet() + "/sites/Facilities/_api/web/lists/GetByTitle(\'" + slm_LIST_MeetingRoomBookings_Title + "\')/items";
    self.api_feedbackquery_choicefield_query = get_slm_URL_Intranet() + "/sites/Facilities/_api/web/lists/GetByTitle(\'" + slm_LIST_MeetingRoomBookings_Title + "\')/fields?$filter=EntityPropertyName eq '#choicefield'";
    self.text_invalid_firstname = "Please enter your firstname";
    self.text_invalid_surname = "Please enter your surname";
    self.text_invalid_email = "Please enter your email address";
    self.text_invalid_roomsType = "Please select the relevant room";
    self.text_invalid_guestnames = "Please enter your guest names";
    self.rex_email = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

    self.loaded = ko.observable(false);
    self.submitted = ko.observable(false);
    self.submitFailed = ko.observable(false);

    // Validation extension methods
    ko.extenders.required = function (target, message) {
        // add sub-observables
        target.invalid = ko.observable();
        target.invalidMessage = ko.observable("");

        function validate(newValue) {
            if (!self.loaded()) { return; }
            self.requiredField(newValue, target, message);
        }

        // initial validation
        validate(target());

        // validate whenever the value changes
        target.subscribe(validate);

        // return the original observable
        return target;
    };
    ko.extenders.validEmail = function (target, message) {
        // add sub-observables
        target.invalid = ko.observable();
        target.invalidMessage = ko.observable("");

        function validate(newValue) {
            if (!self.loaded()) { return; }
            self.requiredEmail(newValue, target, message);
        }

        // initial validation
        validate(target());

        // validate whenever the value changes
        target.subscribe(validate);

        // return the original observable
        return target;
    };

    self.firstName = ko.observable("").extend({ required: self.text_invalid_firstname });
    self.surname = ko.observable("").extend({ required: self.text_invalid_surname });
    self.email = ko.observable("").extend({ validEmail: self.text_invalid_email });
    self.telephone = ko.observable("");
    self.business = ko.observable("");
    self.department = ko.observable("");
    self.date = ko.observable("");
    self.time1 = ko.observable("");
    self.time2 = ko.observable("");
    self.selectedRooms = ko.observable().extend({ required: self.text_invalid_roomsType });    
    self.guestnames = ko.observable("").extend({ required: self.text_invalid_guestnames });

    self.roomsArray = ko.observableArray();
    //---------------------------------------------------------
    // Choice Data Object
    //---------------------------------------------------------
     var dataobjectChoice = (function () {
        function dataobjectChoice() {
            var self = this;
            self.ChoiceTitle = ko.observable();
        }

        return dataobjectChoice;
    })();

    ViewModelMeetingRoomBookings.dataobjectChoice = dataobjectChoice;



    //-----------------------------------------------------------------------
    // Filtered Notifications
    //----------------------------------------------------------------------- 
    self.showForm = ko.computed(function () {
        try {
            return !self.submitted() && !self.submitFailed() && self.loaded();
        } catch (err) {
            console.log("Error: ViewModelNotificationBoard.notificationArray: " + err);
        }

    });

    //-----------------------------------------------------------------------
    // SharePoint Get JSON via AJAX
    //-----------------------------------------------------------------------
    self.spAJAXgetJSON = function (query) {
        return $.ajax({
            url: query,
            dataType: "json",
            type: "GET",
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            }
        });
    };

    //-----------------------------------------------------------------------
    // Load data
    //-----------------------------------------------------------------------
    self.loadProfileData = function () {

        // read user profile properties (from cache if cached)
        var _profile = new slmUserProfileManager();
        var _result = _profile.GetMyPropertiesCached();
        _result.done(
            function (_result) {
                parser = new slmParser();

                self.firstName(parser.getValueFromKey(slm_User_Properties, "FirstName", ""));
                self.surname(parser.getValueFromKey(slm_User_Properties, "LastName", ""));
                self.email(parser.getValueFromKey(slm_User_Properties, "WorkEmail", ""));

                self.loaded(true);
                self.loadChoices();
            });
    };

    //-----------------------------------------------------------------------
    // Populate Choice Item
    //-----------------------------------------------------------------------
    self.populateChoiceItem = function (choice, carray) {
        try {
            obj = new dataobjectChoice();

            // map fields
            obj.ChoiceTitle(choice);

            carray.push(obj);
        } catch (err) {
            console.log("Error: ViewModelNotificationBoard.populateMappedItem: " + err);
        }
    }

    //-----------------------------------------------------------------------
    // Load data
    //-----------------------------------------------------------------------
    self.loadChoices = function () {
        try {
            var filterRoomsQuery = self.api_feedbackquery_choicefield_query.replace("#choicefield", "Rooms");
           
            $.when(
                self.spAJAXgetJSON(filterRoomsQuery)
                .done(function (data) {
                    var choices = data.d.results[0].Choices.results;
                    $.each(choices, function (index, result) {
                        self.populateChoiceItem(result, self.roomsArray);
                    });
                })
            );
        }
        catch (err) {
            console.log("Error: ViewModelFeedback.createMeetingRoomBookings " + err);
        }
    }

    self.createMeetingRoomBookings = function (firstName, surname, email, telephone, business, department, date, time1, time2, rooms, guestnames) {
        
        var MeetingRoomBookings = {
            "__metadata": { "type": "SP.Data.HOMeetingRoomBookingListListItem" },
            "Title": "",
            "FirstName": firstName,
            "Surname": surname,
            "Email": email,
            "ContactNumber": telephone,
            "BusinessUnit": business,
            "Department": department,
            "DateofMeeting": date,
            "StartTime": time1,
            "EndTime": time2,
            "Rooms": rooms,            
            "GuestsNames": guestnames
        };
        try {
            $.ajax({
                url: self.api_feedbackquery_query,
                dataType: "json",
                type: "POST",
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "content-type": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
                },
                data: JSON.stringify(MeetingRoomBookings),
                success: function (data) {
                    self.submitted(true);
                    self.loaded(true);
                },
                error: function (data) {
                    self.submitFailed(true);            
                    self.loaded(true);
                 }
            });
        }
        catch (err) {
            console.log("Error: ViewModelMeetingRoomBookings.createMeetingRoomBookings " + err);
        }

    }

    //-----------------------------------------------------------------------
    // Validate required field
    //-----------------------------------------------------------------------
    self.requiredField = function (newValue, obObj, message) {
        try {
            var invalid = (newValue ? false : true);
            obObj.invalid(invalid);
            obObj.invalidMessage(invalid ? message : "");
        }
        catch (err) {
            console.log("Error->ViewModelMeetingRoomBookings: submit click: " + err);
        }
    }

    //-----------------------------------------------------------------------
    // Validate email field
    //-----------------------------------------------------------------------
    self.requiredEmail = function (newValue, obObj, message) {
        try {
            // re validate controls                 
            var invalid = (newValue ? false : true) || !self.rex_email.test(newValue);
            obObj.invalid(invalid);
            obObj.invalidMessage(invalid ? message : "");
        }
        catch (err) {
            console.log("Error->ViewModelMeetingRoomBookings.requiredEmail:: " + err);
        }
    }


    //-----------------------------------------------------------------------
    // CLICK EVENT - button submit click
    //-----------------------------------------------------------------------
    self.submitClick = function () {
        try {

            // re-validate controls  
            self.requiredField(self.firstName(), self.firstName, self.text_invalid_firstname);
            self.requiredField(self.surname(), self.surname, self.text_invalid_surname);
            self.requiredEmail(self.email(), self.email, self.text_invalid_email);
            self.requiredField(self.selectedRooms(), self.selectedRooms, self.text_invalid_roomsType);
            self.requiredField(self.guestnames(), self.guestnames, self.text_invalid_guestnames);

            if (!self.firstName.invalid() && !self.surname.invalid() && !self.email.invalid() && !self.selectedRooms.invalid() && !self.guestnames.invalid()) {
                self.loaded(false);
                self.createMeetingRoomBookings(self.firstName(), self.surname(), self.email(), self.telephone(), self.business(), self.department(), self.date(), self.time1(), self.time2(), self.selectedRooms().ChoiceTitle(), self.guestnames());
            }
        }
        catch (err) {
            alert("Error->ViewModelMeetingRoomBookings: submit click: " + err);
            console.log("Error->ViewModelMeetingRoomBookings: submit click: " + err);
        }

        return false;
    }


    //-----------------------------------------------------------------------
    // CLICK EVENT - button retry click
    //-----------------------------------------------------------------------
    self.retryClick = function () {
        try {
            self.submitted(false);
            self.submitFailed(false);
        }
        catch (err) {
            console.log("Error->viewModelMeetingRoomBookings: retry click: " + err);
        }

        return false;
    }

};

//-----------------------------------------------------------------------
// Document ready on SharePoint libraries loaded
//-----------------------------------------------------------------------
// make sure clientcontext is available before loading
SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {
    try {
        // create model and manual bind
        var viewModelMeetingRoomBookings = new ViewModelMeetingRoomBookings();
        var viewModelMeetingRoomBookingsElement = document.getElementById("MeetingRoomBookingsForm");

        if (viewModelMeetingRoomBookingsElement) {
            ko.applyBindings(viewModelMeetingRoomBookings, viewModelMeetingRoomBookingsElement);
            viewModelMeetingRoomBookings.loadProfileData();
        }
    }
    catch (err) {
        console.log("Error->ViewModelMeetingRoomBookings: Document ready / ApplyBindings: " + err);
    }
});