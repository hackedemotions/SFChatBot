"use strict";

let request = require('request'),
    salesforce = require('./salesforce'),
    formatter = require('./formatter-messenger');

let sendMessage = (message, recipient) => {
    request({
        url: 'https://graph.facebook.com/me/messages',
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
    let responseTxt = 'Hi, How can I help you ?';
    match = text.match(/hi/i);
    if (match) {
        sendMessage({
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "list",
                    "top_element_style": "compact",
                    "elements": [
                        {
                            "title": "Research",
                            "subtitle": "Research Overview",
                            "buttons": [
                                {
                                    "title": "Read more",
                                    "type": "web_url",
                                    "url": "https://www.cityofhope.org/research/research-overview",
                                    "webview_height_ratio": "tall",
                                    "fallback_url": "https://www.cityofhope.org"
                                }
                            ]
                        },
                        {
                            "title": "Medical Education",
                            "subtitle": "Continuing Medical Education",
                            "buttons": [
                                {
                                    "title": "Read more",
                                    "type": "web_url",
                                    "url": "https://www.cityofhope.org/research/research-overview",
                                    "webview_height_ratio": "tall",
                                    "fallback_url": "https://www.cityofhope.org"
                                }
                            ]
                        },
                        {
                            "title": "Research",
                            "subtitle": "Research Overview",
                            "buttons": [
                                {
                                    "title": "Read more",
                                    "type": "web_url",
                                    "url": "https://www.cityofhope.org/research/research-overview",
                                    "messenger_extensions": true,
                                    "webview_height_ratio": "tall",
                                    "fallback_url": "https://www.cityofhope.org"
                                }
                            ]
                        },
                        {
                            "title": "Medical Education",
                            "subtitle": "Continuing Medical Education",
                            "buttons": [
                                {
                                    "title": "Read more",
                                    "type": "web_url",
                                    "url": "https://www.cityofhope.org/education/continuing-medical-education",
                                    "messenger_extensions": true,
                                    "webview_height_ratio": "tall",
                                    "fallback_url": "https://www.cityofhope.org"
                                }
                            ]
                        }
                    ],
                    "buttons": [
                        {
                            "title": "View More",
                            "type": "postback",
                            "payload": "payload"
                        }
                    ]
                }
            }
        }, sender);
        return;
    }

    match = text.match(/help/i);
    if (match) {
        sendMessage({
            text:
            `You can ask me things like:
    search patient <<name>>
    book appointment
    symptom <<name>>
    create case <<summary>>
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

    match = text.match(/lookup appointment (.*)/i);
    if (match) {
        sendMessage({ text: `Looking for appointment for patient "${match[1]}":` }, sender);
        salesforce.findAccount(match[1]).then(accounts => {
            sendMessage(formatter.formatAppointment(accounts), sender)
        });
        return;
    }

    match = text.match(/book appointment (.*)/i);
    if (match) {
        sendMessage(formatter.bookAppointment('test'), sender);
        return;
    }

    match = text.match(/symptom (.*)/i);
    if (match) {
        sendMessage({ text: `Looking for articles on symptom management for "${match[1]}":` }, sender);
        sendMessage(formatter.symptomManagement('test'), sender);
        return;
    }

    match = text.match(/create case (.*)/i);
    if (match) {
        sendMessage({ text: `Creating a case for you` }, sender);
        salesforce.createCase(match[1]).then(accounts => {
            sendMessage({ text: `Your case has been created` }, sender);
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