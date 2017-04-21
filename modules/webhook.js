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
    match = text.match(/get started/i);
    if (match || text.match(/hi/i)) {
        sendMessage({
            text:
            `Hello! Welcome to Ab's health bot. We're here to guide you through the intake process.
Let's get started.`}, sender);
        sendMessage({
            text:
            `What would you like to do ?`
        }, sender);
        sendMessage({
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "Appointment Scheduling",
                        subtitle: "Schedule your appointments",
                        item_url: "https://secure.cityofhope.org/newpatientrequest/",
                        image_url: "http://placehold.it/350x150/E8117F/ffffff?text=Appointments",
                        buttons: [{
                            type: "web_url",
                            url: "https://secure.cityofhope.org/newpatientrequest/",
                            title: "Schedule"
                        }, {
                            type: "postback",
                            title: "Check Available Appointments",
                            payload: "Payload for first bubble",
                        }],
                    }, {
                        title: "Symptom Mangement",
                        subtitle: "Manage your symptoms",
                        item_url: "https://www.cityofhope.org/patients/living-with-cancer/understanding-your-chemotherapy-treatment",
                        image_url: "http://placehold.it/350x150/3399ff/ffffff?text=Symptoms",
                        buttons: [{
                            type: "web_url",
                            url: "https://www.cityofhope.org/patients/living-with-cancer/understanding-your-chemotherapy-treatment",
                            title: "CHEMOTHERAPY"
                        }, {
                            type: "web_url",
                            url: "https://www.cityofhope.org/patients/living-with-cancer/caregiving-for-a-cancer-patient",
                            title: "CAREGIVING FOR A CANCER PATIENT",
                        }, {
                            type: "postback",
                            title: "Contact Us",
                            payload: "Payload for second bubble",
                        }],
                    }, {
                        title: "Insurance coverage and plans",
                        subtitle: "HELPING YOU WITH INSURANCE, BILLING AND LEGAL ISSUES",
                        item_url: "https://www.cityofhope.org/patients/making-your-first-appointment/helping-you-with-insurance-billing-and-legal-information",
                        image_url: "http://placehold.it/350x150/9900ff/ffffff?text=Insurance",
                        buttons: [{
                            type: "web_url",
                            url: "https://www.cityofhope.org/patients/making-your-first-appointment/helping-you-with-insurance-billing-and-legal-information",
                            title: "Financial Counselors"
                        }, {
                            type: "web_url",
                            url: "https://www.cityofhope.org/patients/making-your-first-appointment/helping-you-with-insurance-billing-and-legal-information",
                            title: "Billing",
                        }]
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
            let payload = event.postback.payload;
            if (payload.match(/Contact Us (.*)/i)) {
                sendMessage({ text: `Creating a case for you` }, sender);
                salesforce.createCase(match[1]).then(accounts => {
                    sendMessage({ text: `Your case has been created, someone from our team will get back to you soon.` }, sender);
                });
                return;
            }
            if (payload.match(/Check Available Appointments (.*)/i)) {
                sendMessage({ text: `Looking for available appointments...` }, sender);
                sendMessage({ text: `Sorry we could not find any available appointments !` }, sender);
                return;
            }
            /*let payload = event.postback.payload.split(",");
            if (payload[0] === "view_contacts") {
                sendMessage({ text: "OK, looking for your contacts at " + payload[2] + "..." }, sender);
                salesforce.findContactsByAccount(payload[1]).then(contacts => sendMessage(formatter.formatContacts(contacts), sender));
            } else if (payload[0] === "close_won") {
                sendMessage({ text: `OK, I closed the opportunity "${payload[2]}" as "Close Won". Way to go Christophe!` }, sender);
            } else if (payload[0] === "close_lost") {
                sendMessage({ text: `I'm sorry to hear that. I closed the opportunity "${payload[2]}" as "Close Lost".` }, sender);
            }*/
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