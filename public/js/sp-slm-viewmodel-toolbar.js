//---------------------------------------------------------------------------
// User Profile (Toolbar) ViewModel
// Author: Christo Greeff, 15 April 2015
//---------------------------------------------------------------------------
var ViewModelToolbar = function () {
    var self = this;

    self.DisplayName = ko.observable("");
    self.PictureUrl = ko.observable(get_slm_IMAGE_DefaultProfileImage());
    self.DisplayTitle = ko.observable("");
    self.loaded = ko.observable(false);
    self.MySiteUrl = ko.observable(get_slm_URL_MySite() + "/Person.aspx");

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

			    self.DisplayName(parser.getValueFromKey(slm_User_Properties, "PreferredName", ""));
			    self.PictureUrl(parser.getValueFromKey(slm_User_Properties, "PictureURL", get_slm_IMAGE_DefaultProfileImage()));
			    if (self.PictureUrl() == get_slm_IMAGE_DefaultProfileImage()) {
			        self.DisplayTitle("Please consider updating your profile picture... :)")
			    } else {
			        self.DisplayTitle("Nice profile picture, " + self.DisplayName() + "!");
			    }

			    self.loaded(true);
			});
    };
};

//-----------------------------------------------------------------------
// Document ready on SharePoint libraries loaded
//-----------------------------------------------------------------------

// make sure clientcontext is available before loading
SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {
    SP.SOD.executeFunc('userprofile', 'SP.Social.SocialFollowingManager', function () {
        try {
            // create model and manual bind
            var viemodelToolbar = new ViewModelToolbar();
            var viemodelToolbarElement = document.getElementById("slmControlToolbar");

            if (viemodelToolbarElement) {
                ko.applyBindings(viemodelToolbar, viemodelToolbarElement);
                viemodelToolbar.loadProfileData();
            }
        }
        catch (err) {
            console.log("Error->ViewModelToolbar: Document ready / ApplyBindings: " + err);
        }
    });
});