"use strict";

let nforce = require('nforce'),

    SF_CLIENT_ID = "3MVG9PbQtiUzNgN6G2.NfFw.YPxQ198wCeEjVzVIoVPwWwfJLx7_3QjAD_hCMdixbMiqfhBvhDo_I_AfCYA8Z",
    SF_CLIENT_SECRET = "2613139289057230490",
    SF_USER_NAME = "abkumar@coh.org.lightning",
    SF_PASSWORD = "Sks106519";

let org = nforce.createConnection({
    clientId: SF_CLIENT_ID,
    clientSecret: SF_CLIENT_SECRET,
    redirectUri: 'https://sfchatbottry1.herokuapp.com/oauth/_callback',
    mode: 'single',
    autoRefresh: true
});

let login = () => {
    org.authenticate({username: SF_USER_NAME, password: SF_PASSWORD}, err => {
        if (err) {
            console.error("Authentication error");
            console.error(err);
        } else {
            console.log("Authentication successful");
        }
    });
};

let findAccount = name => {
    return new Promise((resolve, reject) => {
        var org = nforce.createConnection({
            clientId: '3MVG9PbQtiUzNgN6G2.NfFw.YPxQ198wCeEjVzVIoVPwWwfJLx7_3QjAD_hCMdixbMiqfhBvhDo_I_AfCYA8Z',
            clientSecret: '2613139289057230490',
            redirectUri: 'http://localhost:3000/oauth/_callback',
            environment: 'sandbox',
            mode: 'single' // optional, 'single' or 'multi' user mode, multi default
        });

        org.authenticate({ username: 'abkumar@coh.org.lightning', password: 'Sks106519' }, function (err, resp) {
            // the oauth object was stored in the connection object
            if (!err) console.log('Cached Token: ' + org.oauth.access_token);

            let name = "test";
            let q = "SELECT Id, Name, BillingStreet, BillingCity, BillingState, Picture_URL__c, Phone FROM Account WHERE Name LIKE '%" + name + "%' LIMIT 5";
            org.query({ query: q }, (err, resp) => {
                if (err) {
                    reject("An error as occurred");
                } else if (resp.records && resp.records.length > 0) {
                    let accounts = resp.records;
                    resolve(accounts);
                }
            });
        });
    });

};

let findContact = name => {

    return new Promise((resolve, reject) => {
        let q = "SELECT Id, Name, Title, Account.Name, Phone, MobilePhone, Email, Picture_URL__c FROM Contact WHERE Name LIKE '%" + name + "%' LIMIT 5";
        org.query({query: q}, (err, resp) => {
            if (err) {
                reject("An error as occurred");
            } else if (resp.records && resp.records.length>0) {
                let contacts = resp.records;
                resolve(contacts);
            }
        });
    });

};

let findContactsByAccount = accountId => {

    return new Promise((resolve, reject) => {
        let q = "SELECT Id, Name, Title, Account.Name, Phone, MobilePhone, Email, Picture_URL__c FROM Contact WHERE Account.Id = '" + accountId + "' LIMIT 5";
        org.query({query: q}, (err, resp) => {
            if (err) {
                reject("An error as occurred");
            } else if (resp.records && resp.records.length>0) {
                let contacts = resp.records;
                resolve(contacts);
            }
        });
    });

};

let getTopOpportunities = count => {

    count = count || 5;

    return new Promise((resolve, reject) => {
        let q = "SELECT Id, Name, Amount, Probability, StageName, CloseDate, Account.Name, Account.Picture_URL__c FROM Opportunity WHERE isClosed=false ORDER BY amount DESC LIMIT " + count;
        org.query({query: q}, (err, resp) => {
            if (err) {
                console.error(err);
                reject("An error as occurred");
            } else {
                resolve(resp.records);
            }
        });
    });

};

//login();

exports.org = org;
exports.findAccount = findAccount;
exports.findContact = findContact;
exports.findContactsByAccount = findContactsByAccount;
exports.getTopOpportunities = getTopOpportunities;