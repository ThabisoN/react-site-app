//---------------------------------------------------------------------------
// Sanlam Groups ViewModel
// Author: Christo Greeff, 22 May 2015
//---------------------------------------------------------------------------
var ViewModelGroups = function () {
    var self = this;

    // observables
    self.loadedCommunity = ko.observable(false);
    self.hasdataCommunity = ko.observable(false);
    self.loadingCommunity = ko.observable(false);
    self.dataCommunity = ko.observableArray();

    self.loadedForum = ko.observable(false);
    self.hasdataForum = ko.observable(false);
    self.loadingForum = ko.observable(false);
    self.dataForum = ko.observableArray();

    // properties
    self.postquery = "/_api/search/postquery";
    self.S_Community = "Community";
    self.S_Forum = "Forum";

    //---------------------------------------------------------
    // Community Item
    //---------------------------------------------------------
    var doCommunityItem = (function () {
        function doCommunityItem() {
            var self = this;

            self.Title = ko.observable();
            self.Description = ko.observable();
            self.Url = ko.observable();
            self.ViewsRecent = ko.observable();
            self.LastModifiedTime = ko.observable();
        }

        return doCommunityItem;
    })();

    ViewModelGroups.doCommunityItem = doCommunityItem;

    //-----------------------------------------------------------------------
    // Load data - Communities
    //-----------------------------------------------------------------------
    self.loadDataCommunities = function () {
        searchQry = {
            'request': {
                '__metadata': { 'type': 'Microsoft.Office.Server.Search.REST.SearchRequest' },
                'Querytext': 'WebTemplate:Community AND Title:' + self.S_Community,
                'RowLimit': '4',
                'EnableQueryRules': 'false',
                'TrimDuplicates': 'false',
                'SelectProperties': {
                    'results': [
                        'Title',
                        'SiteDescription',
                        'OriginalPath',
                        'ViewsRecent',
                        'LastModifiedTime',
                    ]
                },
                'SortList': {
                    'results': [
                        {
                            'Property': 'ViewsRecent',
                            'Direction': '1'
                        }
                    ]
                }
            }
        };

        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + self.postquery,
            dataType: "json",
            data: JSON.stringify(searchQry),
            type: "POST",
            contentType: "application/json;odata=verbose",
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                var results = data.d.postquery.PrimaryQueryResult.RelevantResults.Table.Rows.results;
                parser = new slmParser();

                $.each(results, function (index, result) {
                    obj = new doCommunityItem();
                    obj.Title(parser.getValueFromKey(result.Cells.results, "Title", ""));
                    obj.Description(parser.getValueFromKey(result.Cells.results, "SiteDescription", "No description available."));
                    obj.Url(parser.getValueFromKey(result.Cells.results, "OriginalPath", ""));
                    obj.ViewsRecent(parser.getValueFromKey(result.Cells.results, "ViewsRecent", ""));
                    obj.LastModifiedTime(parser.getValueFromKey(result.Cells.results, "LastModifiedTime", ""));

                    self.dataCommunity.push(obj);
                });

                self.FinishLoadingCommunity();
            },
            error: function (jqxr, errorCode, errorThrown) {
                console.log("Error: ViewModelGroups.loadDataCommunities: " + errorThrown);
            }
        });
    }

    //-----------------------------------------------------------------------
    // Start loading Communities
    //-----------------------------------------------------------------------
    self.loadCommunities = function () {
        self.loadingCommunity(true);
        self.loadDataCommunities();
    }

    //-----------------------------------------------------------------------
    // Finish up loading Communities
    //-----------------------------------------------------------------------
    self.FinishLoadingCommunity = function () {
        hasData = (self.dataCommunity().length > 0);
        self.hasdataCommunity(hasData);
        self.loadedCommunity(true);
        self.loadingCommunity(false);
    }

    //-----------------------------------------------------------------------
    // Load data - Forums
    //-----------------------------------------------------------------------
    self.loadDataForums = function () {
        searchQry = {
            'request': {
                '__metadata': { 'type': 'Microsoft.Office.Server.Search.REST.SearchRequest' },
                'Querytext': 'WebTemplate:Community AND Title:' + self.S_Forum,
                'RowLimit': '4',
                'EnableQueryRules': 'false',
                'TrimDuplicates': 'false',
                'SelectProperties': {
                    'results': [
                        'Title',
                        'SiteDescription',
                        'OriginalPath',
                        'ViewsRecent',
                        'LastModifiedTime',
                    ]
                },
                'SortList': {
                    'results': [
                        {
                            'Property': 'ViewsRecent',
                            'Direction': '1'
                        }
                    ]
                }
            }
        };

        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + self.postquery,
            dataType: "json",
            data: JSON.stringify(searchQry),
            type: "POST",
            contentType: "application/json;odata=verbose",
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                var results = data.d.postquery.PrimaryQueryResult.RelevantResults.Table.Rows.results;
                parser = new slmParser();

                $.each(results, function (index, result) {
                    obj = new doCommunityItem();
                    obj.Title(parser.getValueFromKey(result.Cells.results, "Title", ""));
                    obj.Description(parser.getValueFromKey(result.Cells.results, "SiteDescription", "No description available."));
                    obj.Url(parser.getValueFromKey(result.Cells.results, "OriginalPath", ""));
                    obj.ViewsRecent(parser.getValueFromKey(result.Cells.results, "ViewsRecent", ""));
                    obj.LastModifiedTime(parser.getValueFromKey(result.Cells.results, "LastModifiedTime", ""));

                    self.dataForum.push(obj);
                });

                self.FinishLoadingForum();
            },
            error: function (jqxr, errorCode, errorThrown) {
                console.log("Error: ViewModelGroups.loadDataForums: " + errorThrown);
            }
        });
    }

    //-----------------------------------------------------------------------
    // Start loading Forums
    //-----------------------------------------------------------------------
    self.loadForums = function () {
        self.loadingForum(true);
        self.loadDataForums();
    }

    //-----------------------------------------------------------------------
    // Finish up loading Forums
    //-----------------------------------------------------------------------
    self.FinishLoadingForum = function () {
        hasData = (self.dataForum().length > 0);
        self.hasdataForum(hasData);
        self.loadedForum(true);
        self.loadingForum(false);
    }
};

//-----------------------------------------------------------------------
// Document ready and SP.ClientContent available
//-----------------------------------------------------------------------
$(document).ready(function () {
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {
        try {
            // create model and manual bind
            var elementGroups = document.getElementById("slmCommunityGroups");

            // bind if viewmodel element found
            if (elementGroups) {
                var viewModelGroups = new ViewModelGroups();

                ko.applyBindings(viewModelGroups, elementGroups);
                viewModelGroups.loadCommunities();
                viewModelGroups.loadForums();
            }
        }
        catch (err) {
            console.log("Error->ViewModelGroups: Document ready / ApplyBindings: " + err);
        }
    });
});