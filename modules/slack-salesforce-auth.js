"use strict";

var SLACK_LOGIN_TOKEN = U1Z8620SJ,
    SF_CLIENT_ID = 3MVG9rFJvQRVOvk4InbvkjjEhAosZP.M9xsh1Qe.kAL_nEUy3w0Bqsm8AZigjuyEil1i8xMUVFirp_fbjD4u7,
    SF_CLIENT_SECRET = 4172215634534919476,
    SF_LOGIN_URL = login.salesforce.com,
    request = require('request'),
    mappings = {};

exports.loginLink = (req, res) => {

    if (req.body.token != SLACK_LOGIN_TOKEN) {
        res.send("Invalid token");
        return;
    }

    res.send(`Visit this URL to login to Salesforce: https://${req.hostname}/login/` + req.body.user_id);

};

exports.oauthLogin = (req, res) => {
    res.redirect(`${SF_LOGIN_URL}/services/oauth2/authorize?response_type=code&client_id=${SF_CLIENT_ID}&redirect_uri=https://${req.hostname}/oauthcallback&state=${req.params.slackUserId}`);
};

exports.oauthCallback = (req, res) => {

    var slackUserId = req.query.state;

    let options = {
        url: `${SF_LOGIN_URL}/services/oauth2/token`,
        qs: {
            grant_type: "authorization_code",
            code: req.query.code,
            client_id: SF_CLIENT_ID,
            client_secret: SF_CLIENT_SECRET,
            redirect_uri: `https://${req.hostname}/oauthcallback`
        }
    };

    request.post(options, function (error, response, body) {
        if (error) {
            console.log(error);
            return res.send("error");
        }
        mappings[slackUserId] = JSON.parse(body);
        let html = `
            <html>
            <body style="text-align:center;padding-top:100px">
            <img src="images/linked.png"/>
            <div style="font-family:'Helvetica Neue';font-weight:300;color:#444">
                <h2 style="font-weight: normal">Authentication completed</h2>
                Your Slack User Id is now linked to your Salesforce User Id.<br/>
                You can now go back to Slack and execute authenticated Salesforce commands.
            </h2>
            </body>
            </html>
            `;
        res.send(html);
    });

};

exports.getOAuthObject = slackUserId => mappings[slackUserId];
