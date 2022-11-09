//-----------------------------------------------------------------------------------
// Fedics feedback form ViewModel
// Author: Thabiso Ntoi, 18 August 2015 (Derived from Intervate (Mark Goosen) ViewModel)
//-----------------------------------------------------------------------------------
var ViewModelRegistrationForm = function () {
    var self = this;
    var slm_LIST_RegistrationForm_Title  = "CSIRegistrationFormList";
    
    // constants
    self.api_feedbackquery_query = get_slm_URL_Intranet() + "/_api/web/lists/GetByTitle(\'" + slm_LIST_RegistrationForm_Title + "\')/items";
    self.api_feedbackquery_choicefield_query = get_slm_URL_Intranet() + "/_api/web/lists/GetByTitle(\'" + slm_LIST_RegistrationForm_Title + "\')/fields?$filter=EntityPropertyName eq '#choicefield'";
    self.text_invalid_firstname = "Please enter your firstname";
    self.text_invalid_surname = "Please enter your surname";
    self.text_invalid_CSIVolunteerType = "Please select the CSI initiative volunteer";
  
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
    self.department = ko.observable("");
    self.jobTitle = ko.observable("");
    self.jobGrade = ko.observable("");
    self.selectedVolunteer = ko.observable().extend({ required: self.text_invalid_CSIVolunteerType });    
    self.volunteerArray = ko.observableArray();
    
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

    ViewModelRegistrationForm.dataobjectChoice = dataobjectChoice;



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
            var filterVolunteerQuery = self.api_feedbackquery_choicefield_query.replace("#choicefield", "CSIVolunteer");
           
            $.when(
                self.spAJAXgetJSON(filterVolunteerQuery)
                .done(function (data) {
                    var choices = data.d.results[0].Choices.results;
                    $.each(choices, function (index, result) {
                        self.populateChoiceItem(result, self.volunteerArray);
                    });
                })
            );
        }
        catch (err) {
            console.log("Error: ViewModelFeedback.createRegistrationForm " + err);
        }
    }

    self.createRegistrationForm = function (firstName, surname, department, jobTitle, jobGrade, csiVolunteer) {
        
        var RegistrationForm = {
            "__metadata": { "type": "SP.Data.CSIRegistrationFormListListItem" },
            "Title": "",
            "FirstName": firstName,
            "Surname": surname,
            "Department": department,
            "jobTitle": jobTitle,
            "jobGrade": jobGrade,
            "CSIVolunteer": csiVolunteer
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
                data: JSON.stringify(RegistrationForm),
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
            console.log("Error: ViewModelRegistrationForm.createRegistrationForm " + err);
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
            console.log("Error->ViewModelRegistrationForm submit click: " + err);
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
            console.log("Error->ViewModelRegistrationForm.requiredEmail:: " + err);
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
            self.requiredField(self.selectedVolunteer(), self.selectedVolunteer, self.text_invalid_CSIVolunteerType);
          
            if (!self.firstName.invalid() && !self.surname.invalid() && !self.selectedVolunteer.invalid()) {
                self.loaded(false);
                self.createRegistrationForm(self.firstName(), self.surname(), self.department(), self.jobTitle(), self.jobGrade(), self.selectedVolunteer().ChoiceTitle());
            }
        }
        catch (err) {
            alert("Error->ViewModelRegistrationForm: submit click: " + err);
            console.log("Error->ViewModelRegistrationForm: submit click: " + err);
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
            console.log("Error->ViewModelRegistrationForm: retry click: " + err);
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
        var viewModelRegistrationForm = new ViewModelRegistrationForm();
        var viewModelRegistrationFormElement = document.getElementById("RegistrationForm");

        if (viewModelRegistrationFormElement) {
            ko.applyBindings(viewModelRegistrationForm, viewModelRegistrationFormElement);
            viewModelRegistrationForm.loadProfileData();
        }
    }
    catch (err) {
        console.log("Error->ViewModelRegistrationForm: Document ready / ApplyBindings: " + err);
    }
});