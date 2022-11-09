//---------------------------------------------------------------------------
// User Feedback form ViewModel
// Author: Mark Goosen, 01 June 2015
//---------------------------------------------------------------------------
var ViewModelFeedback = function () {
    var self = this;

    // constants
    self.api_contextinfo_query = get_slm_URL_Intranet() + "/_api/contextinfo";
    self.api_feedbackquery_query = get_slm_URL_Intranet() + "/_api/web/lists/GetByTitle(\'" + slm_LIST_UserFeedback_Title + "\')/items";
    self.api_feedbackquery_choicefield_query = get_slm_URL_Intranet() + "/_api/web/lists/GetByTitle(\'" + slm_LIST_UserFeedback_Title + "\')/fields?$filter=EntityPropertyName eq '#choicefield'";
    self.text_invalid_firstname = "Please enter your firstname";
    self.text_invalid_surname = "Please enter your surname";
    self.text_invalid_email = "Please enter your email address";
    self.text_invalid_feedbackType = "Please select your feedback type";
    self.text_invalid_userType = "Please select what type of user you are";
    self.text_invalid_comment = "Please enter your comments";
    self.rex_email = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

    self.loaded = ko.observable(false);
    self.submitted = ko.observable(false);
    self.submitFailed = ko.observable(false);

    self.source = null;

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
    self.selectedType = ko.observable().extend({ required: self.text_invalid_feedbackType });
    self.selectedUserType = ko.observable().extend({ required: self.text_invalid_userType });
    self.comment = ko.observable("").extend({ required: self.text_invalid_comment });
    self.typeArray = ko.observableArray();
    self.userTypeArray = ko.observableArray();


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

    ViewModelFeedback.dataobjectChoice = dataobjectChoice;



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
            var filterTypeQuery = self.api_feedbackquery_choicefield_query.replace("#choicefield", "FeedbackType");
            var filterUserTypeQuery = self.api_feedbackquery_choicefield_query.replace("#choicefield", "FeedbackUserType");
            $.when(
                self.spAJAXgetJSON(filterTypeQuery)
                .done(function (data) {
                    var choices = data.d.results[0].Choices.results;
                    $.each(choices, function (index, result) {
                        self.populateChoiceItem(result, self.typeArray);
                    });
                }))
            .always(function () {
                self.spAJAXgetJSON(filterUserTypeQuery)
                .done(function (data) {
                    var choices = data.d.results[0].Choices.results;
                    $.each(choices, function (index, result) {
                        self.populateChoiceItem(result, self.userTypeArray);
                    });
                });
                
            });

        }
        catch (err) {
            console.log("Error: ViewModelFeedback.createFeedback " + err);
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
    // Create the Feedback list item
    //-----------------------------------------------------------------------
    self.createFeedback = function (fname, sname, email, ftype, fusertype, fcomments, fsource) {
        var feedback = {
            "__metadata": { "type": "SP.Data.UserFeedbackListItem" },
            "Title": "",
            "FeedbackName": fname,
            "FeedbackSurname": sname,
            "FeedbackEmail": email,
            "FeedbackType": ftype,
            "FeedbackUserType": fusertype,
            "FeedbackComments": fcomments,
            "FeedbackSource": {
                "__metadata": { "type": "SP.FieldUrlValue" },
                "Description": fsource,
                "Url": fsource

            }
        };
        try {
            $.when(
                $.ajax({
                    url: self.api_contextinfo_query,
                    dataType: "json",
                    type: "POST",
                    headers: { "Accept": "application/json;odata=verbose" }
                })
                .done(function (data) {
                    self.requestDigest = data.d.GetContextWebInformation.FormDigestValue;
                }))
            .always(function () {
                $.ajax({
                    url: self.api_feedbackquery_query,
                    dataType: "json",
                    jsonp: false,
                    type: "POST",
                    headers: {
                        "Accept": "application/json;odata=verbose",
                        "content-type": "application/json;odata=verbose",
                        "X-RequestDigest": self.requestDigest
                    },
                    data: JSON.stringify(feedback),
                    success: function (data) {
                        self.submitted(true);
                        self.loaded(true);

                    },
                    error: function (data) {
                        self.submitFailed(true);
                        self.loaded(true);
                        console.log("Error: ViewModelFeedback.createFeedback -> POST: " + data.responseJSON.error.message.value);
                    }
                });
            });
        }
        catch (err) {
            console.log("Error: ViewModelFeedback.createFeedback " + err);
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
            console.log("Error->ViewModelFeedback: submit click: " + err);
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
            console.log("Error->ViewModelFeedback.requiredEmail:: " + err);
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
            self.requiredField(self.selectedType(), self.selectedType, self.text_invalid_feedbackType);
            self.requiredField(self.selectedUserType(), self.selectedUserType, self.text_invalid_userType);
            self.requiredField(self.comment(), self.comment, self.text_invalid_comment);

            if (!self.source) {
                self.source = window.location.href.toLowerCase();
            }

            if (!self.firstName.invalid() && !self.surname.invalid() && !self.email.invalid() && !self.selectedType.invalid() && !self.selectedUserType.invalid() && !self.comment.invalid()) {
                self.loaded(false);
                self.createFeedback(self.firstName(), self.surname(), self.email(), self.selectedType().ChoiceTitle(), self.selectedUserType().ChoiceTitle(), self.comment(), self.source);
            }
        }
        catch (err) {
            console.log("Error->ViewModelFeedback: submit click: " + err);
        }

        return false;
    }


    //-----------------------------------------------------------------------
    // CLICK EVENT - button retry click
    //-----------------------------------------------------------------------
    self.retryClick = function () {
        try {

            if (!self.submitFailed()) {
                self.loaded(false);
                self.selectedType(null);
                self.selectedUserType(null);
                self.comment("");
                self.loaded(true);
            }
            self.submitted(false);
            self.submitFailed(false);
        }
        catch (err) {
            console.log("Error->ViewModelFeedback: retry click: " + err);
        }

        return false;
    }

    //-----------------------------------------------------------------------
    // CLICK EVENT - button close click
    //-----------------------------------------------------------------------
    self.closeClick = function () {
        try {

            window.close();
        }
        catch (err) {
            console.log("Error->ViewModelFeedback: close click: " + err);
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

        var currentUrl = window.location.href.toLowerCase();
        if (currentUrl.indexOf(get_slm_URL_Intranet()) > -1) {
            // create model and manual bind
            var viewModelFeedback = new ViewModelFeedback();
            var viewModelFeedbackElement = document.getElementById("feedbackModal");

            if (currentUrl.indexOf("feedback.aspx") > -1) {
                viewModelFeedbackElement = document.getElementById("feedbackPage");

                // Hide links to the feedback form on the feedback page
                $('#feedbackFooterLink').hide();
                $('.backBtn').hide();
                $('.utility-icons').hide();

                // Get the source of the feedback, if on feedback page
                if (QueryParam.source) {
                    viewModelFeedback.source = decodeURIComponent(QueryParam.source);
                }
            }

            if (viewModelFeedbackElement) {
                ko.applyBindings(viewModelFeedback, viewModelFeedbackElement);
                viewModelFeedback.loadProfileData();
            }
        } else {

            //-----------------------------------------------------------------------
            // CLICK EVENT - redirect feedback click
            //-----------------------------------------------------------------------
            function feedbackClick() {
                try {
                    window.open(get_slm_URL_Intranet() + "/pages/feedback.aspx?source=" + encodeURIComponent(currentUrl));
                }
                catch (err) {
                    console.log("Error->ViewModelFeedback: feedback click: " + err);
                }

                return false;
            }

            $(".feedback > A").click(feedbackClick);
            var footerLink = $('#feedbackFooterLink');
            footerLink.click(feedbackClick);
            footerLink.attr("data-toggle", "");
            footerLink.attr("data-target", "");
        }
    }
    catch (err) {
        console.log("Error->ViewModelFeedback: Document ready / ApplyBindings: " + err);
    }
});