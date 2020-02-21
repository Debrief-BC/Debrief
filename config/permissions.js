'use strict';

module.exports = {
    "activity": {
        "can_create_chats_conferences": {
            "guest": false,
            "member": true,
            "manager": true,
            "admin": true
        }
    },
    "settings": {
        "can_view_departments": {
            "guest": false,
            "member": false,
            "manager": false,
            "admin": true
        },
        "can_view_company_settings": {
            "guest": false,
            "member": false,
            "manager": false,
            "admin": true
        },
        "can_view_user_settings": {
            "guest": false,
            "member": false,
            "manager": true,
            "admin": true
        },
        "can_view_call_routing": {
            "guest": false,
            "member": false,
            "manager": true,
            "admin": true
        }
    },
    "users": {
        "can_create_user": {
            "guest": false,
            "member": false,
            "manager": false,
            "admin": false
        },
        "can_invite_user": {
            "guest": false,
            "member": false,
            "manager": false,
            "admin": true
        },
        "can_change_plan": {
            "guest": false,
            "member": false,
            "manager": false,
            "admin": true
        },
        "can_edit_user": {
            "guest": false,
            "member": false,
            "manager": false,
            "admin": true
        }
    },
    "departments": {
        "can_add_department": {
            "guest": false,
            "member": false,
            "manager": false,
            "admin": true
        },
        "can_edit_department": {
            "guest": false,
            "member": false,
            "manager": false,
            "admin": true
        },
        "can_delete_department": {
            "guest": false,
            "member": false,
            "manager": false,
            "admin": true
        },
        "can_view_department": {
            "guest": false,
            "member": false,
            "manager": false,
            "admin": true
        }
    },
    "chat": {
        "can_invite_guests": {
            "guest": false,
            "user": true,
            "manager": true,
            "admin": true
        },
        "can_create": {
            "private_chat": {
                "guest": false,
                "member": true,
                "manager": true,
                "admin": true
            },
            "group_chat": {
                "guest": false,
                "member": true,
                "manager": true,
                "admin": true
            },
            "private_channel": {
                "guest": false,
                "member": true,
                "manager": true,
                "admin": true
            },
            "open_channel": {
                "guest": false,
                "member": true,
                "manager": true,
                "admin": true
            },
            "department": {
                "guest":false,
                "member":false,
                "manager":false,
                "admin":true
            }
        },
        "can_add_participant": {
            "guest": false,
            "member": true,
            "manager": true,
            "admin": true
        },
        "can_remove_participant": {
            "private_chat": {
                "guest": "myself",
                "member": "myself",
                "manager": "myself",
                "admin": "myself"
            },
            "group_chat": {
                "guest": "myself",
                "member": "myself",
                "manager": "myself",
                "admin": "myself"
            },
            "private_channel": {
                "guest": "myself",
                "member": "myself",
                "manager": "myself",
                "admin": "myself"
            },
            "open_channel": {
                "guest": "myself",
                "member": "myself",
                "manager": "myself",
                "admin": "anyone"
            }
        },
        "can_rename": {
            "guest": "as_organizer",
            "member": "as_organizer",
            "manager": "as_organizer",
            "admin": "as_organizer"
        }
    },
    "contacts": {
        "can_access_contacts_view": {
            "guest": true,
            "member": true,
            "manager": true,
            "admin": true
        },
        "can_access_company_directory": {
            "guest": false,
            "member": true,
            "manager": true,
            "admin": true
        },
        "can_add_contacts": {
            "guest": false,
            "member": true,
            "manager": true,
            "admin": true
        }
    },
    "call": {
        "can_access_dialpad": {
            "guest": false,
            "member": true,
            "manager": true,
            "admin": true
        },
        "can_make_pstn_calls": {
            "guest": false,
            "member": true,
            "manager": true,
            "admin": true
        },
        "can_make_internal_calls": {
            "guest": false,
            "member": true,
            "manager": true,
            "admin": true
        }
    },
    "conference": {
        "can_create": {
            "guest": false,
            "member": true,
            "manager": true,
            "admin": true
        },
        "can_update": {
            "guest": "as_organizer",
            "member": "as_organizer",
            "manager": "as_organizer",
            "admin": "always"
        },
        "can_close": {
            "guest": "as_organizer",
            "member": "as_organizer",
            "manager": "as_organizer",
            "admin": "always"
        },
        "can_invite_guests": {
            "guest": false,
            "user": true,
            "manager": true,
            "admin": true
        }
    }
};