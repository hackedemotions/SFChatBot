"use strict";

let request = require('request'),
    salesforce = require('./salesforce'),
    formatter = require('./formatter-messenger');

let sendMessage = (message, recipient) => {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: process.env.FB_PAGE_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: recipient },
            message: message
        }
    }, (error, response) => {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

let processText = (text, sender) => {
    let match;
    let responseTxt = 'Hi, How are you doing today ?';
    match = text.match(/hi/i);
    if (match) {
        sendMessage({
            text:
            responseTxt
        }, sender);
        return;
    }

    match = text.match(/help/i);
    if (match) {
        sendMessage({
            text:
            `You can ask me things like:
    Search patient <<name>>
    Search doctor <<name>>
    Search appt <<date>>
    Create case <<summary>>
        `}, sender);
        return;

    }

    match = text.match(/search patient (.*)/i);
    if (match) {
        sendMessage({ text: `Searching for patient "${match[1]}":` }, sender);
        salesforce.findAccount(match[1]).then(accounts => {
            sendMessage({ text: `Here are the patient accounts I found matching "${match[1]}":` }, sender);
            sendMessage(formatter.formatAccounts(accounts), sender)
        });
        return;
    }

    match = text.match(/search (.*) in accounts/i);
    if (match) {
        salesforce.findAccount(match[1]).then(accounts => {
            sendMessage({ text: `Here are the accounts I found matching "${match[1]}":` }, sender);
            sendMessage(formatter.formatAccounts(accounts), sender)
        });
        return;
    }

    match = text.match(/search doctor (.*)/i);
    if (match) {
        sendMessage({ text: `Searching for doctor "${match[1]}":` }, sender);
        salesforce.findContact(match[1]).then(contacts => {
            sendMessage({ text: `Here are the doctors I found matching "${match[1]}":` }, sender);
            sendMessage(formatter.formatContacts(contacts), sender)
        });
        return;
    }

    match = text.match(/top (.*) opportunities/i);
    if (match) {
        salesforce.getTopOpportunities(match[1]).then(opportunities => {
            sendMessage({ text: `Here are your top ${match[1]} opportunities:` }, sender);
            sendMessage(formatter.formatOpportunities(opportunities), sender)
        });
        return;
    }
};

let handleGet = (req, res) => {
    if (req.query['hub.verify_token'] === process.env.FB_VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong validation token');
};

let handlePost = (req, res) => {
    let events = req.body.entry[0].messaging;
    for (let i = 0; i < events.length; i++) {
        let event = events[i];
        let sender = event.sender.id;
        if (process.env.MAINTENANCE_MODE && ((event.message && event.message.text) || event.postback)) {
            sendMessage({ text: `Sorry I'm taking a break right now.` }, sender);
        } else if (event.message && event.message.text) {
            processText(event.message.text, sender);
        } else if (event.postback) {
            let payload = event.postback.payload.split(",");
            if (payload[0] === "view_contacts") {
                sendMessage({ text: "OK, looking for your contacts at " + payload[2] + "..." }, sender);
                salesforce.findContactsByAccount(payload[1]).then(contacts => sendMessage(formatter.formatContacts(contacts), sender));
            } else if (payload[0] === "close_won") {
                sendMessage({ text: `OK, I closed the opportunity "${payload[2]}" as "Close Won". Way to go Christophe!` }, sender);
            } else if (payload[0] === "close_lost") {
                sendMessage({ text: `I'm sorry to hear that. I closed the opportunity "${payload[2]}" as "Close Lost".` }, sender);
            }
        }
    }
    res.sendStatus(200);
};


let getUserInfo = (userId) => {

    return new Promise((resolve, reject) => {

        request({
            url: `https://graph.facebook.com/v2.6/${userId}`,
            qs: { fields: "first_name,last_name,profile_pic", access_token: process.env.FB_PAGE_TOKEN },
            method: 'GET',
        }, (error, response) => {
            if (error) {
                console.log('Error sending message: ', error);
                reject(error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            } else {
                resolve(JSON.parse(response.body));
            }
        });

    });
};

exports.handleGet = handleGet;
exports.handlePost = handlePost;