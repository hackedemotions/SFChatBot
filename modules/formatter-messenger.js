"use strict";

let formatAccounts = accounts => {
    let elements = [];
    accounts.forEach(account =>
        elements.push({
            title: account.get("Name"),
            subtitle: account.get("COH_MRN__c") + ", " + account.get("Patient_Status__c") + " " + account.get("Gender__pc") + " · " + account.get("Date_of_Birth__c"),
            "buttons": [{
                "type": "web_url",
                "url": "https://cityofhope--lightning.lightning.force.com/" + account.getId(),
                "title": "Open in Salesforce"
            },
]
        })
    );
    return {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": elements
            }
        }
    };
};

let formatAppointment = accounts => {
    let elements = [];
    accounts.forEach(account =>
        elements.push({
            title: account.get("Name"),
            subtitle: "Your appointment is scheduled at, " + account.get("Appointment_Date_Time__c")
        })
    );
    return {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": elements
            }
        }
    };
};

let bookAppointment = accounts => {
    let elements;
    elements.push({
            "buttons": [{
                "type": "web_url",
                "url": "https://secure.cityofhope.org/newpatientrequest/",
                "title": "Book Appointment"
            },
            ]
        });
    return {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": elements
            }
        }
    };
};

let symptomManagement = accounts => {
    let elements;
    elements.push({
        "buttons": [{
            "type": "web_url",
            "url": "https://www.cityofhope.org/patients/departments-and-services/hematologic-malignancies-and-stem-cell-transplantation-institute",
            "title": "HEMATOLOGIC MALIGNANCIES"
        },
        ]
    });
    return {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": elements
            }
        }
    };
};

let formatContacts = contacts => {
    let elements = [];
    contacts.forEach(contact => {
        elements.push({
            title: contact.get("Name"),
            subtitle: contact.get("Title") + " at " + contact.get("Account").Name + " · " + contact.get("MobilePhone"),
            "image_url": contact.get("Picture_URL__c"),
            "buttons": [
                {
                    "type": "postback",
                    "title": "View Notes",
                    "payload": "view_notes," + contact.getId() + "," + contact.get("Name")
                },
                {
                    "type": "web_url",
                    "url": "https://login.salesforce.com/" + contact.getId(),
                    "title": "Open in Salesforce"
                }]
        })
    });
    return {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": elements
            }
        }
    };
};

let formatOpportunities = opportunities => {
    let elements = [];
    opportunities.forEach(opportunity =>
        elements.push({
            title: opportunity.get("Name"),
            subtitle: opportunity.get("Account").Name + " · $" + opportunity.get("Amount"),
            "image_url": "https://s3-us-west-1.amazonaws.com/sfdc-demo/messenger/opportunity500x260.png",
            "buttons": [
                {
                    "type":"postback",
                    "title":"Close Won",
                    "payload": "close_won," + opportunity.getId() + "," + opportunity.get("Name")
                },
                {
                    "type":"postback",
                    "title":"Close Lost",
                    "payload": "close_lost," + opportunity.getId() + "," + opportunity.get("Name")
                },
                {
                    "type": "web_url",
                    "url": "https://login.salesforce.com/" + opportunity.getId(),
                    "title": "Open in Salesforce"
                }]
        })
    );
    return {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": elements
            }
        }
    };
};

exports.formatAccounts = formatAccounts;
exports.formatContacts = formatContacts;
exports.formatOpportunities = formatOpportunities;