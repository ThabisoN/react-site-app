//---------------------------------------------------------------------------
// sp-slm footer ViewModel
// Author: Thembalethu Krakri(SPF) from Mark Goosen(Intervate), 18 August 2015
//---------------------------------------------------------------------------
var ViewModelFooter = function () {
    var self = this;

    // observables
    self.loaded = ko.observable(false);
    self.FooterArray = ko.observableArray();

    // properties
    self.GroupName = "Sanlam Group Intranet Navigation";
    self.TermSetName = "Global Footer";
    self.cacheFooter = "cacheFooter";
    self.cacheTimeout = 240;

    //-----------------------------------------------------------------------
    // Load Term Store  
    //-----------------------------------------------------------------------  
    self.load = function () {
        try {

            var _termStore = new slmTermStoreManager(self.GroupName, self.TermSetName, self.cacheFooter, self.cacheTimeout, self.mapTerms);
            _termStore.loadCached();

        } catch (err) {
            self.logFailure("load", err);
        }
    }

    //-----------------------------------------------------------------------
    // Bind the view model to the DOM
    //-----------------------------------------------------------------------
    self.mapTerms = function (terms) {
        try {

            var footerArray = [],
                currentUrl = window.location.href.toLowerCase(),
                feedbackUrl = get_slm_URL_Intranet() + "/pages/feedback.aspx";

            $.each(terms, function (i, column) {
                var headingArray = [];
                $.each(column.ChildTerms, function (j, heading) {
                    var linkArray = [];
                    $.each(heading.ChildTerms, function (k, link) {
                        var addLink = true,
                            linkItem = {
                                "Name": link.Name,
                                "IsNavigation": link.IsNavigation,
                                "DisplayName": link.NavigationDisplayName,
                                "LinkUrl": link.NavigationUrl,
                                "Target": link.NavigationTarget,
                                "DataToggle": "",
                                "DataTarget": ""
                            };

                        // Update feedback link based on location
                        if (link.NavigationUrl.toLowerCase().indexOf(feedbackUrl) > -1) {
                            linkItem.IsNavigation = (currentUrl.indexOf(get_slm_URL_Intranet()) == -1);
                            if (!linkItem.IsNavigation) {
                                linkItem.LinkUrl= "#";
                                linkItem.Target= "";
                                linkItem.DataToggle = "modal";
                                linkItem.DataTarget = ".feedbackModal";
                            } else {
                                linkItem.LinkUrl += "?source=" + encodeURIComponent(currentUrl);
                                linkItem.Target= "_blank";
                            }

                            addLink = (currentUrl.indexOf(feedbackUrl)==-1);                            
                        }
                        
                        if(addLink){
                            linkArray.push(linkItem);
                        }
                    });
                    
                    if(linkArray.length > 0){
                        headingArray.push({
                                "DisplayName": heading.NavigationDisplayName,
                                "LinkArray": linkArray
                            });
                     }
                });

                footerArray.push({
                    "Name": column.Name,
                    "HeadingArray": headingArray
                });
            });

            // Process JSON menu obj
            ko.mapping.fromJS(footerArray, {}, self.FooterArray);

            self.loaded(true);
        } catch (err) {
            self.logFailure("bindViewModel", err)
        }
    }

    //-----------------------------------------------------------------------
    // log failure for viewmodel
    //-----------------------------------------------------------------------
    self.logFailure = function (method, message) {
        console.log("Error: ViewModelFooter." + method + ": " + message);
    }
};

//-----------------------------------------------------------------------
// Document ready and SP.ClientContent available
//-----------------------------------------------------------------------
$(document).ready(function () {
    try {
        // create model and manual bind
        var viewModelFooterElement = document.getElementById("footer");

        // bind if viewmodel element found
        if (viewModelFooterElement) {
            var viewModelFooter = new ViewModelFooter();
            ko.applyBindings(viewModelFooter, viewModelFooterElement);
            viewModelFooter.load();
        }
    }
    catch (err) {
        console.log("Error->ViewModelFooter: Document ready / ApplyBindings: " + err);
    }
});