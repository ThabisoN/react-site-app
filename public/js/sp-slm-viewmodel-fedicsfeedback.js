//-----------------------------------------------------------------------------------
// Fedics feedback form ViewModel
// Author: Tanya Wilke, 08 June 2015 (Derived from Intervate (Mark Goosen) ViewModel)
//-----------------------------------------------------------------------------------
var ViewModelFedicsFeedback = function () {
    var self = this;
    var slm_LIST_UserFeedback_Title = "FedicsFeedback";
    // constants
    self.api_feedbackquery_query = slm_URL_Intranet + "/convenience/_api/web/lists/GetByTitle(\'" + slm_LIST_UserFeedback_Title + "\')/items";
    self.text_invalid_firstname = "Please enter your firstname";
    self.text_invalid_surname = "Please enter your surname";
    self.text_invalid_email = "Please enter your email address";
    self.text_invalid_comment = "Please enter your comments";
    self.rex_email = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

    self.loaded = ko.observable(false);
    self.submitted = ko.observable(false);
    self.submitFailed = ko.observable(false);    
    
    // Validation extension methods
    ko.extenders.required = function(target, message) {
        // add sub-observables
        target.invalid = ko.observable();
        target.invalidMessage = ko.observable("");
        
        function validate(newValue) {
            if(!self.loaded()) { return; }
            self.requiredField(newValue, target, message);
        }
        
        // initial validation
        validate(target());
        
        // validate whenever the value changes
        target.subscribe(validate);
        
        // return the original observable
        return target;  
    };  
    ko.extenders.validEmail = function(target, message) {
        // add sub-observables
        target.invalid = ko.observable();
        target.invalidMessage = ko.observable("");
        
        function validate(newValue) {
            if(!self.loaded()) { return; }
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
    self.comment = ko.observable("").extend({ required: self.text_invalid_comment });
    
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

    ViewModelFedicsFeedback.dataobjectChoice = dataobjectChoice;
    
    

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
            });
    };

    //-----------------------------------------------------------------------
    // Load data
    //-----------------------------------------------------------------------
    self.createFedicsFeedback = function (fname, sname, email, telephone, business, department, fcomment) {
        var fedicsFeedback = {
            
            "__metadata": { "type": "SP.Data.FedicsFeedbackListListItem" },
            "Title": "",
            "Name": fname,
            "Surname": sname,
            "Email": email,
            "Telephone": telephone,
            "Business": business,
            "Department": department,
            "Comments": fcomment
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
                data: JSON.stringify(fedicsFeedback),
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
            alert("Error: ViewModelFedicsFeedback.createFedicsFeedback " + err);
            console.log("Error: viewModelFedicsFeedback.createFedicsFeedback " + err);
        }
   
    }

    //-----------------------------------------------------------------------
    // Validate required field
    //-----------------------------------------------------------------------
    self.requiredField = function (newValue ,obObj, message) {
        try { 
            var invalid = (newValue ? false : true);
            obObj.invalid(invalid);
            obObj.invalidMessage(invalid ? message : "");
        }
        catch (err) {
            console.log("Error->ViewModelFedicsFeedback: submit click: " + err);
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
            console.log("Error->ViewModelFedicsFeedback.requiredEmail:: " + err);
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
            self.requiredField(self.comment(), self.comment, self.text_invalid_comment);
            
            if(!self.firstName.invalid() && !self.surname.invalid() && !self.email.invalid() && !self.comment.invalid()) {
                self.loaded(false);
                self.createFedicsFeedback(self.firstName(), self.surname(), self.email(), self.telephone(), self.business(), self.department(), self.comment());
            } 
        }
        catch (err) {
            alert("Error->ViewModelFedicsFeedback: submit click: " + err);
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
            console.log("Error->viewModelFedicsFeedback: retry click: " + err);
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
        var viewModelFedicsFeedback = new ViewModelFedicsFeedback();
        var viewModelFedicsFeedbackElement = document.getElementById("fedicsFeedbackForm");

        if (viewModelFedicsFeedbackElement) {
            ko.applyBindings(viewModelFedicsFeedback, viewModelFedicsFeedbackElement);
            viewModelFedicsFeedback.loadProfileData();
        }
    }
    catch (err) {
        console.log("Error->ViewModelFedicsFeedback: Document ready / ApplyBindings: " + err);
    }
});