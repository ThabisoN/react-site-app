//---------------------------------------------------------------------------
// Carousel ViewModel
// Author: Christo Greeff, 21 April 2015
//---------------------------------------------------------------------------
var ViewModelCarousel = function () {
    var self = this;

    // observables
    self.loaded = ko.observable(false);
    self.hasdata = ko.observable(false);
    self.dataArray = ko.observableArray();

    // TO MOVE TO GLOBAL
    self.slm_LIST_Carousel_Title = "Campaign Configuration";

    // constants
    self.api_query = get_slm_URL_Intranet() + "/_api/web/lists/GetByTitle(\'" + self.slm_LIST_Carousel_Title + "\')/GetItems(query=@v1)?@v1={\"ViewXml\":\"<View><ViewFields><FieldRef Name='Id'/><FieldRef Name='CampaignTitle'/><FieldRef Name='CampaignDescription'/><FieldRef Name='CampaignLink'/><FieldRef Name='CampaignImage'/><FieldRef Name='MobileImage'/><FieldRef Name='Colour'/><FieldRef Name='SanlamLocation'/></ViewFields><Query><OrderBy><FieldRef Ascending='TRUE' Name='SortOrder'/></OrderBy><Where><And><And><And><Geq><FieldRef Name='DisplayEndDate'/><Value Type='DateTime'><Today/></Value></Geq><Leq><FieldRef Name='DisplayStartDate'/><Value Type='DateTime'><Today/></Value></Leq></And><Eq><FieldRef Name='_ModerationStatus'/><Value Type='ModStat'>0</Value></Eq></And>{0}</And></Where></Query><RowLimit Paged='FALSE'>6</RowLimit></View>\"}";

    //---------------------------------------------------------
    // Sanlam Carousel Data Object
    //---------------------------------------------------------
    var doCarousel = (function () {
        function doCarousel() {
            var self = this;

            self.CampaignTitle = ko.observable();
            self.CampaignDescription = ko.observable();
            self.CampaignLink = ko.observable();
            self.CampaignTarget = ko.observable();
            self.CampaignImage = ko.observable();
            self.MobileImage = ko.observable();
            self.Colour = ko.observable();
        }

        return doCarousel;
    })();

    ViewModelCarousel.doCarousel = doCarousel;

    //-----------------------------------------------------------------------
    // Populate Mapped Item
    //-----------------------------------------------------------------------
    self.populateCampaignEntry = function (ctitle, cdesc, clink, cimage, cmobile, ccolour) {
        try {
            obj = new doCarousel();

            //Check for new tab
            var newTab = String.HasHashParam(clink.Url, slm_URL_NewTab);
            if (newTab) {
                clink.Url = String.RemoveHashParam(clink.Url, slm_URL_NewTab);
            }

            // map fields
            obj.CampaignTitle(ctitle);
            obj.CampaignDescription(cdesc);
            obj.CampaignLink(clink);
            obj.CampaignTarget((newTab) ? "_blank" : "");
            obj.CampaignImage(cimage);
            obj.MobileImage(cmobile);
            obj.Colour(ccolour);

            self.dataArray.push(obj);
        } catch (err) {
            console.log("Error: ViewModelCarousel.populateCampaignEntry: " + err);
        }
    }

    //-----------------------------------------------------------------------
    // SharePoint Post JSON via AJAX
    //-----------------------------------------------------------------------
    self.spAJAXpostJSON = function (query) {
        return $.ajax({
            url: query,
            dataType: "json",
            type: "POST",
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            }
        });
    };


    //-----------------------------------------------------------------------
    // Load data
    //-----------------------------------------------------------------------
    self.loadData = function () {
        // get ISO date in query
        //date = new Date();
        //isoDate = date.toISOString();

        var companyFilter = "<IsNull><FieldRef Name='SanlamCompany'/></IsNull>";
        if (self.userCompany) {
            companyFilter = String.format("<Or><Eq><FieldRef Name='SanlamCompany'/><Value Type='TaxonomyFieldType'>{0}</Value></Eq><IsNull><FieldRef Name='SanlamCompany'/></IsNull></Or>", self.userCompany);
        }

        var q = self.api_query.replace("{0}", companyFilter);

        self.spAJAXpostJSON(q)
            .success(function (data) {
                var d = data.d.results;
                $.each(d, function (index, result) {
                    self.populateCampaignEntry(result.CampaignTitle, result.CampaignDescription, result.CampaignLink, result.CampaignImage, result.MobileImage, result.Colour);
                });
                self.FinishedLoading();
            })
            .error(function (jqxr, errorCode, errorThrown) {
                console.log("Error: ViewModelCarousel.loadData*error: " + errorThrown);
                self.FinishedLoading();
            });
    }

    //-----------------------------------------------------------------------
    // Finish up loading
    //-----------------------------------------------------------------------
    self.FinishedLoading = function () {
        try {
        } catch (err) {
            console.log("Error: ViewModelCarousel.populateSocial: " + err);
        }

        hasData = (self.dataArray().length > 0);
        self.hasdata(hasData);
        self.loaded(true);
    }

    //-----------------------------------------------------------------------
    // Main load event
    //-----------------------------------------------------------------------
    self.load = function () {
        try {
            // Check if user is at headoffice
            var profile = new slmUserProfileManager();
            var result = profile.GetMyPropertiesCached();
            result.done(
                function (_result) {
                    parser = new slmParser();

                    self.userCompany = parser.getValueFromKey(slm_User_Properties, "Company", "");
                    self.loadData();
                });
        } catch (err) {
            console.log("Error: ViewModelCarousel.load: " + err);
        }
    }

};

//-----------------------------------------------------------------------
// Document ready and SP.ClientContent available
//-----------------------------------------------------------------------
$(document).ready(function () {
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {
        try {
            // create model and manual bind
            var viewModelCarouselElement = document.getElementById("myCarousel");

            // bind if viewmodel element found
            if (viewModelCarouselElement) {
                var viewModelCarousel = new ViewModelCarousel();

                ko.applyBindings(viewModelCarousel, viewModelCarouselElement);
                viewModelCarousel.load();
            }
        }
        catch (err) {
            console.log("Error->ViewModelCarousel: Document ready / ApplyBindings: " + err);
        }
    });
});