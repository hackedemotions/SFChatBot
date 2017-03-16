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
            let q = "SELECT Id, Name, Patient_Status__c, Gender__pc, Date_of_Birth__c, Appointment_Date_Time__c, COH_MRN__c FROM Account WHERE Name LIKE '%" + name + "%' LIMIT 5";
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

let createCase = (subject) => {

    return new Promise((resolve, reject) => {
        let c = nforce.createSObject('Case');
        c.set('subject', subject);
        c.set('Action_Taken__c', "EMAIL SENT TO PATIENT");
        c.set('origin', 'BAP');
        c.set('status', 'New');
        c.set('ContactId', '0034B00000CI5n4QAD');

        org.insert({ sobject: c }, err => {
            if (err) {
                console.error(err);
                reject("An error occurred while creating a case");
            } else {
                resolve(c);
            }
        });
    });

};
//login();

exports.org = org;
exports.findAccount = findAccount;
exports.createCase = createCase;