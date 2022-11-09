//-----------------------------------------------------------------------
// Update the URL, based on wether the protocol is secure or not
//-----------------------------------------------------------------------
String.UrlProtocol = function (value) {
    return (window.location.protocol == "https:") ? value.replace("http:", "https:") : value;
}

// global URLs
var slm_URL_Intranet = "http://intranet-dev.sanlam.co.zaa";
var slm_URL_MySite = "http://me-dev.sanlam.co.zaa";
var slm_URL_Search = "http://search-dev.sanlam.co.zaa";
var slm_URL_NewTab = "#newtab";
var slm_URL_Secure = "#secure";


// API queries
var slm_API_UPS_GetProperties = "/_api/SP.UserProfiles.PeopleManager/GetMyProperties";
//var slm_API_UPS_GetProperties_Toolbar = "/_api/SP.UserProfiles.PeopleManager/GetMyProperties?$select=PictureUrl,AccountName,DisplayName";

// images
var slm_IMAGE_DefaultProfileImage = slm_URL_Intranet + "/_catalogs/masterpage/slmgroup/img/account.png";

// globalIMAGE_DefaultProfileImage lists
var slm_LIST_Canteen = "Canteen Menu Items";
var slm_LIST_Help_Name = "Help";
var slm_LIST_Help_Title = "Help";
var slm_LIST_Notification_Name = "SanlamNotifications";
var slm_LIST_Notification_Title = "Sanlam Notifications";
var slm_LIST_NotificationSettings_Name = "PersonalNotificationSettings";
var slm_LIST_NotificationSettings_Title = "Personal Notification Settings";
var slm_LIST_Toolbox_Name = "ToolboxConfiguration";
var slm_LIST_Toolbox_Title = "Toolbox Configuration";
var slm_LIST_ToolboxFavourites_Name = "MyToolboxFavourites";
var slm_LIST_ToolboxFavourites_Title = "My Toolbox Favourites";
var slm_LIST_UserFeedback_Name = "UserFeedback";
var slm_LIST_UserFeedback_Title = "User Feedback";

// global libraries
var slm_LIBRARY_Canteen = "Canteen Menus"

// ie8 logging alert messagebox fallback
var alertFallback = false;

// user profile properties
var slm_User_Properties = null;

// global caches
var slm_cache_userProfile = 'cacheUserProfile';

//========================================================================
// Lazy load the intranet URL based on the protocol
//========================================================================
var slm_PRVT_URL_Intranet = null;
function get_slm_URL_Intranet() {
    if (slm_PRVT_URL_Intranet) {
        return slm_PRVT_URL_Intranet;
    }

    slm_PRVT_URL_Intranet = String.UrlProtocol(slm_URL_Intranet);
    //console.log("GLOBAL::get_slm_URL_Intranet: has confirmed the site is being accessed via " + slm_PRVT_URL_Intranet + ".");
    return slm_PRVT_URL_Intranet;
}

//========================================================================
// Lazy load the MySite URL based on the protocol
//========================================================================
var slm_PRVT_URL_MySite = null;
function get_slm_URL_MySite() {
    if (slm_PRVT_URL_MySite) {
        return slm_PRVT_URL_MySite;
    }

    slm_PRVT_URL_MySite = String.UrlProtocol(slm_URL_MySite);
    //console.log("GLOBAL::get_slm_URL_MySite: has confirmed the site is being accessed via " + slm_PRVT_URL_MySite + ".");
    return slm_PRVT_URL_MySite;
}

//========================================================================
// Lazy load the Search URL based on the protocol
//========================================================================
var slm_PRVT_URL_Search = null;
function get_slm_URL_Search() {
    if (slm_PRVT_URL_Search) {
        return slm_PRVT_URL_Search;
    }

    slm_PRVT_URL_Search = String.UrlProtocol(slm_URL_Search);
    //console.log("GLOBAL::get_slm_URL_MySite: has confirmed the site is being accessed via " + slm_PRVT_URL_Search + ".");
    return slm_PRVT_URL_Search;
}

//========================================================================
// Lazy load the Search URL based on the protocol
//========================================================================
var slm_PRVT_IMAGE_DefaultProfileImage = null;
function get_slm_IMAGE_DefaultProfileImage() {
    if (slm_PRVT_IMAGE_DefaultProfileImage) {
        return slm_PRVT_IMAGE_DefaultProfileImage;
    }

    slm_PRVT_IMAGE_DefaultProfileImage = String.UrlProtocol(slm_IMAGE_DefaultProfileImage);
    //console.log("GLOBAL::get_slm_IMAGE_DefaultProfileImage: has confirmed the image is being accessed via " + slm_PRVT_IMAGE_DefaultProfileImage + ".");
    return slm_PRVT_IMAGE_DefaultProfileImage;
}


//========================================================================
// Parser Routines
// Author: Christo Greeff, 30 March 2015
//========================================================================
function slmParser() { }

//-----------------------------------------------------------------------
// Get value from key/value pair result
//-----------------------------------------------------------------------
slmParser.prototype.getValueFromKey = function (results, key, defaultValue) {
    try {
        if (results) {
            for (var j = 0; j < results.length; j++) {
                if (results[j].Key === key) {
                    if (results[j].Value)
                        return results[j].Value;
                    else
                        return defaultValue;
                }
            }
        } else {
            console.log("Warning: slmParser.prototype.getValueFromKey: results are null or empty, can't return key: " + key + ", returning default value: '" + defaultValue + "'");
            return defaultValue;
        }
    } catch (err) {
        console.log("Error: slmParser.prototype.getValueFromKey: " + err.message);
        return defaultValue;
    }
};

//-----------------------------------------------------------------------
// Get value or default value if no value exists
//-----------------------------------------------------------------------
slmParser.prototype.getValueDefault = function (value, defaultValue) {
    if (value)
        return value;
    else
        return defaultValue;
}

//-----------------------------------------------------------------------
// Extract image source from string and add rendition if needed
//-----------------------------------------------------------------------
slmParser.prototype.extractImage = function (str, rendition, defaultValue) {
    try {
        // regex
        var regex = /<img.*?src="(.*?)"/;

        // parse
        var result = regex.exec(str)[1];

        // if result and rendition is ok
        if (result)
            if (rendition)
                result = result + "?renditionid=" + rendition;

        return result;
    } catch (err) {
        console.log("Error: slmParser.prototype.extractImage: " + err.message);
        return defaultValue;
    }
};

//-----------------------------------------------------------------------
// Shuffle array
//-----------------------------------------------------------------------
slmParser.prototype.Shuffle = function (array) {
    try {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    } catch (err) {
        console.log("Error: slmParser.prototype.Shuffle: " + err.message);
    }
};

//-----------------------------------------------------------------------
// String extentions
// http://joquery.com/2012/string-format-for-javascript
//-----------------------------------------------------------------------
String.Format = function (b) {
    var a = arguments;
    return b.replace(/(\{\{\d\}\}|\{\d\})/g, function (b) {
        if (b.substring(0, 2) == "{{") return b;
        var c = parseInt(b.match(/\d/)[0]);
        return a[c + 1]
    })
};

//-----------------------------------------------------------------------
// Trim text
//-----------------------------------------------------------------------
String.RemoveAccountDomain = function (ln) {
    if (ln) {
        var splitLn = ln.split("\\");
        return splitLn[1];
    } else return "";
};

//-----------------------------------------------------------------------
// Trim text
//-----------------------------------------------------------------------
String.TrimText = function (value, n) {
    return (value.length > n) ? value.substr(0, n - 1) + '...' : value;
}


// Date Extension for ISO dates
//------------------------------------------------------------------------
(function () {
    // test first
    var D = new Date('1980-06-16T23:30:29+02:00');

    // on fail, parse
    if (!D || +D !== 1307000069000) {
        Date.fromISO = function (s) {
            var day, tz,
            rx = /^(\d{4}\-\d\d\-\d\d([tT ][\d:\.]*)?)([zZ]|([+\-])(\d\d):(\d\d))?$/,
            p = rx.exec(s) || [];
            if (p[1]) {
                day = p[1].split(/\D/);
                for (var i = 0, L = day.length; i < L; i++) {
                    day[i] = parseInt(day[i], 10) || 0;
                };
                day[1] -= 1;
                day = new Date(Date.UTC.apply(Date, day));
                if (!day.getDate()) return NaN;
                if (p[5]) {
                    tz = (parseInt(p[5], 10) * 60);
                    if (p[6]) tz += parseInt(p[6], 10);
                    if (p[4] == '+') tz *= -1;
                    if (tz) day.setUTCMinutes(day.getUTCMinutes() + tz);
                }
                return day;
            }
            return NaN;
        }
    }
    else {
        // else set default
        Date.fromISO = function (s) {
            return new Date(s);
        }
    }
})();

//------------------------------------------------------------------------
// Date Extension for dash/slash dates issues
//------------------------------------------------------------------------
(function () {
    Date.fixDashDate = function (str) {
        str = str.replace(/-/g, '/');
        return new Date(str);
    }
})();

//-----------------------------------------------------------------------
// Check if URL needs to open in a new tab or not
//-----------------------------------------------------------------------
String.HasHashParam = function (value, param) {
    return ((value.indexOf(param) > -1) || (value.indexOf(encodeURIComponent(param)) > -1));
}

//-----------------------------------------------------------------------
// Remove the new url hash from the url
//-----------------------------------------------------------------------
String.RemoveHashParam = function (value, param) {
    return String.HasHashParam(value, param) ? value.replace(param, "").replace(encodeURIComponent(param), "") : value;
}

//========================================================================
// Sanlam Session Storage Constructor
// Author: Christo Greeff, 07 April 2015
//========================================================================
function slmSessionStorage() {
    try {
        // object storage available class
        this._storageAvailable = ("sessionStorage" in window && window.sessionStorage);
        this._testCache = false;

        // calculate a difference in time and return results in minutes
        this.timeDifference = function (previousDate) {
            now = new Date();
            earlier = new Date.fromISO(previousDate);
            difference = parseInt(((now - earlier) / 60000));

            return difference;
        }
    } catch (err) {
        console.log("Error: slmSessionStorage->Constructor: " + err)
    }
}

//---------------------------------------------------------
// Get if session storage is available
//---------------------------------------------------------
slmSessionStorage.prototype.IsAvailable = function () {
    try {
        if (this._storageAvailable) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.log("Error: slmSessionStorage.prototype.IsAvailable: " + err)
    }
}

//---------------------------------------------------------
// Add a session storage object by key
//---------------------------------------------------------
slmSessionStorage.prototype.Add = function (key, data, minuteExpiration) {
    try {
        if (this.IsAvailable) {
            // create an object in session storage based on current date/time
            var store = JSON.stringify(
                {
                    date: new Date(),
                    expiry: minuteExpiration,
                    content: data
                });

            // add to session
            sessionStorage.setItem(key, store);

            return data;
        }

        return null;
    } catch (err) {
        console.log("Error: slmSessionStorage.prototype.Add: " + err)
    }
}

//---------------------------------------------------------
// Get a session storage object by key
//---------------------------------------------------------
slmSessionStorage.prototype.Get = function (key, functionAdd, functionFresh) {
    try {
        if (this.IsAvailable) {

            // try get the key
            var data = sessionStorage.getItem(key);
            var mustAdd = true;

            // if key found
            if (data) {
                // parse available session data
                jsonObj = JSON.parse(data)
                var expiryThreshold = jsonObj.expiry;
                var difference = this.timeDifference(jsonObj.date)

                if (difference < expiryThreshold) {
                    mustAdd = false;

                    // execute function with valid data
                    if (functionFresh) {
                        if (this._testCache) console.log("TEST/UPSCACHE: " + key + ' is still fresh')
                        functionFresh(jsonObj.content);
                    }
                }
                else {
                    // remove the old key
                    this.Remove(key);
                }
            }

            // if must be added or out of date
            if (mustAdd) {
                if (functionAdd) {
                    if (this._testCache) console.log("TEST/UPSCACHE: " + key + ' needs updating')
                    functionAdd();
                }
            }
        }
    } catch (err) {
        console.log("Error: slmSessionStorage.prototype.Get: " + err)
    }
}

//---------------------------------------------------------
// Remove a session storage object by key
//---------------------------------------------------------
slmSessionStorage.prototype.Remove = function (key) {
    try {
        if (this.IsAvailable) {
            sessionStorage.removeItem(key);
        }
    } catch (err) {
        console.log("Error: slmSessionStorage.prototype.Remove: " + err)
    }
}

//---------------------------------------------------------
// Clear all session objects
//---------------------------------------------------------
slmSessionStorage.prototype.Clear = function (key) {
    try {
        if (this.IsAvailable) {
            sessionStorage.clear();
        }
    } catch (err) {
        console.log("Error: slmSessionStorage.prototype.Clear: " + err)
    }
}

//========================================================================
// SharePoint Queries (using jQuery and SharePoint 2013)
// Author: Christo Greeff, 15 April 2015
//========================================================================
function slmSPQuery() { }

//-----------------------------------------------------------------------
// SP Ajax Query
//-----------------------------------------------------------------------
slmSPQuery.prototype.spAJAXgetJSON = function (query, onSuccess, onError) {
    return $.ajax({
        url: query,
        dataType: "json",
        type: "GET",
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            if (onSuccess) {
                onSuccess(data);
            }
        },
        error: function (jqxr, errorCode, errorThrown) {
            // error event
            if (onError) {
                onError(jqxr.responseText);
            }
        }
    });
}

//========================================================================
// UserProfileManager
// Author: Christo Greeff, 15 April 2015
//========================================================================
function slmUserProfileManager() {
    try {
        // nothing yet
    } catch (err) {
        console.log("Error: slmUserProfileManager: " + err.message);
    }
};

//-----------------------------------------------------------------------
// get current user properties
//-----------------------------------------------------------------------
slmUserProfileManager.prototype.GetMyProperties = function (onSuccess, onError) {
    try {
        // make sure clientcontext is available before loading
        SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {
            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + slm_API_UPS_GetProperties,
                type: "POST",
                contentType: "application/json;odata=verbose",
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
                },
                success: function (data) {
                    // success event
                    onSuccess(data);
                },
                error: function (jqxr, errorCode, errorThrown) {
                    // error event
                    if (onError)
                        onError(jqxr.responseText);
                }
            })
        });
    } catch (err) {
        console.log("Error: slmUserProfileManager.prototype.GetMyProperties:" + err.message);
        onError("Error: slmUserProfileManager.prototype.GetMyProperties:" + err.message);
    }
};

//-----------------------------------------------------------------------
// get current user properties
//-----------------------------------------------------------------------
slmUserProfileManager.prototype.GetMyPropertiesCached = function () {
    var defer = new $.Deferred();

    try {
        _test = false;
        _userProfileCacheTime = 60;

        if (slm_User_Properties == null || slm_User_Properties == undefined) {
            if (_test) console.log('TEST/UPSCACHE: Page User Properties not set...');

            localCache = new slmSessionStorage();
            localCache.Get(slm_cache_userProfile,
                function () {
                    if (_test) console.log('TEST/UPSCACHE: Querying UPS...');

                    _profile = new slmUserProfileManager();
                    _profile.GetMyProperties(
                        function (results) {
                            if (_test) console.log('TEST/UPSCACHE: GOT and setting UPS in cache...');

                            localCache = new slmSessionStorage();
                            slm_User_Properties = localCache.Add(slm_cache_userProfile, results.d.UserProfileProperties.results, _userProfileCacheTime);
                            defer.resolve(true);
                        },
                        function (err) {
                            if (_test) console.log('TEST/UPSCACHE: Some error on UPS.' + err);

                            defer.resolve(false);
                        });
                },
                function (data) {
                    if (_test) console.log('TEST/UPSCACHE: Read Page User Properties from cache...');

                    slm_User_Properties = data;
                    defer.resolve(true);
                });
        } else {

            if (_test) console.log('TEST/UPSCACHE: Page User Profile Properties IS set already!');
            defer.resolve(true);
        }
    } catch (err) {

        console.log("Error: slmUserProfileManager.prototype.GetMyPropertiesCached:" + err.message);
        defer.reject(false);
    }

    return defer.promise();
};

//-----------------------------------------------------------------------
// get current user properties
//-----------------------------------------------------------------------
slmUserProfileManager.prototype.RefreshUserProfileCache = function () {
    var defer = new $.Deferred();

    try {
        localCache = new slmSessionStorage();
        localCache.Remove(slm_cache_userProfile);
        slm_User_Properties = null;

        _profile = new slmUserProfileManager();
        _profile.GetMyPropertiesCached();
    } catch (err) {

        console.log("Error: slmUserProfileManager.prototype.ClearUserProfileCached:" + err.message);
        defer.reject(false);
    }

    return defer.promise();
};

//========================================================================
// Show SharePoint Dialog
// Author: Christo Greeff, 13 April 2015
//========================================================================
function slmShowModalDialog(pageUrl, pageTitle) {
    try {
        var options = {
            url: pageUrl,
            autoSize: true,
            title: pageTitle
        };

        SP.SOD.execute(
            'SP.UI.dialog.js',
            'SP.UI.ModalDialog.showModalDialog',
            options);
    }
    catch (err) {
        console.log("Error: slmShowModalDialog:" + err.message);
    }
}

//========================================================================
// Custom Knockout Event Handlers
// Author: Christo Greeff, 21 April 2015
// Source: http://www.adamthings.com/post/2013/09/06/create-custom-knockoutjs-binding-enter-key-press/
//========================================================================
ko.bindingHandlers.enterKey = {
    init: function (element, valueAccessor, allBindings, data, context) {
        var wrapper = function (data, event) {
            if (event.keyCode === 13) {
                try {
                    valueAccessor().call(this, data, event);
                } catch (err) { }
            }
        };
        ko.applyBindingsToNode(element, { event: { keyup: wrapper } }, context);
    }
};

//========================================================================
// Logging handler and fallback on page load
// Author: Christo Greeff, 07 April 2015
//========================================================================
if (typeof console === "undefined") {
    console = {};
    if (alertFallback) {
        console.log = function (msg) {
            alert(msg);
        };
    } else {
        console.log = function () { };
    }
}

//========================================================================
// Sanlam Term Store Manager Constructor
// Author: Mark Goosen, 13 May 2015
//========================================================================
function slmTermStoreManager(groupName, termSetName, cacheName, cacheTimeout, returnFunction) {
    var tsManager = this;
    try {

        // set properties
        tsManager._groupName = groupName;
        tsManager._termSetName = termSetName;
        tsManager._cacheName = cacheName;
        tsManager._cacheTimeout = cacheTimeout;
        tsManager._returnFunction = returnFunction;

        // array of terms
        tsManager.Terms = [];

    } catch (err) {
        console.log("Error: slmTermStoreManager->Constructor: " + err);
    }

    //---------------------------------------------------------
    // Load the default term store
    //---------------------------------------------------------
    tsManager.loadCached = function () {
        try {
            localCache = new slmSessionStorage();
            localCache.Get(tsManager._cacheName,
                function () {
                    var _sodLoaded = tsManager.loadSod();
                    _sodLoaded.then(
                        function (_sodLoaded) {
                            tsManager.loadTermStore().then(
                                function (termStore) {
                                    tsManager.loadGroups(termStore).then(
                                        function (groups) {
                                            tsManager.findGroup(groups).then(
                                                function (group) {
                                                    if (!group) {
                                                        tsManager.logFailure("loadTermStore", "Group: " + tsManager._groupName + " not found.");
                                                        return;
                                                    }
                                                    tsManager.loadTermSets(group).then(
                                                        function (termSets) {
                                                            tsManager.findTermSet(termSets).then(
                                                                function (termSet) {
                                                                    if (!termSet) {
                                                                        tsManager.logFailure("loadTermStore", "Term Set: " + tsManager._termSetName + " not found.");
                                                                        return;
                                                                    }

                                                                    tsManager.loadTerms(termSet, tsManager.Terms).then(
                                                                        function (terms, termArray) {
                                                                            tsManager.processTerms(terms, termArray);

                                                                        },
                                                                        tsManager.csomFailure);
                                                                },
                                                                tsManager.csomFailure);
                                                        },
                                                        tsManager.csomFailure);
                                                },
                                                tsManager.csomFailure);
                                        },
                                        tsManager.csomFailure);
                                },
                                tsManager.csomFailure);
                        }
                    );
                },
                function (data) {
                    tsManager.Terms = data;

                    // return the data
                    if (tsManager._returnFunction) {
                        tsManager._returnFunction(tsManager.Terms);
                    }

                });
        } catch (err) {
            tsManager.logFailure("loadTermStore", err);
        }
    }

    //---------------------------------------------------------
    // Ensure the required JS is loaded for taxonomy csom
    //---------------------------------------------------------
    tsManager.loadSod = function () {
        var defer = $.Deferred();

        // register taxonomy script
        RegisterSod("sp.taxonomy.js", "\u002f_layouts\u002f15\u002fSP.Taxonomy.js");
        RegisterSodDep("sp.taxonomy.js", "sp.runtime.js");
        RegisterSodDep("sp.taxonomy.js", "sp.js");

        SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {
            SP.SOD.executeFunc('sp.taxonomy.js', 'SP.Taxonomy', function () {
                try {

                    // context, session and term store
                    tsManager._context = SP.ClientContext.get_current();
                    defer.resolve(true);

                } catch (err) {
                    console.log("Error: slmTermStoreManager->Constructor: " + err);
                    defer.resolve(false);
                }
            });
        });

        return defer.promise();

    }

    //---------------------------------------------------------
    // Load the default term store
    //---------------------------------------------------------
    tsManager.loadTermStore = function () {
        var defer = $.Deferred();
        try {
            if (tsManager._context) {
                tsManager._session = SP.Taxonomy.TaxonomySession.getTaxonomySession(tsManager._context);
                tsManager._context.load(tsManager._session);
                if (tsManager._session) {
                    this.termStore = tsManager._session.getDefaultSiteCollectionTermStore();
                    if (this.termStore) {
                        tsManager._context.load(this.termStore);
                        tsManager._context.executeQueryAsync(
                            Function.createDelegate(this, function () {
                                defer.resolve(this.termStore);
                            }),
                            Function.createDelegate(this, function (sender, args) {
                                defer.reject(sender, args);
                            }));
                    } else {
                        tsManager.logFailure("loadTermStore", "Could not get default site collection term store");
                    }
                } else {
                    tsManager.logFailure("loadTermStore", "Could not getTaxonomySession");
                }
            } else {
                tsManager.logFailure("loadTermStore", "Could not get current context");
            }
        } catch (err) {
            tsManager.logFailure("loadTermStore", err);
        }

        return defer.promise();
    }

    //-----------------------------------------------------------------------
    // Load all the groups inside a term store
    //-----------------------------------------------------------------------
    tsManager.loadGroups = function (termStore) {
        var defer = $.Deferred();
        try {
            this.groups = termStore.get_groups();
            tsManager._context.load(this.groups);
            tsManager._context.executeQueryAsync(
                Function.createDelegate(this, function () {
                    defer.resolve(this.groups);
                }),
                Function.createDelegate(this, function (sender, args) {
                    defer.reject(sender, args);
                }));

        } catch (err) {
            tsManager.logFailure("loadGroups", err);
        }

        return defer.promise();
    }

    //-----------------------------------------------------------------------
    // Find specified group within the term store
    //-----------------------------------------------------------------------
    tsManager.findGroup = function (groups) {
        var defer = $.Deferred();
        try {

            var groupEnum = groups.getEnumerator();
            this.group;

            while (groupEnum.moveNext()) {
                var currentGroup = groupEnum.get_current();
                if (currentGroup.get_name() != this._groupName) continue;
                tsManager.Group
                this.group = currentGroup;
                tsManager._context.load(this.group);
                tsManager._context.executeQueryAsync(
                    Function.createDelegate(this, function () {
                        defer.resolve(this.group);
                    }),
                    Function.createDelegate(this, function (sender, args) {
                        defer.reject(sender, args);
                    }));

                break;
            }

            if (!this.group) {
                defer.resolve(null);
            }
        } catch (err) {
            tsManager.logFailure("findGroup", err);
        }

        return defer.promise();

    }

    //-----------------------------------------------------------------------
    // Load all the term sets within the specified group
    //-----------------------------------------------------------------------
    tsManager.loadTermSets = function (group) {
        var defer = $.Deferred();
        try {
            this.termSets = group.get_termSets();
            tsManager._context.load(this.termSets);
            tsManager._context.executeQueryAsync(
                Function.createDelegate(this, function () {
                    defer.resolve(this.termSets);
                }),
                Function.createDelegate(this, function (sender, args) {
                    defer.reject(sender, args);
                }));

        } catch (err) {
            tsManager.logFailure("loadTermSets", err);
        }

        return defer.promise();

    }

    //-----------------------------------------------------------------------
    // Find the specific term set within the group
    //-----------------------------------------------------------------------
    tsManager.findTermSet = function (termSets) {
        var defer = $.Deferred();
        try {
            var termSetsEnum = termSets.getEnumerator();
            this.termSet;

            while (termSetsEnum.moveNext()) {
                var currentTermSet = termSetsEnum.get_current();
                if (currentTermSet.get_name() == this._termSetName) {
                    this.termSet = currentTermSet;
                    tsManager._context.load(this.termSet);
                    tsManager._context.executeQueryAsync(
                        Function.createDelegate(this, function () {
                            defer.resolve(this.termSet);
                        }),
                        Function.createDelegate(this, function (sender, args) {
                            defer.reject(sender, args);
                        }));
                }
            }

            if (!this.termSet) {
                defer.resolve(null);
            }

        } catch (err) {
            tsManager.logFailure("findTermSet", err);
        }

        return defer.promise();

    }

    //-----------------------------------------------------------------------
    // Load all the terms within the specific term set or parent term
    //-----------------------------------------------------------------------
    tsManager.loadTerms = function (parent, termArray) {
        var defer = $.Deferred();
        try {
            var terms = parent.get_terms();
            tsManager._context.load(terms);
            tsManager._context.executeQueryAsync(
                Function.createDelegate(this, function () {
                    defer.resolve(terms, termArray);
                }),
                Function.createDelegate(this, function (sender, args) {
                    defer.reject(sender, args);
                }));

        } catch (err) {
            tsManager.logFailure("loadTerms", err);
        }

        return defer.promise();

    }


    //-----------------------------------------------------------------------
    // Load all the terms within the specific term set or parent term
    //-----------------------------------------------------------------------
    tsManager.processTerms = function (terms, termArray) {
        try {
            var termsEnum = terms.getEnumerator();

            while (termsEnum.moveNext()) {
                var term = termsEnum.get_current();

                // Check the url protocol
                var url = tsManager.getNavUrl(term);
                if (url.indexOf(slm_URL_Intranet) > -1 || url.indexOf(slm_URL_MySite) > -1 || url.indexOf(slm_URL_Search) > -1) {
                    url = String.UrlProtocol(url);
                }

                //Check for new tab
                var newTab = String.HasHashParam(url, slm_URL_NewTab);
                if (newTab) {
                    url = String.RemoveHashParam(url, slm_URL_NewTab);
                }

                //Check for secure link
                var requiresHttps = String.HasHashParam(url, slm_URL_Secure);
                if (requiresHttps) {
                    url = String.RemoveHashParam(url, slm_URL_Secure);
                    url = String.UrlProtocol(url);
                }

                // Create the term obj
                var termObj = {
                    "Name": term.get_name(),
                    "IsNavigation": (url),
                    "NavigationDisplayName": tsManager.getNavDisplayName(term),
                    "NavigationUrl": url,
                    "NavigationTarget": (newTab) ? "_blank" : "",
                    "TermId": term.get_id().toString(),
                    "ChildTerms": []
                };

                // Add th terms to the array
                termArray.push(termObj);

                // check for child terms to process
                if (term.get_termsCount() > 0) {
                    tsManager.loadTermDetails(term, termObj).then(
                        function (termResult, childTermArray) {
                            tsManager.processChildTerms(termResult, childTermArray);
                        },
                    tsManager.csomFailure);
                }
            }

            tsManager.cacheAndReturn();

        } catch (err) {
            tsManager.logFailure("processTerms", err)
        }
    }

    //-----------------------------------------------------------------------
    // Load all the terms within the specific term set or parent term
    //-----------------------------------------------------------------------
    tsManager.loadTermDetails = function (term, termObj) {
        var defer = $.Deferred();
        try {
            tsManager._context.load(term);
            tsManager._context.executeQueryAsync(
                Function.createDelegate(this, function () {
                    defer.resolve(term, termObj.ChildTerms);
                }),
                Function.createDelegate(this, function (sender, args) {
                    defer.reject(sender, args);
                }));

        } catch (err) {
            tsManager.logFailure("loadTerms", err);
        }

        return defer.promise();

    }

    //-----------------------------------------------------------------------
    // Load all the terms within the specific term set or parent term
    //-----------------------------------------------------------------------
    tsManager.processChildTerms = function (parent, termArray) {
        try {
            tsManager.loadTerms(parent, termArray).then(
                function (terms, termArr) {
                    tsManager.processTerms(terms, termArr);
                },
                tsManager.csomFailure);
        } catch (err) {
            tsManager.logFailure("processTerms", err)
        }
    }

    //-----------------------------------------------------------------------
    // Cache the taxonomy terms and return the data
    //-----------------------------------------------------------------------
    tsManager.cacheAndReturn = function () {
        try {

            // add to cache                                                             
            termCache = new slmSessionStorage();
            termCache.Add(tsManager._cacheName, tsManager.Terms, tsManager._cacheTimeout);

            // return the data
            if (tsManager._returnFunction) {
                tsManager._returnFunction(tsManager.Terms);
            }
        } catch (err) {
            tsManager.logFailure("cacheAndReturn", err)
        }

    }

    //-----------------------------------------------------------------------
    // Get Navigation Display Name
    //-----------------------------------------------------------------------
    tsManager.getNavDisplayName = function (term) {
        var displayName = term.get_name();
        var sysNavTitle = term.get_localCustomProperties()._Sys_Nav_Title;

        if (sysNavTitle) {
            displayName = sysNavTitle;
        }

        return displayName;
    }

    //-----------------------------------------------------------------------
    // Get Navigation URL
    //-----------------------------------------------------------------------
    tsManager.getNavUrl = function (term) {
        var url = "";
        var sysNavLinkUrl = term.get_localCustomProperties()._Sys_Nav_SimpleLinkUrl;

        if (sysNavLinkUrl) {
            url = sysNavLinkUrl.toLowerCase();
        }

        return url;
    }

    //-----------------------------------------------------------------------
    // Csom call failure
    //-----------------------------------------------------------------------
    tsManager.csomFailure = function (sender, args) {
        if (args) {
            tsManager.logFailure("failure(CSOM)", args.get_message());
        }
    }

    //-----------------------------------------------------------------------
    // Log failure for slmTermStoreManager
    //-----------------------------------------------------------------------
    tsManager.logFailure = function (method, message) {
        console.log("Error: slmTermStoreManager." + method + ": " + message);
    }
}


//========================================================================
// Query Param - for retrieving querystring paramaters
// Author: Mark Goosen, 10 July 2015
//========================================================================
var QueryParam = function () {
    var query_param = {};
    var query = window.location.search.substring(1);
    var parms = query.split("&");
    for (var i = 0; i < parms.length; i++) {
        var pair = parms[i].split("=");
        if (typeof query_param[pair[0]] === "undefined") {
            query_param[pair[0]] = pair[1];
        } else if (typeof query_param[pair[0]] === "string") {
            var arr = [query_param[pair[0]], pair[1]];
            query_param[pair[0]] = arr;
        } else {
            query_param[pair[0]].push(pair[1]);
        }
    }
    return query_param;
}();
