//---------------------------------------------------------------------------
// Help ViewModel
// Author: Mark Goosen, 30 April 2015
//---------------------------------------------------------------------------
var ViewModelHelp = function () {
    var self = this;

    // observables
    self.loaded = ko.observable(false);
    self.hasdata = ko.observable(false);
    self.dataArray = ko.observableArray();

    // constants    
    self.relative_api_folder_query = "_api/web/GetFolderByServerRelativeUrl(\'{0}\')/Files";
    self.api_folder_query = "";

    //---------------------------------------------------------
    // Sanlam Help Data Object
    //---------------------------------------------------------
    var doHelp = (function () {
        function doHelp() {
            var self = this;

            self.Title = ko.observable();
            self.AssetUrl = ko.observable();
        }

        return doHelp;
    })();

    ViewModelHelp.doHelp = doHelp;

    //-----------------------------------------------------------------------
    // Populate Mapped Item
    //-----------------------------------------------------------------------
    self.populateHelpEntry = function (htitle, hurl) {
        try {
            obj = new doHelp();

            // map fields
            obj.Title(htitle);
            obj.AssetUrl(hurl);

            self.dataArray.push(obj);
        } catch (err) {
            console.log("Error: ViewModelHelp.populateHelpEntry: " + err);
        }
    }

    //-----------------------------------------------------------------------
    // Find the Help Asset Library
    //-----------------------------------------------------------------------
    self.findHelp = function (siteServerRelativeUrl) {
        try {
            var helpRelativeUrl = siteServerRelativeUrl + slm_LIST_Help_Title;
            var tmp_query =  get_slm_URL_Intranet() + siteServerRelativeUrl + self.relative_api_folder_query.replace("{0}", helpRelativeUrl);

            if (self.api_folder_query != tmp_query) {
                self.api_folder_query = tmp_query;

                $.ajax({
                    url: self.api_folder_query,
                    dataType: "json",
                    cache: true,
                    type: "GET",
                    contentType: "application/json;odata=verbose",
                    headers: {
                        "Accept": "application/json;odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val()
                    },
                    success: function (data) {
                        var results = data.d.results;
                        $.each(results, function (index, result) {
                            var title = result.Title;
                            if(title == "") {
                                title = result.Name;
                            }
                            self.populateHelpEntry(title, result.ServerRelativeUrl);
                        });
                        self.FinishedLoading();
                    },
                    error: function (jqxr, errorCode, errorThrown) {
                        console.log("Error: ViewModelHelp.findHelp*url: " + self.api_folder_query + "*error: " + errorThrown);
                        self.findHelp("/");
                    }
                });
            } else {
                console.log("Error: ViewModelHelp.findHelp can't find help, as already checked url: " + tmp_query);
            }
        } catch (err) {
            console.log("Error: ViewModelHelp.findHelp: " + err);
        }
    }


    //-----------------------------------------------------------------------
    // Finish up loading
    //-----------------------------------------------------------------------
    self.FinishedLoading = function () {
        try {
        } catch (err) {
            console.log("Error: ViewModelHelp.FinishedLoading: " + err);
        }

        hasData = (self.dataArray().length > 0);
        self.hasdata(hasData);
        self.loaded(true);
    }
};

//-----------------------------------------------------------------------
// Document ready and SP.ClientContent available
//-----------------------------------------------------------------------
$(document).ready(function () {
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {
        try {
            // create model and manual bind
            var viewModelHelpElement = document.getElementById("slmHelp");

            // bind if viewmodel element found
            if (viewModelHelpElement) {
                var viewModelHelp = new ViewModelHelp();

                ko.applyBindings(viewModelHelp, viewModelHelpElement);
                var siteServerRelativeUrl = "/";
                if(_spPageContextInfo.siteServerRelativeUrl != siteServerRelativeUrl) {
                    siteServerRelativeUrl = _spPageContextInfo.siteServerRelativeUrl + "/";
                }

                $('#slmHelpIcon').click(function () {
                    viewModelHelp.findHelp(siteServerRelativeUrl);
                });
            }
        }
        catch (err) {
            console.log("Error->ViewModelHelp: Document ready / ApplyBindings: " + err);
        }
    });
});