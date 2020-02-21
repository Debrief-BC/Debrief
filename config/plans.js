'use strict';

module.exports.plans = {
    "plans": {
        "team_chat": 0,
        "team_calling": 6,
        "debrief_phone": 15,
        "phone_unlimited": 30
    },
    "permissions": {
        "1_to_1_calls": {
            "team_chat": -1,
            "team_calling": -1,
            "debrief_phone": -1,
            "phone_unlimited": -1
        },
        "1_to_1_video": {
            "team_chat": -1,
            "team_calling": -1,
            "debrief_phone": -1,
            "phone_unlimited": -1
        },
        "1_to_1_screensharing": {
            "team_chat": -1,
            "team_calling": -1,
            "debrief_phone": -1,
            "phone_unlimited": -1
        },
        "group_chat": {
            "team_chat": -1,
            "team_calling": -1,
            "debrief_phone": -1,
            "phone_unlimited": -1
        },
        "group_calling": {
            "team_chat": 0,
            "team_calling": -1,
            "debrief_phone": -1,
            "phone_unlimited": -1
        },
        "group_screensharing": {
            "team_chat": 0,
            "team_calling": -1,
            "debrief_phone": -1,
            "phone_unlimited": -1
        },
        "meetings": {
            "team_chat": 50,
            "team_calling": -1,
            "debrief_phone": -1,
            "phone_unlimited": -1
        },
        "phone_number": {
            "team_chat": 0,
            "team_calling": 0,
            "debrief_phone": -1,
            "phone_unlimited": -1
        },
        "phone_extensions": {
            "team_chat": 0,
            "team_calling": 0,
            "debrief_phone": -1,
            "phone_unlimited": -1
        },
        "calls_na": {
            "team_chat": 0,
            "team_calling": 0,
            "debrief_phone": 1000,
            "phone_unlimited": -1
        },
        "keep_history": {
            "team_chat": 0,
            "team_calling": -1,
            "debrief_phone": -1,
            "phone_unlimited": -1
        },
        "max_chat_messages": {
            "team_chat": 10000,
            "team_calling": -1,
            "debrief_phone": -1,
            "phone_unlimited": -1
        },
        "max_file_storage": {
            "team_chat": 500,
            "team_calling": 1000,
            "debrief_phone": 1000,
            "phone_unlimited": 1000
        }
    },
    "addons": {
        "extra_storage": 5,
        "na_minutes": 0.05,
        "int_minutes": -1,
        "na_phone_number": 5,
        "na_phone_number_toll_free": {
            "base": 5,
            "per_minutes": 0.05
        },
        "int_phone_number": -1
    }
};