//---------------------------------------------------------------------------
// Phonebook ViewModel
// Author: Christo Greeff, 15 April 2015
//---------------------------------------------------------------------------
var ViewModelPhonebook = function () {
    var self = this;

    // observables (search)
    self.loaded = ko.observable(false);
    self.loadedPerson = ko.observable(false);
    self.loading = ko.observable(false);
    self.loadingError = ko.observable(false);
    self.nodata = ko.observable(true);
    self.tooShort = ko.observable(false);
    self.dataArray = ko.observableArray();
    self.searchTerm = ko.observable("");
    self.specificPerson = ko.observable();

    self.knowArray = ko.observableArray();
    self.knowLoading = ko.observable(true);
    self.knowError = ko.observable(false);
    self.knowLoaded = ko.observable(false);
    self.knowNoData = ko.observable(false);

    // properties
    self.tempArray = [];
    self.tempKnowArray = [];
    self.maxKnow = 20; // the query should be limited to ldap. chat to LinkState guys
    self.minLength = 3;
    self.domain = "mud"; // bit of a hack now, since LinkState guys must stil provide images
    self.ups_costcentre_property = "departmentnumber";
    self.ups_username_property = "UserName";
    self.cacheOwnPB = "cachePhoneBookProfile";
    self.cacheMinutesPB = 240;
    self.cacheSamAccountName;

    // constants
    //self.api_ldap_server = "http://srv003097.mud.internal.co.za"; //dev
    self.api_ldap_server = "http://meta-ws.sanlam.co.za"; //prd - load balanced server
    self.api_ldap_query_search = self.api_ldap_server + "/api/intranet/search?Filter={0}&Attributes={1}";
    self.api_ldap_query_know = self.api_ldap_server + "/api/intranet/getColleagues?samAccountName={0}&Attributes={1}";

    self.api_ldap_filter_search = "(&(objecttype=person)(|(displayname={0})(samaccountname={1}))(objectstatus=active))";
    self.api_ldap_attr_search = "objectguid,company,displayname,preferredemail,title,telephonenumber,samaccountname,department";

    self.api_ldap_attr_know = "objectguid,company,displayname,preferredemail,title,telephonenumber,samaccountname,department";

    self.phonebook_view = "https://phonebook.internal.co.za/Pages/MoreInformation.aspx?objectGuid={0}&samAccountName={1}";
    self.phonebook_edit = "http://phonebook.internal.co.za/Pages/EditInformation.aspx?samAccountName={0}"
    self.phonebook_track = "http://phonebook.internal.co.za/Pages/TrackChanges.aspx";

    //self.img_loc = "/_layouts/15/userphoto.aspx?accountname=";
    self.img_loc = self.api_ldap_server + "/GetImage.php?objectGuid=";

    self.api_dummy_data = get_slm_URL_Intranet() + "/_catalogs/masterpage/slmgroup/json/phonebook.dummy"

    //---------------------------------------------------------
    // Sanlam Phonebook Entry Data Object
    //---------------------------------------------------------
    var doPhonebookEntry = (function () {
        function doPhonebookEntry() {
            var self = this;

            self.objectguid = ko.observable();
            self.company = ko.observable();
            self.displayname = ko.observable();
            self.preferredemail = ko.observable();
            self.title = ko.observable();
            self.telephonenumber = ko.observable();
            self.samaccountname = ko.observable();
            self.department = ko.observable();
            self.photo = ko.observable();
            self.weblink = ko.observable();
            self.editlink = ko.observable();
            self.tracklink = ko.observable();
            self.dropdown = ko.computed(function () { return self.displayname() + (self.title() ? ", " + self.title() : ""); }, self);
            self.dropdown2 = ko.computed(function () { return self.displayname() + (self.telephonenumber() ? ", " + self.telephonenumber() : ""); }, self);
        }

        return doPhonebookEntry;
    })();

    ViewModelPhonebook.doPhonebookEntry = doPhonebookEntry;

    //-----------------------------------------------------------------------
    // Check property existance and give defaultvalue
    //-----------------------------------------------------------------------
    Object.checkProp = function (o, p, index, defValue) {
        try {
            if (o.hasOwnProperty(p)) {
                if (o[p]) {
                    if (o[p].count > 0) {
                        return o[p][index];
                    }
                }
            }
            return defValue;
        } catch (err) {
            console.log("Error: Object.checkProp. Defaulting.");
            return defValue;
        }
    };

    //-----------------------------------------------------------------------
    // Populate Generic Mapped Item
    //-----------------------------------------------------------------------
    self.populateGenericMappedEntry = function (objectguid, company, displayname, preferredemail, title, telephonenumber, samaccountname, department) {
        try {
            obj = new doPhonebookEntry();
            parser = new slmParser();

            // map fields
            obj.objectguid(parser.getValueDefault(objectguid, ""));
            obj.company(parser.getValueDefault(company, ""));
            obj.displayname(parser.getValueDefault(displayname, ""));
            obj.preferredemail(parser.getValueDefault(preferredemail, ""));
            obj.title(parser.getValueDefault(title, ""));
            obj.telephonenumber(parser.getValueDefault(telephonenumber, ""));
            obj.samaccountname(parser.getValueDefault(samaccountname, ""));
            obj.department(parser.getValueDefault(department, ""));

            // self built fields
            obj.weblink(String.Format(self.phonebook_view, obj.objectguid(), obj.samaccountname()));
            // if own account, can edit and track changes
            if (self.cacheSamAccountName) {
                if (self.cacheSamAccountName.toLowerCase() == obj.samaccountname().toLowerCase()) {
                    obj.editlink(String.Format(self.phonebook_edit, obj.samaccountname()));
                    obj.tracklink(self.phonebook_track);
                }
            }
            obj.photo("/_layouts/15/userphoto.aspx?accountname=" + self.domain + "\\" + obj.samaccountname());

            return obj;
        } catch (err) {
            console.log("Error: ViewModelPhoneBook.populateGenericMappedEntry: " + err);
        }
    }

    //-----------------------------------------------------------------------
    // Populate Mapped Item
    //-----------------------------------------------------------------------
    self.populatePhonebookEntry = function (objectguid, company, displayname, preferredemail, title, telephonenumber, samaccountname, department) {
        try {
            obj = self.populateGenericMappedEntry(objectguid, company, displayname, preferredemail, title, telephonenumber, samaccountname, department);
            self.tempArray.push(obj);
        } catch (err) {
            console.log("Error: ViewModelPhoneBook.populatePhonebookEntry: " + err);
        }
    };

    //-----------------------------------------------------------------------
    // Populate Search Results
    //-----------------------------------------------------------------------
    self.populateSearchResults = function (data) {
        try {
            $.each(data.Results, function (index, result) {
                self.populatePhonebookEntry(
                    Object.checkProp(result, "objectguid", 0, ""),
                    Object.checkProp(result, "company", 0, "No company specified"),
                    Object.checkProp(result, "displayname", 0, ""),
                    Object.checkProp(result, "preferredemail", 0, "No email address available"),
                    Object.checkProp(result, "title", 0, ""),
                    Object.checkProp(result, "telephonenumber", 0, "Unknown telephone number"),
                    Object.checkProp(result, "samaccountname", 0, "Z999999"),
                    Object.checkProp(result, "department", 0, "No department specified"));
            });

            self.tempArray.sort(
            	function (left, right) {
            	    var lD = left.displayname().toLowerCase().replace(/ /g, '');
            	    var rD = right.displayname().toLowerCase().replace(/ /g, '');
            	    return lD == rD ? 0 : (lD < rD ? -1 : 1)
            	});
        } catch (err) {
            console.log("Error: ViewModelPhoneBook.populateSearchResults: " + err);
        }
    };

    //-----------------------------------------------------------------------
    // Clear Search
    //-----------------------------------------------------------------------
    self.clearSearch = function () {
        try {
            self.loadingError(false);
            self.loaded(false);
            self.tooShort(false);
            self.nodata(true);
            self.tempArray = [];
            self.dataArray.removeAll();
        } catch (err) {
            console.log("Error: ViewModelPhonebook.ClearSearch: " + errorThrown);
        }
    };

    //-----------------------------------------------------------------------
    // Search
    //-----------------------------------------------------------------------
    self.search = function () {
        try {
            self.clearSearch();
            if (self.searchTerm()) {
                if (self.searchTerm().length >= self.minLength) {
                    self.loading(true);

                    filter = encodeURIComponent(String.Format(self.api_ldap_filter_search, "*" + self.searchTerm() + "*", self.searchTerm()));
                    attributes = encodeURIComponent(self.api_ldap_attr_search);
                    query = String.Format(self.api_ldap_query_search, filter, attributes);

                    $.ajax({
                        url: query, //self.api_dummy_data,
                        type: "GET",
                        dataType: "json",
                        crossdomain: true,
                        success: function (data) {
                            self.populateSearchResults(data);
                            self.finishedLoading();
                        },
                        error: function (jqxr, errorCode, errorThrown) {
                            self.loadingError(true);
                            self.loaded(true);
                            self.loading(false);
                            console.log("Warning/Error: Cannot access phonebook services (Search): " + errorThrown);
                        }
                    });
                } else {
                    self.tooShort(true);
                }
            }
        } catch (err) {
            console.log("Error: ViewModelPhonebook.Search: " + err);
            self.finishedLoading();
        }
    };

    //-----------------------------------------------------------------------
    // Populate Item for own entry
    //-----------------------------------------------------------------------
    self.populateOwnEntry = function (data) {
        if (data) {
            if (data.Results[0]) {
                var oResult = data.Results[0];
                var oEntry = self.populateGenericMappedEntry(
                    Object.checkProp(oResult, "objectguid", 0, ""),
                    Object.checkProp(oResult, "company", 0, "No company specified"),
                    Object.checkProp(oResult, "displayname", 0, ""),
                    Object.checkProp(oResult, "preferredemail", 0, "No email address available"),
                    Object.checkProp(oResult, "title", 0, ""),
                    Object.checkProp(oResult, "telephonenumber", 0, "Unknown telephone number"),
                    Object.checkProp(oResult, "samaccountname", 0, "Z999999"),
                    Object.checkProp(oResult, "department", 0, "No department specified"));

                self.specificPerson(oEntry);
                self.loadedPerson(true);
                //var ele = document.getElementById("phonebookLyncPresence");
                //$('#phonebookLyncPresence').createpresence(self.domain + "\\" + oEntry.samaccountname(), { type: "presenceonly", redirectToProfile: true });
            }
        }
    }

    //-----------------------------------------------------------------------
    // Search own profile
    //-----------------------------------------------------------------------
    self.searchOwnProfile = function () {
        try {
            // read user profile properties (from cache if cached)
            var _profile = new slmUserProfileManager();
            var _result = _profile.GetMyPropertiesCached();
            _result.done(
                function (_result) {
                    parser = new slmParser();

                    self.cacheSamAccountName = parser.getValueFromKey(slm_User_Properties, self.ups_username_property, "");
                    if (self.cacheSamAccountName) {
                        filter = encodeURIComponent(String.Format(self.api_ldap_filter_search, self.cacheSamAccountName, self.cacheSamAccountName));
                        attributes = encodeURIComponent(self.api_ldap_attr_search);
                        query = String.Format(self.api_ldap_query_search, filter, attributes);

                        // load/populate from cache
                        localCache = new slmSessionStorage();
                        localCache.Get(self.cacheOwnPB,
                            function () {
                                $.ajax({
                                    url: query,
                                    type: "GET",
                                    dataType: "json",
                                    crossdomain: true,
                                    success: function (data) {
                                        self.populateOwnEntry(data);
                                        if (data) {
                                            if (data.Results[0]) {
                                                loadedCache = new slmSessionStorage();
                                                loadedCache.Add(self.cacheOwnPB, data, self.cacheMinutesPB);
                                            }
                                        }
                                    },
                                    error: function (jqxr, errorCode, errorThrown) {
                                        self.loadingError(true);
                                        self.loaded(true);
                                        self.loading(false);
                                        console.log("Warning/Error: Cannot access phonebook services (Search): " + errorThrown);
                                    }
                                });
                            },
                            function (data) {
                                self.populateOwnEntry(data);
                            }
                        );
                    }
                });
        } catch (err) {
            console.log("Error: ViewModelPhonebook.searchOwnProfile: " + err);
        }
    };

    //-----------------------------------------------------------------------
    // Load specific individual
    //-----------------------------------------------------------------------
    self.getPerson = function (PhonebookEntry) {
        try {
            if (PhonebookEntry) {
                self.specificPerson(PhonebookEntry);
                self.loadedPerson(true);
                self.getPeopleYouMightKnow(PhonebookEntry.samaccountname());

                $('.peopeSearchDropdown').hide(25);

                var ele = document.getElementById("phonebookLyncPresence");
                var settings = { type: "presenceonly", redirectToProfile: true };
                $('#phonebookLyncPresence').createpresence(self.domain + "\\" + PhonebookEntry.samaccountname(), settings);
            }
        } catch (err) {
            console.log("Error: ViewModelPhonebook.getPerson: " + err);
        }
    };

    //-----------------------------------------------------------------------
    // Finish up search
    //-----------------------------------------------------------------------
    self.finishedLoading = function () {
        try {
            // push results to dataArray
            $.each(self.tempArray, function (index, result) {
                self.dataArray.push(result);
            });
        } catch (err) {
            console.log("Error: ViewModelPhonebook.finishedLoading: " + err);
        }

        hasData = self.dataArray().length > 0;
        self.nodata(!hasData);
        self.loaded(true);
        self.loading(false);
    };

    //-----------------------------------------------------------------------
    // Populate (Know) Mapped Item
    //-----------------------------------------------------------------------
    self.populateKnowEntry = function (objectguid, company, displayname, preferredemail, title, telephonenumber, samaccountname, department) {
        try {
            obj = self.populateGenericMappedEntry(objectguid, company, displayname, preferredemail, title, telephonenumber, samaccountname, department);
            self.tempKnowArray.push(obj);
        } catch (err) {
            console.log("Error: ViewModelPhoneBook.populateKnowEntry: " + err);
        }
    };

    //-----------------------------------------------------------------------
    // Populate Know Results
    //-----------------------------------------------------------------------
    self.populateKnowResults = function (data) {
        try {
            if (data) {
                if (data.Results) {
                    $.each(data.Results, function (index, result) {
                        self.populateKnowEntry(
                    Object.checkProp(result, "objectguid", 0, ""),
                    Object.checkProp(result, "company", 0, "No company specified"),
                    Object.checkProp(result, "displayname", 0, ""),
                    Object.checkProp(result, "preferredemail", 0, "No email address available"),
                    Object.checkProp(result, "title", 0, ""),
                    Object.checkProp(result, "telephonenumber", 0, "Unknown telephone number"),
                    Object.checkProp(result, "samaccountname", 0, "Z999999"),
                    Object.checkProp(result, "department", 0, "No department specified"));
                    
                    });
                }
            }
        } catch (err) {
            console.log("Error: ViewModelPhoneBook.populateKnowResults: " + err);
        }
    };

    //-----------------------------------------------------------------------
    // People you might know
    //-----------------------------------------------------------------------
    self.getPeopleYouMightKnow = function (filterParam) {
        try {
            // clear
            self.knowArray.removeAll();
            self.tempKnowArray = [];
            self.knowLoading(true);
            self.knowLoaded(false);
            self.knowNoData(false);

            // read user profile properties (from cache if cached)
            var _profile = new slmUserProfileManager();
            var _result = _profile.GetMyPropertiesCached();
            _result.done(
                function (_result) {
                    parser = new slmParser();

                    // if not set, use current user
                    if (!filterParam) {
                        filterParam = parser.getValueFromKey(slm_User_Properties, self.ups_username_property, "");
                    }

                    if (filterParam) {
                        attributes = encodeURIComponent(self.api_ldap_attr_know);
                        query = String.Format(self.api_ldap_query_know, filterParam, attributes);

                        $.ajax({
                            url: query,
                            cache: false,
                            type: "GET",
                            dataType: "json",
                            crossdomain: true,
                            success: function (data) {
                                self.populateKnowResults(data);
                                self.finishedKnowLoading();
                            },
                            error: function (jqxr, errorCode, errorThrown) {
                                self.knowError(true);
                                self.knowLoaded(true);
                                self.knowLoading(false);
                                console.log("Warning/Error: Cannot access phonebook services (People in your Cost Centre): " + errorThrown);
                            }
                        });
                    }
                });
        } catch (err) {
            console.log("Error: ViewModelPhonebook.getPeopleYouMightKnow: " + err);
            self.finishedKnowLoading();
        }
    };

    //-----------------------------------------------------------------------
    // Finish up know loading
    //-----------------------------------------------------------------------
    self.finishedKnowLoading = function () {
        try {
            // push results to knowArray
            tempCount = 0;

            if (self.tempKnowArray) {
                $.each(self.tempKnowArray, function (index, result) {
                    if (tempCount < self.maxKnow) {
                        if (result.displayname()) {
                            self.knowArray.push(result);
                        }
                        tempCount = tempCount + 1;
                    }
                });
            }
        } catch (err) {
            console.log("Error: ViewModelPhonebook.finishedKnowLoading: " + err);
        }

        noData = (self.knowArray().length == 0);
        self.knowNoData(noData);
        self.knowLoaded(true);
        self.knowLoading(false);
    };


    //-----------------------------------------------------------------------
    // Default to own value on clear
    //-----------------------------------------------------------------------
    self.searchTerm.subscribe(function (newValue) {
        try {
            if (!newValue) {
                self.searchOwnProfile();
            }
        }
        catch (err) {
            console.log("Error: ViewModelPhonebook.searchTerm.subscribe: " + err);
        }
    });
};

//-----------------------------------------------------------------------
// Document ready and SP.ClientContent available
//-----------------------------------------------------------------------
$(document).ready(function () {
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {
        SP.SOD.executeFunc('userprofile', 'SP.Social.SocialFollowingManager', function () {
            try {
                // create model and manual bind
                var viewModelBaseElement = document.getElementById("slmPhonebook");

                // bind if viewmodel element found
                if (viewModelBaseElement) {
                    var viewModelPhoneBook = new ViewModelPhonebook();

                    ko.applyBindings(viewModelPhoneBook, viewModelBaseElement);
                    viewModelPhoneBook.getPeopleYouMightKnow();
                    viewModelPhoneBook.searchOwnProfile();
                }
            }
            catch (err) {
                console.log("Error->ViewModelPhoneBook: Document ready / ApplyBindings: " + err);
            }
        })
    });
});