//---------------------------------------------------------------------------
// Notification Board ViewModel
// Author: Christo Greeff, 09 July 2015
//---------------------------------------------------------------------------
var ViewModelNotificationBoard = function () {
    var self = this;

    // observables
    self.loaded = ko.observable(false);
    self.statusLoaded = ko.observable(false);
    self.hasdata = ko.observable(false);
    self.savingStatus = ko.observable(false);
    self.dataArray = ko.observableArray();
    self.mysite = ko.observable(get_slm_URL_MySite());

    // Filters
    self.changingFilter = ko.observable(false);
    self.string_latest_filter = "Latest";
    self.string_read_filter = "Read";
    self.filterArray = ko.observableArray();
    self.selectedFilter = ko.observable();

    // properties
    self.tempArrNotifications = [];
    self.tempArrSocial = [];
    self.tempArrNotificationStatus = [];

    // constants
    self.api_notification_author_query = get_slm_URL_Intranet() + "/_api/web/lists/GetByTitle(\'" + slm_LIST_Notification_Title + "\')/items?$select=id,NotificationAuthor/Title,NotificationAuthor/Name&$expand=NotificationAuthor&$orderby=NotificationDate desc&$filter=NotificationDate le datetime'{0}'";
    self.api_notification_query = get_slm_URL_Intranet() + "/_api/web/lists/GetByTitle(\'" + slm_LIST_Notification_Title + "\')/GetItems(query=@v1)?@v1={\"ViewXml\":\"<View><ViewFields><FieldRef Name='Id'/><FieldRef Name='Title'/><FieldRef Name='NotificationMessage'/><FieldRef Name='NotificationDate'/><FieldRef Name='NotificationType'/><FieldRef Name='NotificationTarget'/></ViewFields><Query><OrderBy><FieldRef Ascending='FALSE' Name='NotificationDate'/></OrderBy><Where><And><And><Or><Geq><FieldRef Name='DisplayEndDate'/><Value Type='DateTime'><Today/></Value></Geq><IsNull><FieldRef Name='DisplayEndDate'/></IsNull></Or><Leq><FieldRef Name='NotificationDate'/><Value IncludeTimeValue='TRUE' Type='DateTime'><Today/></Value></Leq></And>{0}</And></Where></Query></View>\"}";
    self.api_social_feed1 = get_slm_URL_Intranet() + "/_api/social.feed/my/timelinefeed(MaxThreadCount=6,SortOrder=1)";
    self.api_social_feed2 = get_slm_URL_Intranet() + "/_api/social.feed/my/mentionfeed(MaxThreadCount=8,SortOrder=1)";
    self.string_default_type = "Default";
    self.string_high_type = "High";
    self.string_medium_type = "Medium";
    self.string_low_type = "Low";
    self.string_social_type = "Social";
    self.string_default_title = "Untitled";
    self.string_default_message = "";
    self.string_notificationsetings_listpath = "/Lists/" + slm_LIST_NotificationSettings_Name;
    self.string_company_termStore_group = "Sanlam Group Intranet Terms";
    self.string_company_termSet = "Sanlam Company";
    self.html_social_link = "<a class='notiSocialLink' href='{0}'>{1}</a>";
    self.html_more_link = "{0}<span>... </span><a href='#' class='more'>More</a>";
    self.html_less_link = "<span style='display:none;'>{0}  <a href='#' class='less'>Less</a></span>";
    self.int_max_message = 200;


    // context, notification list
    self.Context = SP.ClientContext.get_current();
    self.StatusList = null;
    self.FolderName = null;
    self.PersonalFolder = null;

    // Notification Board Cache
    self.notificationStatusCache = 'cacheNotificationStatus';
    self.companyTermsCache = 'cacheCompanyTerms';
    self.nboardCacheTime = 480;

    //---------------------------------------------------------
    // Filter Data Object
    //---------------------------------------------------------
    var dataobjectFilter = (function () {
        function dataobjectFilter() {
            var self = this;

            self.FilterName = ko.observable();
            self.Selected = ko.observable();
        }

        return dataobjectFilter;
    })();


    //---------------------------------------------------------
    // Sanlam Personal Setting Data Object
    //---------------------------------------------------------
    var dataobjectStatus = (function () {
        function dataobjectStatus() {
            var self = this;

            self.ID = ko.observable();
            self.NotificationID = ko.observable();
            self.NotificationTitle = ko.observable();
            self.NotificationRead = ko.observable();
        }

        return dataobjectStatus;
    })();


    //---------------------------------------------------------
    // Sanlam Notification Data Object
    //---------------------------------------------------------
    var dataobjectNotification = (function () {
        function dataobjectNotification() {
            var self = this;

            self.ID = ko.observable();
            self.NotificationAuthor = ko.observable();
            self.NotificationAuthorPicture = ko.observable();
            self.NotificationDate = ko.observable();
            self.NotificationTitle = ko.observable();
            self.NotificationMessage = ko.observable();
            self.NotificationType = ko.observable();
            self.NotificationTarget = ko.observable();
            self.NotificationLink = ko.observable();
            self.NotificationRead = ko.observable();
            self.OriginalDate = ko.observable();
        }

        return dataobjectNotification;
    })();

    ViewModelNotificationBoard.dataobjectNotification = dataobjectNotification;

    //-----------------------------------------------------------------------
    // Filtered Notifications
    //----------------------------------------------------------------------- 
    self.notificationArray = ko.computed(function () {
        try {
            var filteredNotifications;
            /*if(!self.changingFilter() && self.loaded() && self.statusLoaded()) {
                // Only update when changing the filter or on 1st load
                filteredNotifications = self.notificationArray();
            } else*/ if (self.selectedFilter() == self.string_latest_filter) {
                // Latest filter
                filteredNotifications = ko.utils.arrayFilter(self.dataArray(), function (item) {
                    return (!item.NotificationRead() || (item.NotificationType() == self.string_social_type));
                });
            } else if (self.selectedFilter() == self.string_read_filter) {
                // Read filter
                filteredNotifications = ko.utils.arrayFilter(self.dataArray(), function (item) {
                    return (item.NotificationRead() && (item.NotificationType() != self.string_social_type));
                });
            } else {
                // No matching filter show everything
                filteredNotifications = self.dataArray();
            }

            // Check if there are filtered items           
            self.hasdata(filteredNotifications.length > 0);

            // TODO: Update sorting later according to business rules
            return filteredNotifications.sort(function (left, right) {
                if (left.NotificationType() == right.NotificationType()) {
                    if (left.OriginalDate() == right.OriginalDate()) {
                        return 0;
                    } else
                        if (left.OriginalDate() > right.OriginalDate()) {
                            return -1;
                        }
                    return 1;
                } else if (left.NotificationType() == self.string_high_type) {
                    return -1;
                } else if (right.NotificationType() == self.string_high_type) {
                    return 1;
                } else if (left.NotificationType() == self.string_medium_type) {
                    return -1;
                } else if (right.NotificationType() == self.string_medium_type) {
                    return 1;
                } else if (left.NotificationType() == self.string_low_type) {
                    return -1;
                } else if (right.NotificationType() == self.string_low_type) {
                    return 1;
                }
            });

        } catch (err) {
            console.log("Error: ViewModelNotificationBoard.notificationArray: " + err);
        }

    });

    //-----------------------------------------------------------------------
    // Populate Mapped Item
    //-----------------------------------------------------------------------
    self.populateMappedItem = function (nid, ntitle, nauthor, npicture, ndate, nmessage, ntype, nlink, ntarget, nread, narray) {
        try {
            obj = new dataobjectNotification();
            parser = new slmParser();

            // map fields
            obj.ID(parser.getValueDefault(nid, "-1"));
            obj.NotificationTitle(parser.getValueDefault(ntitle, self.string_default_title));
            obj.NotificationAuthor(parser.getValueDefault(nauthor, ""));
            obj.NotificationAuthorPicture(parser.getValueDefault(npicture, get_slm_IMAGE_DefaultProfileImage()));
            obj.NotificationDate(parser.getValueDefault(moment(ndate).fromNow(), ""));
            obj.OriginalDate(parser.getValueDefault(ndate, ""));
            obj.NotificationMessage(parser.getValueDefault(nmessage, self.string_default_message));
            obj.NotificationType(parser.getValueDefault(ntype, self.string_default_type));
            obj.NotificationTarget(parser.getValueDefault(ntarget, ""));
            obj.NotificationLink(parser.getValueDefault(nlink, ""));
            obj.NotificationRead(nread);

            narray.push(obj);
        } catch (err) {
            console.log("Error: ViewModelNotificationBoard.populateMappedItem: " + err);
        }
    };

    //-----------------------------------------------------------------------
    // Populate Mapped Status
    //-----------------------------------------------------------------------
    self.populateMappedStatus = function (id, nid, ntitle, nread) {
        try {
            obj = new dataobjectStatus();
            parser = new slmParser();

            // map fields
            obj.ID(parser.getValueDefault(id, "-1"));
            obj.NotificationID(parser.getValueDefault(nid, "-1"));
            obj.NotificationTitle(parser.getValueDefault(ntitle, self.string_default_title));
            obj.NotificationRead(nread);

            self.tempArrNotificationStatus.push(obj);
        } catch (err) {
            console.log("Error: ViewModelNotificationBoard.populateMappedStatus: " + err);
        }
    };

    //-----------------------------------------------------------------------
    // Populate Sanlam Notifications
    //-----------------------------------------------------------------------
    self.populateNotifications = function (data) {
        try {
            var d = data.d.results;
            $.each(d, function (index, result) {
                listItemUrl = "javascript:slmShowModalDialog('" + get_slm_URL_Intranet() + "/Lists/" + slm_LIST_Notification_Name + "/DispForm.aspx?ID=" + result.ID + "&isDlg=1','Test');";
                var url = result.NotificationTarget;
                if (url) {
                    url = url.Url;
                }
                
                var message = result.NotificationMessage;
                if(message.length > self.int_max_message) {
                    message = String.format(self.html_more_link, message.substring(0, self.int_max_message))
                            + String.format(self.html_less_link, message.substring(self.int_max_message));
                }
                self.populateMappedItem(result.ID, result.Title, null, "", result.NotificationDate, message, result.NotificationType, url, listItemUrl, false, self.tempArrNotifications);                              

            });
        } catch (err) {
            console.log("Error: ViewModelNotificationBoard.populateNotifications: " + err);
        }
    };

    //-----------------------------------------------------------------------
    // Populate Sanlam Notifications
    //-----------------------------------------------------------------------
    self.updateNotifications = function (data) {
        try {
            var d = data.d.results;

            $.each(self.tempArrNotifications, function (i, tmpNoti) {
                $.each(d, function (index, result) {
                    if (tmpNoti.ID() == result.ID) {
                        tmpNoti.NotificationAuthor(parser.getValueDefault(result.NotificationAuthor.Title, ""));
                        return false;
                    }
                });
            });
        } catch (err) {
            console.log("Error: ViewModelNotificationBoard.updateNotifications: " + err);
        }
    };


    //-----------------------------------------------------------------------
    // Populate Social feed items
    //-----------------------------------------------------------------------
    self.populateSocial = function (data, feedType) {
        try {
            var d = data.d.SocialFeed.Threads.results;
            $.each(d, function (index, result) {
                var socialHtml = result.RootPost.Text;

                var authorIndex = 0;
                var socialTitle = "";
                var socialMessage = "";
                if(result.RootPost) {
                  authorIndex = result.RootPost.AuthorIndex;
                  var author = result.Actors.results[authorIndex];
                  socialTitle = self.buildSocialLink(author.Name, author.Uri, feedType);
                  socialMessage = self.buildOverlay(result.RootPost, result.Actors, feedType);
                }
                
                if(result.PostReference && result.PostReference.Post) {
                  var threadOwnerIndex = result.PostReference.ThreadOwnerIndex;               
                  if(threadOwnerIndex != authorIndex) {
                    var owner = result.Actors.results[threadOwnerIndex];
                    socialTitle += " > " + self.buildSocialLink(owner.Name, owner.Uri, feedType);
                  }
                  socialMessage = self.buildOverlay(result.PostReference.Post, result.Actors, feedType);
                }                               

                // get author index
                listItemUrl = result.Permalink;
                self.populateMappedItem("-1", socialTitle, "", result.Actors.results[authorIndex].ImageUri, result.RootPost.ModifiedTime, socialMessage, self.string_social_type, "", "", false, self.tempArrSocial);
            });
        } catch (err) {
            console.log("Error: ViewModelNotificationBoard.populateSocial: " + err);
        }
    };


    //-----------------------------------------------------------------------
    // Build Social feed overlay
    //-----------------------------------------------------------------------
    self.buildOverlay = function (post, actors, feedType) {
        try {
         
            if(!post.Overlays.results || post.Overlays.results.length==0) {
                return post.Text;
            }
        
            var reversedOverlays = post.Overlays.results.reverse(),
                completeHtml = post.Text;             
            if(completeHtml.length <= self.int_max_message) {
                $.each(reversedOverlays, function (i, overlay) {
                    try {
                        var overlayText = post.Text.substring(overlay.Index, (overlay.Index + overlay.Length));
                        var overlayLink = overlay.LinkUri; // Link overlay
                        if(overlay.OverlayType === 1) { // Author overlay
                            var author = actors.results[overlay.ActorIndexes.results[0]];
                            overlayLink = author.Uri;
                        } 
    
                        var overlayHtml = self.buildSocialLink(overlayText, overlayLink, feedType);
                        completeHtml = completeHtml.substring(0, overlay.Index) + overlayHtml + completeHtml.substring((overlay.Index + overlay.Length));
                    } catch (fiErr) {
                        console.log("Error: ViewModelNotificationBoard.buildOverlay: "+ feedType +" item error: " + fiErr);
                    }
                });
            } else {
                var showHtml = completeHtml.substring(0, self.int_max_message),
                    hideHtml = completeHtml.substring(self.int_max_message);
                $.each(reversedOverlays, function (i, overlay) {
                    try {
                        var startIndex = overlay.Index,
                            endIndex = ((overlay.Index + overlay.Length) > self.int_max_message) ? self.int_max_message : (overlay.Index + overlay.Length);                           
                        if(startIndex > self.int_max_message) {
                            return;
                        }
                        var overlayText = post.Text.substring(startIndex, endIndex),
                            overlayLink = overlay.LinkUri; // Link overlay
                        if(overlay.OverlayType === 1) { // Author overlay
                            var author = actors.results[overlay.ActorIndexes.results[0]];
                            overlayLink = author.Uri;
                        } 
    
                        var overlayHtml = self.buildSocialLink(overlayText, overlayLink, feedType);
                        showHtml = showHtml.substring(0, startIndex) + overlayHtml + showHtml.substring(endIndex);
                    } catch (fiErr) {
                        console.log("Error: ViewModelNotificationBoard.buildOverlay-->start: "+ feedType +" item error: " + fiErr);
                    }
                });
                $.each(reversedOverlays, function (i, overlay) {
                    try {
                        var endIndex = (overlay.Index + overlay.Length),
                            startIndex = (overlay.Index < self.int_max_message) ? self.int_max_message :  overlay.Index;
                        if(endIndex < self.int_max_message) {
                            return;
                        }
                        var overlayText = post.Text.substring(startIndex, endIndex),
                            overlayLink = overlay.LinkUri; // Link overlay
                        if(overlay.OverlayType === 1) { // Author overlay
                            var author = actors.results[overlay.ActorIndexes.results[0]];
                            overlayLink = author.Uri;
                        } 
    
                        var overlayHtml = self.buildSocialLink(overlayText, overlayLink, feedType);
                        hideHtml = hideHtml.substring(0, startIndex-self.int_max_message) + overlayHtml + hideHtml.substring(endIndex-self.int_max_message);
                    } catch (fiErr) {
                        console.log("Error: ViewModelNotificationBoard.buildOverlay-->start: "+ feedType +" item error: " + fiErr);
                    }
                });
                
                completeHtml = String.format(self.html_more_link, showHtml)
                            + String.format(self.html_less_link, hideHtml);
            }
            
            return completeHtml;
        } catch (err) {
            console.log("Error: ViewModelNotificationBoard.buildOverlay: " + feedType +" error: " + err);
        }
    };


    //-----------------------------------------------------------------------
    // Build Social feed link
    //-----------------------------------------------------------------------
    self.buildSocialLink = function (text, link, feedType) {
        try {
        
            if(!link){
                return text;
            }
        
            return String.format(self.html_social_link, link,  text);
            
            return completeHtml;
        } catch (err) {
            console.log("Error: ViewModelNotificationBoard.buildSocialLink: " + feedType +" error: " + err);
        }
    };



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
    // Main load event
    //-----------------------------------------------------------------------
    self.load = function () {
        try {

            // Load Filters
            self.loadFilters();

            var profile = new slmUserProfileManager();
            var result = profile.GetMyPropertiesCached();
            result.done(
                function (_result) {
                    parser = new slmParser();

                    self.userCompany = parser.getValueFromKey(slm_User_Properties, "Company", "");
                    self.loadData();
                });


        } catch (err) {
            console.log("Error: ViewModelNotificationBoard.load: " + err);
        }

    };

    //-----------------------------------------------------------------------
    // Load data
    //-----------------------------------------------------------------------
    self.loadData = function () {

        // Load Notifications
        try {

            var companyFilter = "<IsNull><FieldRef Name='SanlamCompany'/></IsNull>";
            if (self.userCompany) {
                companyFilter = String.format("<Or><Eq><FieldRef Name='SanlamCompany'/><Value Type='TaxonomyFieldType'>{0}</Value></Eq><IsNull><FieldRef Name='SanlamCompany'/></IsNull></Or>", self.userCompany);
            }

            var noti_q = self.api_notification_query.replace("{0}", companyFilter);

            $.when(
                self.spAJAXpostJSON(noti_q)
                .done(function (data) {
                    self.populateNotifications(data);
                })
            .always(function () {
                // get ISO date in query
                date = new Date();
                isoDate = date.toISOString();

                var noti_auth_q = String.format(self.api_notification_author_query, isoDate);

                $.when(
                    self.spAJAXgetJSON(noti_auth_q)
                    .done(function (data) {
                        self.updateNotifications(data);
                        $.each(self.tempArrNotifications, function (index, result) {
                            self.dataArray.push(result);
                        });
                    }))
                .always(function () {
                    $.when(
                        self.spAJAXgetJSON(self.api_social_feed1)
                        .done(function (data) {
                            try {
                                /*var d = data.d.SocialFeed.Threads.results;
                                $.each(d, function (index, result) {
                                    try {
                                        if (result.Actors && result.RootPost) { //&& result.Permalink
                                            // get author index
                                            authorIndex = 0;
                                            //listItemUrl = result.Permalink;
                                            var listItemUrl = self.mysite();
                                            self.populateMappedItem("-1", result.RootPost.Text, result.Actors.results[authorIndex].Name, result.Actors.results[authorIndex].ImageUri, result.RootPost.ModifiedTime, result.RootPost.Text, self.string_social_type, listItemUrl, listItemUrl, false, self.tempArrSocial);
                                        } else {
                                            console.log("Error: ViewModelNotificationBoard.loadData: Invalid (rogue!) feed item with url: " + result.Permalink);
                                        }
                                    } catch (fiErr) {
                                        console.log("Error: ViewModelNotificationBoard.loadData: Timeline feed item error: " + fiErr);
                                    }
                                });*/
                                self.populateSocial(data, "Timeline Feed");
                            } catch (fiErr) {
                                console.log("Error: ViewModelNotificationBoard.loadData: Timeline Feeds error: " + fiErr);
                            }
                        }))
                    .always(function () {
                        $.when(
                            self.spAJAXgetJSON(self.api_social_feed2)
                            .done(function (data2) {
                                try {
                                    /*var d2 = data2.d.SocialFeed.Threads.results;
                                    $.each(d2, function (index, result) {
                                        try {
                                            if (result.Actors && result.PostReference && result.RootPost && result.PostReference.Post) { //&& result.Permalink
                                                // get author index
                                                authorIndex = result.PostReference.Post.AuthorIndex;
                                                //listItemUrl = result.Permalink;
                                                var listItemUrl = self.mysite();
                                                self.populateMappedItem("-1", result.RootPost.Text, result.Actors.results[authorIndex].Name, result.Actors.results[authorIndex].ImageUri, result.RootPost.ModifiedTime, result.PostReference.Post.Text, self.string_social_type, listItemUrl, listItemUrl, false, self.tempArrSocial);
                                            } else {
                                                console.log("Error: ViewModelNotificationBoard.loadData: Invalid (rogue!) mention with url: " + result.Permalink);
                                            }
                                        } catch (mErr) {
                                            console.log("Error: ViewModelNotificationBoard.loadData: Mention error: " + mErr);
                                        }
                                    });*/
                                    self.populateSocial(data2, "Mention");
                                } catch (mErr2) {
                                    console.log("Error: ViewModelNotificationBoard.loadData: Mentions problem: " + mErr2);
                                }
                            }))
                        .always(function () {
                            $.each(self.tempArrSocial, function (index, result) {
                                self.dataArray.push(result);
                            });
                            self.FinishedLoading();
                        })
                    })
                })
            }
            ));
        } catch (err) {
            console.log("Error: ViewModelNotificationBoard.loadData: " + err);
        }
    };

    //-----------------------------------------------------------------------
    // Load filters
    //-----------------------------------------------------------------------
    self.loadFilters = function () {
        try {
            // Latest
            var objLatest = new dataobjectFilter();
            objLatest.FilterName(self.string_latest_filter);
            objLatest.Selected(true);
            self.filterArray.push(objLatest);

            // Read
            var objRead = new dataobjectFilter();
            objRead.FilterName(self.string_read_filter);
            objRead.Selected(false);
            self.filterArray.push(objRead);

            // Set default filter
            self.selectedFilter(self.string_latest_filter);
        } catch (err) {
            console.log("Error: ViewModelNotificationBoard.loadFilters: " + err);
        }
    };


    //-----------------------------------------------------------------------
    // Finish up loading
    //-----------------------------------------------------------------------
    self.FinishedLoading = function () {
        try {
            self.loaded(true);
            var minimized_elements = $('.notiMessage');
         
            $('a.more', minimized_elements).click(function (event) {
                event.preventDefault();
                $(this).hide().prev().hide();
                $(this).next().show();
            });

            $('a.less', minimized_elements).click(function (event) {
                event.preventDefault();
                $(this).parent().hide().prev().show().prev().show();
            });
            if (self.statusLoaded()) {
                self.processNotificationStatuses();
            }
        } catch (err) {
            console.log("Error: ViewModelNotificationBoard.FinishedLoading: " + err);
        }
    };

    //-----------------------------------------------------------------------
    // Get the notification status aka if notifications have been read or not
    //-----------------------------------------------------------------------
    self.getNotificationStatus = function (checkForFolder) {
        var profile = new slmUserProfileManager();
        var result = profile.GetMyPropertiesCached();
        result.done(
            function (_result) {
                parser = new slmParser();

                var accountName = parser.getValueFromKey(slm_User_Properties, "AccountName", "");
                if (accountName != "") {
                    self.FolderName = String.RemoveAccountDomain(accountName);
                    if (checkForFolder) {
                        self.checkForNotificatonFolder();
                    }
                }
            });
    };

    //-----------------------------------------------------------------------
    // Get the cached notification status
    //-----------------------------------------------------------------------
    self.getNotificationStatusCached = function () {

        try {
            if (self.tempArrNotificationStatus == null || self.tempArrNotificationStatus == undefined || self.tempArrNotificationStatus.length == 0) {
                var nboardCache = new slmSessionStorage();
                nboardCache.Get(self.notificationStatusCache,
                    function () {
                        self.getNotificationStatus(true);
                    },
                    function (data) {
                        var notificationStatusArray = JSON.parse(data);
                        $.each(notificationStatusArray, function (index, status) {
                            self.populateMappedStatus(status.ID, status.NotificationID, status.NotificationTitle, status.NotificationRead);
                        });

                        // Ensure the status list is loaded
                        if (!self.StatusList) {
                            var web = self.Context.get_web();
                            self.StatusList = web.get_lists().getByTitle(slm_LIST_NotificationSettings_Title);
                            self.Context.load(self.StatusList);
                            self.Context.executeQueryAsync(function () { self.getNotificationStatus(false); },
                                function (sender, args) {
                                    self.failure("getNotificationStatusCached", args)
                                });
                        }
                    });
            }
        } catch (err) {
            console.log("Error: ViewModelNotificationBoard.getNotificationStatusCached:" + err.message);
        }

        self.statusLoaded(true);

        if (self.loaded()) {
            self.processNotificationStatuses();
        }
    };

    //-----------------------------------------------------------------------
    // Check for the Personal Notification folder
    //-----------------------------------------------------------------------
    self.checkForNotificatonFolder = function () {
        try {
            var web = self.Context.get_web();
            self.StatusList = web.get_lists().getByTitle(slm_LIST_NotificationSettings_Title);
            self.Context.load(self.StatusList);
            self.PersonalFolder = web.getFolderByServerRelativeUrl(self.string_notificationsetings_listpath + "/" + self.FolderName);
            self.Context.load(self.PersonalFolder);
            self.Context.executeQueryAsync(
                function () {
                    if (self.PersonalFolder) {
                        self.getNotificationFolderItems();
                    } else {
                        self.createNotificationFolder();
                    }
                },
                function (sender, args) {
                    self.failure("checkForNotificatonFolder", args);

                    if (args.get_message() == 'File Not Found.') {
                        self.createNotificationFolder();
                    }
                });
        } catch (err) {
            console.log("Error: ViewModelNotificationBoard.checkForNotificatonFolder: " + err);
        }
    };

    //-----------------------------------------------------------------------
    // Create the Personal Notification folder
    //-----------------------------------------------------------------------
    self.createNotificationFolder = function () {
        try {
            var newFolder = new SP.ListItemCreationInformation();
            newFolder.set_underlyingObjectType(SP.FileSystemObjectType.folder);
            newFolder.set_folderUrl(get_slm_URL_Intranet() + self.string_notificationsetings_listpath);
            newFolder.set_leafName(self.FolderName);
            var folderItem = self.StatusList.addItem(newFolder);
            folderItem.set_item("Title", self.FolderName);
            folderItem.update();
            self.Context.load(folderItem);
            self.Context.executeQueryAsync(
                function () {
                    if (folderItem) {
                        self.checkForNotificatonFolder();
                    } else {
                        self.logFailure("createNotificationFolder", "Failed to create personal folder.");
                    }
                },
                function (sender, args) {
                    self.failure("createNotificationFolder", args);
                });
        } catch (err) {
            console.log("Error: ViewModelNotificationBoard.createNotificationFolder: " + err);
        }
    };

    //-----------------------------------------------------------------------
    // Create the Notification itStatusem
    //-----------------------------------------------------------------------
    self.createNotificationStatus = function (nid, ntitle, nread) {
        try {
            var newItem = new SP.ListItemCreationInformation();
            newItem.set_folderUrl(self.string_notificationsetings_listpath + "/" + self.FolderName);
            var settingItem = self.StatusList.addItem(newItem);
            settingItem.set_item("NotificationID", nid);
            settingItem.set_item("Title", ntitle);
            settingItem.set_item("NotificationRead", nread);
            settingItem.update();
            self.Context.load(settingItem);
            self.Context.executeQueryAsync(
                function () {
                    if (settingItem) {
                        self.populateMappedStatus(settingItem.get_id(), settingItem.get_item("NotificationID"), settingItem.get_item("Title"), settingItem.get_item("NotificationRead"));

                        nboardCache = new slmSessionStorage();
                        nboardCache.Add(self.notificationStatusCache, ko.toJSON(self.tempArrNotificationStatus), self.nboardCacheTime);

                    } else {
                        self.logFailure("createNotificationStatus", "Failed to create personal item.");
                    }
                },
                function (sender, args) {
                    self.failure("createNotificationStatus", args);
                });
        } catch (err) {
            console.log("Error: ViewModelNotificationBoard.createNotificationStatus: " + err);
        }
    };

    //-----------------------------------------------------------------------
    // Get the Personal Notification folder items
    //-----------------------------------------------------------------------
    self.getNotificationFolderItems = function () {
        try {
            var camlQuery = new SP.CamlQuery();
            camlQuery.set_viewXml("<View><Query><Where><Eq><FieldRef Name='Author'/><Value Type='Integer'><UserID Type='Integer'/></Value></Eq></Where><OrderBy><FieldRef Name='NotificationID'/></OrderBy></Query></View>");
            camlQuery.set_folderServerRelativeUrl(self.string_notificationsetings_listpath + "/" + self.FolderName);
            var myNotifications = self.StatusList.getItems(camlQuery);
            self.Context.load(myNotifications);
            self.Context.executeQueryAsync(
                function () {
                    if (myNotifications) {
                        var nItemEnum = myNotifications.getEnumerator();
                        while (nItemEnum.moveNext()) {
                            var nItem = nItemEnum.get_current();
                            self.populateMappedStatus(nItem.get_id(), nItem.get_item("NotificationID"), nItem.get_item("Title"), nItem.get_item("NotificationRead"));
                        }

                        nboardCache = new slmSessionStorage();
                        nboardCache.Add(self.notificationStatusCache, ko.toJSON(self.tempArrNotificationStatus), self.nboardCacheTime);
                        self.statusLoaded(true);

                        if (self.loaded()) {
                            self.processNotificationStatuses();
                        }

                    } else {
                        self.logFailure("getNotificationFolderItems", "Failed to retrieve personal notifications.");
                    }
                },
                function (sender, args) {
                    self.failure("getNotificationFolderItems", args);
                });
        } catch (err) {
            console.log("Error: ViewModelNotificationBoard.getNotificationFolderItems: " + err);
        }
    };

    //-----------------------------------------------------------------------
    // Process the items so they match back to the Notifications
    //-----------------------------------------------------------------------
    self.processNotificationStatuses = function () {
        try {

            ko.utils.arrayForEach(self.dataArray(), function (noti) {
                $.each(self.tempArrNotificationStatus, function (index, setting) {
                    if (noti.ID() == setting.NotificationID()) {
                        noti.NotificationRead(setting.NotificationRead());
                    }
                });
                true
            });;

            //self.changingFilter(true);

        } catch (err) {
            console.log("Error: ViewModelNotificationBoard.processNotificationStatuses: " + err);
        }
    };

    //-----------------------------------------------------------------------
    // Csom call failure
    //-----------------------------------------------------------------------
    self.failure = function (sender, args) {
        if (args) {
            self.logFailure(sender + "--> failure(CSOM)", args.get_message());
        }
    };

    //-----------------------------------------------------------------------
    // log failure for viewmodel
    //-----------------------------------------------------------------------
    self.logFailure = function (method, message) {
        console.log("Error: ViewModelNotificationBoard." + method + ": " + message);
    };

    //-----------------------------------------------------------------------
    // CLICK EVENT - Mark Notification as Read
    //-----------------------------------------------------------------------
    self.markAsRead = function () {
        try {
            if (!self.savingStatus()) {
                self.savingStatus(true);
                this.NotificationRead(!this.NotificationRead());
                var nid = this.ID();
                var nread = this.NotificationRead();
                if (nid != "-1") {

                    var exists = false;
                    $.each(self.tempArrNotificationStatus, function (index, setting) {
                        if (nid == setting.NotificationID()) {

                            var settingItem = self.StatusList.getItemById(setting.ID());
                            settingItem.set_item("NotificationRead", nread);
                            settingItem.update();
                            self.Context.load(settingItem);
                            self.Context.executeQueryAsync(
                                function () {
                                    if (settingItem) {
                                        setting.NotificationRead(nread);

                                        nboardCache = new slmSessionStorage();
                                        nboardCache.Add(self.notificationStatusCache, ko.toJSON(self.tempArrNotificationStatus), self.nboardCacheTime);

                                    } else {
                                        self.logFailure("markAsRead", "Failed to update read status.");
                                    }
                                },
                                function (sender, args) {
                                    self.failure("markAsRead", args);
                                });
                            exists = true;
                        }
                    });

                    if (!exists) {
                        self.createNotificationStatus(nid, this.NotificationTitle(), this.NotificationRead());
                    }
                }

                self.savingStatus(false);
            }
        }
        catch (err) {
            console.log("Error->ViewModelNotificationBoard: markAsRead click: " + err);
        }
    };

    //-----------------------------------------------------------------------
    // CLICK EVENT - Change the Notification Filter
    //-----------------------------------------------------------------------
    self.changeFilter = function () {
        try {
            if (!self.changingFilter()) {
                self.changingFilter(true);

                self.selectedFilter(this.FilterName());
                ko.utils.arrayForEach(self.filterArray(), function (filter) {
                    filter.Selected(filter.FilterName() == self.selectedFilter());
                });

                self.changingFilter(false);
            }
        }
        catch (err) {
            console.log("Error->ViewModelNotificationBoard: changeFilter click: " + err);
        }
    };
};

//-----------------------------------------------------------------------
// Document ready and SP.ClientContent available
//-----------------------------------------------------------------------
$(document).ready(function () {
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {
        SP.SOD.executeFunc('userprofile', 'SP.Social.SocialFollowingManager', function () {
            try {
                // create model and manual bind
                var viewModelBaseElement = document.getElementById("slmNotificationBoard");

                // bind if viewmodel element found
                if (viewModelBaseElement) {
                    var viewModelNBoard = new ViewModelNotificationBoard();

                    ko.applyBindings(viewModelNBoard, viewModelBaseElement);
                    viewModelNBoard.load();
                    viewModelNBoard.getNotificationStatusCached();
                }
            }
            catch (err) {
                console.log("Error->ViewModelNotificationBoard: Document ready / ApplyBindings: " + err);
            }
        })
    });
});