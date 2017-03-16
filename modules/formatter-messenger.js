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
    let elements[];
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
    let elements[];
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


exports.formatAccounts = formatAccounts;
exports.formatAppointment = formatAppointment;
exports.bookAppointment = bookAppointment;
exports.symptomManagement = symptomManagement;