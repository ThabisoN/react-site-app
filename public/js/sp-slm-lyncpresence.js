//========================================================================
// Lync Presence Routines
// Author: Christo Greeff, 09 April 2015
// Adapted from: http://splyncpresence.codeplex.com/
//========================================================================

(function ($) {
    $.fn.createpresence = function (accountName, options) {
        RegisterSod("Strings.js", "/_layouts/15/Strings.js");
        var settings = $.extend({
            type: "default",
            redirectToProfile: true
        }, options);

        var $this = $(this);
        var name, title, sip, personalUrl, pictureUrl, department;
        personalUrl = "#";
        $this.html("");

        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@accountName)?@accountName='" + accountName + "'",
            type: "GET",
            headers: {
                "accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                name = data.d.DisplayName;
                title = data.d.Title;
                try {
                    sip = $.grep(data.d.UserProfileProperties.results, function (e) { return e.Key == "SPS-SipAddress"; })[0].Value;
                }
                catch (e) {
                    sip = data.d.Email;
                }
                if (settings.redirectToProfile) {
                    personalUrl = data.d.PersonalUrl;
                }
                if (settings.type == "withpicture") {
                    try {
                        department = $.grep(data.d.UserProfileProperties.results, function (e) { return e.Key == "Department"; })[0].Value;
                    }
                    catch (e) {
                        department = '';
                    }
                }
                pictureUrl = _spPageContextInfo.webAbsoluteUrl + "/_layouts/15/userphoto.aspx?accountname=" + accountName;
                var uniqueID = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                var html = "";

                if (settings.type == "default") {
                    html = "<span class='ms-imnSpan'><a onmouseover='IMNShowOOUI();' onmouseout='IMNHideOOUI()'  href='" + personalUrl + "' class='ms-imnlink ms-spimn-presenceLink' ><span class='ms-spimn-presenceWrapper ms-imnImg ms-spimn-imgSize-16x16'><img name='imnmark' title='' ShowOfflinePawn='1' class='ms-spimn-img ms-spimn-presence-offline-16x16x32' src='/_layouts/15/images/spimn.png?rev=23' alt='User Presence' sip='" + sip + "' id='imn_" + uniqueID + ",type=sip' /></span>" + name + "</a></span>"
                }
                else if (settings.type == "withpicturesmall") {
                    pictureUrl += "&size=S";
                    html = "<span class='ms-imnSpan ms-tableCell'><a onmouseover='IMNShowOOUI();' onmouseout='IMNHideOOUI()' style='padding: 0px;'><div class='ms-tableCell'><span class='ms-imnlink ms-spimn-presenceLink'><span class='ms-spimn-presenceWrapper ms-spimn-imgSize-5x36'><img name='imnmark' title='' showofflinepawn='1' class='ms-spimn-img ms-spimn-presence-offline-5x36x32' src='/_layouts/15/images/spimn.png' sip='" + sip + "' id='imn_" + uniqueID + ",type=sip' /></span></span></div><div class='ms-tableCell ms-verticalAlignTop'><div class='ms-peopleux-userImgDiv'><span><img title='' showofflinepawn='1' class='ms-hide' src='/_layouts/15/images/spimn.png' alt='Offline' sip='" + sip + "' /><span class='ms-peopleux-imgUserLink'><span class='ms-peopleux-userImgWrapper' style='width: 36px; height: 36px;'><img class='userIMG' style='width: 36px; height: 36px; clip: rect(0px, 36px, 36px, 0px);' src='" + pictureUrl + "' alt='" + name + "' /></span></span></span></div></div></a></span><div class='ms-tableCell ms-verticalAlignTop' style='padding-left: 10px;'><span><a href='" + personalUrl + "'>" + name + "</a></span><span style='font-size: 0.9em; display: block;'>" + title + "</span></div>";
                }
                else if (settings.type == "withpicture") {
                    html = "<span class='ms-imnSpan ms-tableCell'><a onmouseover='IMNShowOOUI();' onmouseout='IMNHideOOUI()' style='padding: 0px;'><div class='ms-tableCell'><span class='ms-imnlink ms-spimn-presenceLink'><span class='ms-spimn-presenceWrapper ms-spimn-imgSize-8x72'><img name='imnmark' title='' showofflinepawn='1' class='ms-spimn-img ms-spimn-presence-offline-8x72x32' src='/_layouts/15/images/spimn.png' sip='" + sip + "' id='imn_" + uniqueID + ",type=sip' /></span></span></div><div class='ms-tableCell ms-verticalAlignTop'><div class='ms-peopleux-userImgDiv'><span><img title='' showofflinepawn='1' class='ms-hide' src='/_layouts/15/images/spimn.png' alt='Offline' sip='" + sip + "' /><span class='ms-peopleux-imgUserLink'><span class='ms-peopleux-userImgWrapper' style='width: 72px; height: 72px;'><img class='userIMG' style='width: 72px; height: 72px; clip: rect(0px, 72px, 72px, 0px);' src='" + pictureUrl + "' alt='" + name + "' /></span></span></span></div></div></a></span><div class='ms-tableCell ms-verticalAlignTop' style='padding-left: 10px;'><span><a href='" + personalUrl + "'>" + name + "</a></span><span style='font-size: 0.9em; display: block;'>" + title + "</span><span style='font-size: 0.9em; display: block;'>" + department + "</span></div>";
                }
                else if (settings.type == "pictureonlysmall") {
                    pictureUrl += "&size=S";
                    html = "<span class='ms-imnSpan ms-tableCell'><a onmouseover='IMNShowOOUI();' onmouseout='IMNHideOOUI()' style='padding: 0px;'><div class='ms-tableCell'><span class='ms-imnlink ms-spimn-presenceLink'><span class='ms-spimn-presenceWrapper ms-spimn-imgSize-5x36'><img name='imnmark' title='' showofflinepawn='1' class='ms-spimn-img ms-spimn-presence-offline-5x36x32' src='/_layouts/15/images/spimn.png' sip='" + sip + "' id='imn_" + uniqueID + ",type=sip' /></span></span></div><div class='ms-tableCell ms-verticalAlignTop'><div class='ms-peopleux-userImgDiv'><span><img title='' showofflinepawn='1' class='ms-hide' src='/_layouts/15/images/spimn.png' alt='Offline' sip='" + sip + "' /><span class='ms-peopleux-imgUserLink'><span class='ms-peopleux-userImgWrapper' style='width: 36px; height: 36px;'><img class='userIMG' style='width: 36px; height: 36px; clip: rect(0px, 36px, 36px, 0px);' src='" + pictureUrl + "' alt='" + name + "' /></span></span></span></div></div></a></span>";
                }
                else if (settings.type == "pictureonly") {
                    html = "<span class='ms-imnSpan ms-tableCell'><a onmouseover='IMNShowOOUI();' onmouseout='IMNHideOOUI()' style='padding: 0px;'><div class='ms-tableCell'><span class='ms-imnlink ms-spimn-presenceLink'><span class='ms-spimn-presenceWrapper ms-spimn-imgSize-8x72'><img name='imnmark' title='' showofflinepawn='1' class='ms-spimn-img ms-spimn-presence-offline-8x72x32' src='/_layouts/15/images/spimn.png' sip='" + sip + "' id='imn_" + uniqueID + ",type=sip' /></span></span></div><div class='ms-tableCell ms-verticalAlignTop'><div class='ms-peopleux-userImgDiv'><span><img title='' showofflinepawn='1' class='ms-hide' src='/_layouts/15/images/spimn.png' alt='Offline' sip='" + sip + "' /><span class='ms-peopleux-imgUserLink'><span class='ms-peopleux-userImgWrapper' style='width: 72px; height: 72px;'><img class='userIMG' style='width: 72px; height: 72px; clip: rect(0px, 72px, 72px, 0px);' src='" + pictureUrl + "' alt='" + name + "' /></span></span></span></div></div></a></span>";
                }
                else if (settings.type == "presenceonly") {
                    html = "<span class='ms-imnSpan'><a onmouseover='IMNShowOOUI();' onmouseout='IMNHideOOUI()'  href='" + personalUrl + "' class='ms-imnlink ms-spimn-presenceLink' ><span class='ms-spimn-presenceWrapper ms-imnImg ms-spimn-imgSize-16x16'><img name='imnmark' title='' ShowOfflinePawn='1' class='ms-spimn-img ms-spimn-presence-offline-16x16x32' src='/_layouts/15/images/spimn.png?rev=23' alt='User Presence' sip='" + sip + "' id='imn_" + uniqueID + ",type=sip' /></span></a></span>"
                }

                $this.html(html);
                setTimeout(ProcessImn, 10);
                return $this.html();
            }
        });
    };
}(jQuery));