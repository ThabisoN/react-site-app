//-----------------------------------------------------------------------------------
// Fedics feedback form ViewModel
// Author: Tanya Wilke, 08 June 2015 (Derived from Intervate (Mark Goosen) ViewModel)
//-----------------------------------------------------------------------------------
var ViewModelFedicsMenuFeedback = function () {
    var self = this;
    var slm_LIST_FedicsMenuFeedback_Title = "FedicsMenuFeedback";
    // constants
    self.api_feedbackquery_query = slm_URL_Intranet + "/convenience/_api/web/lists/GetByTitle(\'" + slm_LIST_FedicsMenuFeedback_Title + "\')/items";
    self.api_feedbackquery_choicefield_query = slm_URL_Intranet + "/convenience/_api/web/lists/GetByTitle(\'" + slm_LIST_FedicsMenuFeedback_Title + "\')/fields?$filter=EntityPropertyName eq '#choicefield'";
    self.text_invalid_firstname = "Please enter your firstname";
    self.text_invalid_surname = "Please enter your surname";
    self.text_invalid_email = "Please enter your email address";
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
    self.selectedFunctionDelivered = ko.observable();
    self.selectedProductDelivered = ko.observable();
    self.selectedFriendlyStaff = ko.observable();
    self.selectedRegularBookings = ko.observable();
    self.selectedGoodsCollected = ko.observable();
    self.comment = ko.observable("");
    self.functiondate = ko.observable("");
    self.venue = ko.observable("");
    self.waiter = ko.observable("");

    self.functionDeliveredArray = ko.observableArray();
    self.productDeliveredArray = ko.observableArray();
    self.friendlyStaffArray = ko.observableArray();
    self.regularBookingsArray = ko.observableArray();
    self.goodsCollectedArray = ko.observableArray();

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

    ViewModelFedicsMenuFeedback.dataobjectChoice = dataobjectChoice;



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

                self.loadChoices();
                self.loaded(true);
            });
    };

    //-----------------------------------------------------------------------
    // Load data
    //-----------------------------------------------------------------------
    self.loadChoices = function () {
        try {
            var filterFunctionDeliveredQuery = self.api_feedbackquery_choicefield_query.replace("#choicefield", "FunctionDelivered");
            var filterProductDeliveredQuery = self.api_feedbackquery_choicefield_query.replace("#choicefield", "ProductDelivered");
            var filterFriendlyStaffQuery = self.api_feedbackquery_choicefield_query.replace("#choicefield", "FriendlyStaff");
            var filterRegularBookingsQuery = self.api_feedbackquery_choicefield_query.replace("#choicefield", "RegularBookings");
            var filterGoodsCollectedQuery = self.api_feedbackquery_choicefield_query.replace("#choicefield", "DirtyGoodsCollected");
            $.when(
                self.spAJAXgetJSON(filterFunctionDeliveredQuery)
                .done(function(data) {
                    var choices = data.d.results[0].Choices.results;
                    $.each(choices, function(index, result) {
                        self.populateChoiceItem(result, self.functionDeliveredArray);
                    });
                })
            );
            $.when(
                self.spAJAXgetJSON(filterProductDeliveredQuery)
                .done(function (data) {
                    var choices = data.d.results[0].Choices.results;
                    $.each(choices, function (index, result) {
                        self.populateChoiceItem(result, self.productDeliveredArray);
                    });
                })
            );
            $.when(
                self.spAJAXgetJSON(filterFriendlyStaffQuery)
                .done(function(data) {
                    var choices = data.d.results[0].Choices.results;
                    $.each(choices, function(index, result) {
                        self.populateChoiceItem(result, self.friendlyStaffArray);
                    });
                })
            );
            $.when(
                self.spAJAXgetJSON(filterRegularBookingsQuery)
                .done(function (data) {
                    var choices = data.d.results[0].Choices.results;
                    $.each(choices, function (index, result) {
                        self.populateChoiceItem(result, self.regularBookingsArray);
                    });
                })
            );
            $.when(
                self.spAJAXgetJSON(filterGoodsCollectedQuery)
                .done(function (data) {
                    var choices = data.d.results[0].Choices.results;
                    $.each(choices, function (index, result) {
                        self.populateChoiceItem(result, self.goodsCollectedArray);
                    });
                })
            );

        }
        catch (err) {
            console.log("Error: ViewModelFeedback.createFedicsMenuFeedback " + err);
        }

    }

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
    self.createFedicsMenuFeedback = function (fname, sname, email, telephone, business, department, selectedFunctionDelivered, selectedProductDelivered, selectedFriendlyStaff, selectedRegularBookings, selectedGoodsCollected, comment, functiondate, venue, waiter) {
        var fedicsMenuFeedback = {
            "__metadata": { "type": "SP.Data.FedicsMenuFeedbackListItem" },
            "Title": "",
            "Name": fname,
            "Surname": sname,
            "Email": email,
            "Telephone": telephone,
            "Business": business,
            "Department": department,
            "FunctionDelivered": selectedFunctionDelivered,
            "ProductDelivered": selectedProductDelivered,
            "FriendlyStaff": selectedFriendlyStaff,
            "RegularBookings": selectedRegularBookings,
            "DirtyGoodsCollected": selectedGoodsCollected,
            "Comments": comment,
            "FunctionDate": functiondate,
            "Venue":venue,
            "Waiter": waiter
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
                data: JSON.stringify(fedicsMenuFeedback),
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
            console.log("Error: viewModelFedicsMenuFeedback.createFedicsMenuFeedback " + err);
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
            console.log("Error->ViewModelFedicsMenuFeedback: submit click: " + err);
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
            console.log("Error->ViewModelFedicsMenuFeedback.requiredEmail:: " + err);
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
            
            if (!self.firstName.invalid() && !self.surname.invalid() && !self.email.invalid()) {
                self.loaded(false);
                self.createFedicsMenuFeedback(self.firstName(), self.surname(), self.email(), self.telephone(), self.business(), self.department(), self.selectedFunctionDelivered().ChoiceTitle(), self.selectedProductDelivered().ChoiceTitle(), self.selectedFriendlyStaff().ChoiceTitle(), self.selectedRegularBookings().ChoiceTitle(), self.selectedGoodsCollected().ChoiceTitle(), self.comment(), self.functiondate(), self.venue(), self.waiter());
            }
        }
        catch (err) {
            console.log("Error->ViewModelFedicsMenuFeedback: submit click: " + err);
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
            console.log("Error->viewModelFedicsMenuFeedback: retry click: " + err);
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
        var viewModelFedicsMenuFeedback = new ViewModelFedicsMenuFeedback();
        var viewModelFedicsMenuFeedbackElement = document.getElementById("fedicsMenuFeedbackForm");

        if (viewModelFedicsMenuFeedbackElement) {
            ko.applyBindings(viewModelFedicsMenuFeedback, viewModelFedicsMenuFeedbackElement);
            viewModelFedicsMenuFeedback.loadProfileData();
        }
    }
    catch (err) {
        console.log("Error->ViewModelFedicsMenuFeedback: Document ready / ApplyBindings: " + err);
    }
});