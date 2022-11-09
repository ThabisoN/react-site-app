//---------------------------------------------------------------------------
// Terms and Conditions ViewModel
// Author: Mark Goosen, 27 May 2015
//---------------------------------------------------------------------------
var TermsAndConditionsDialog = function () {
    var self = this;

    // observables
    self.loaded = ko.observable(false);
    self.MenuArray = ko.observableArray();

    // properties
    self.GroupName = "Sanlam Group Intranet Navigation";
    self.TermSetName = "Global Navigation";
    self.cacheMenu = "cacheMnu";
    self.cacheTimeout = 240;

    // constants
    self.api_tandc_query = get_slm_URL_Intranet() + "/_api/web/lists/GetByTitle(\'Pages\')/items?$filter=Title eq 'Terms and Conditions'";
    self.control_tandc_dialog = "tandcDialog";
    self.control_tandc_accept_button = "btnAcceptTandC";
    self.string_tandc_acceptance_date = "TAndCsAcceptanceDate";
    

    //-----------------------------------------------------------------------
    // Load Term Store    
    //-----------------------------------------------------------------------  
    self.load = function () {
        try {
        
          // check which page we are not on the T and Cs page
          var currentUrl = window.location.href.toLowerCase();
      if(currentUrl.indexOf('terms-and-conditions.aspx') == -1) {
              
      
        var profile = new slmUserProfileManager();
              var result = profile.GetMyPropertiesCached();
              result.done(
                  function (_result) {
                      parser = new slmParser(); 
                      self.AcceptanceDate = parser.getValueFromKey(slm_User_Properties, self.string_tandc_acceptance_date, "");
                      self.loadData();
                  });
            }
        } catch (err) {
            self.logFailure("Error: TermsAndConditionsDialog.load", err);
        }
    }

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
    // Get T nd C Page Properties
    //-----------------------------------------------------------------------
    self.loadData = function () {

        // Load Notifications
        try {
            
                self.spAJAXgetJSON(self.api_tandc_query)
                .done(function (data) { 
                var d = data.d.results;
                $.each(d, function (index, result) {
                  var accDate = new Date.fixDashDate(self.AcceptanceDate);
                  var modDate = new Date(result.Modified);
                  if(self.AcceptanceDate == "" || (modDate > accDate)) {    
                      $('#' + self.control_tandc_dialog).modal('show');
                    }                      
                });
                });
        } catch (err) {
            console.log("Error: TermsAndConditionsDialog.loadData: " + err);
        }
    }

    //-----------------------------------------------------------------------
    // log failure for viewmodel
    //-----------------------------------------------------------------------
    self.logFailure = function (method, message) {
        console.log("Error: Terms and Conditions." + method + ": " + message);
    }

    //-----------------------------------------------------------------------
    // CLICK EVENT - Accept the Terms and Conditions
    //-----------------------------------------------------------------------
    self.acceptTandCs = function () {
        try {
          self.getUserId().done(function (userId) { 
            var now = new Date();
          var acceptanceDate = [now.getFullYear(), self.addZero(now.getMonth()+1), self.addZero(now.getDate())].join("-") + "T" + [self.addZero(now.getHours()), self.addZero(now.getMinutes()), self.addZero(now.getSeconds())].join(":"); //"11/6/2014 6:00:00 AM" 
          self.updateUserProfile(userId, self.string_tandc_acceptance_date, acceptanceDate);
      });
        }
        catch (err) {
            console.log("Error->ViewModelNotificationBoard: changeFilter click: " + err);
        }
    }

  //getUserLogin() uses CSOM to retrive current userId. 
  self.getUserId = function () {
    var userLogin = $.Deferred(function () {
      var clientContext = new SP.ClientContext.get_current(); 
      var user = clientContext.get_web().get_currentUser();
      clientContext.load(user); 
      clientContext.executeQueryAsync( 
        function () {
          userLogin.resolve(user.get_loginName());
        },
      function () { 
          userLogin.reject(args.get_message());
        }
        ); 
    });
    return userLogin.promise();
  } 

  //updateUserProfile updates the userprofile property 
  self.updateUserProfile = function (userId, propertyName, propertyValue) { 
    var propertyData = "<PropertyData>" +
    "<IsPrivacyChanged>false</IsPrivacyChanged>" + 
    "<IsValueChanged>true</IsValueChanged>" + 
    "<Name>"+propertyName+"</Name>" + 
    "<Privacy>NotSet</Privacy>" + 
    "<Values><ValueData><Value xsi:type=\"xsd:dateTime\">" + propertyValue + "</Value></ValueData></Values>" + 
    "</PropertyData>";
    
    $().SPServices({
      operation: "ModifyUserPropertyByAccountName",
      async: false, 
      webURL: "/", 
      accountName: userId, 
      newData: propertyData,
      completefunc: function (xData, Status) { 
        if(Status = "success") {
          _profile = new slmUserProfileManager();
          _profile.RefreshUserProfileCache();
        } 
      } 
    }); 
  } 
  
  self.addZero = function(value) {
    if(value < 10) {
      return "0" + value;
    }
    
    return value;
  }
 
};

//-----------------------------------------------------------------------
// Document ready and SP.ClientContent available
//-----------------------------------------------------------------------
$(document).ready(function () {
    
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {
      try { 
        var termsAndConditionsDialog = new TermsAndConditionsDialog();
            termsAndConditionsDialog.load();
            
            var acceptButton = $('#' + termsAndConditionsDialog.control_tandc_accept_button);
            if(acceptButton) {
              acceptButton.click(termsAndConditionsDialog.acceptTandCs);
            }
      }
      catch (err) {
          console.log("Error->TermsAndConditionsDialog: Document ready / ApplyBindings: " + err);
      }
    });
});


  