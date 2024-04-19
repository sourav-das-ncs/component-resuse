// const fetch = require("node-fetch");

async function restcall(addedUsers, role, desc) {
    await fetch("https://emea.cockpit.btp.cloud.sap/ajax/1a9a42eb-f11a-4aab-a27a-f1d3523c7db2/cf-ap10/8b000472-9622-4622-88d1-ad2954c03ad2/saveRoleCollectionCall/8b000472-9622-4622-88d1-ad2954c03ad2/saveRoleCollection", {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            "X-ClientSession-Id": "-32fc3d5140f26eb34e6d1bbe485a6b84",
            "X-Requested-With": "XMLHttpRequest",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache"
        },
        "referrer": "https://emea.cockpit.btp.cloud.sap/cockpit/",
        "body": JSON.stringify({
            // role
            "name": role,
            // role description
            "description": desc,
            "isReadOnly": false,
            "addedRoles": [],
            "addedUsers": addedUsers,
            "addedUserGroups": [],
            "deletedUsers": [],
            "deletedUserGroups": [],
            "deletedRoles": [],
            "addedAttributes": [],
            "deletedAttributes": []
        }),
        "method": "PUT",
        "mode": "cors"
    });
    // console.log(response);
    // const data = await response.text();
    // return data;
}


async function push(name) {
    role_obj = ROLES[name];
    ADDED_USER = []
    for (let u of role_obj.users) {
        ADDED_USER.push({
            "origin": "sap.custom",
            "username": u,
            "email": u
        })
    }
    console.log(ADDED_USER)

    await restcall(ADDED_USER, role_obj.btp_role, role_obj.desc)
}


async function main() {
    for (let name in ROLES) {
        console.log(name);
        await push(name);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}





