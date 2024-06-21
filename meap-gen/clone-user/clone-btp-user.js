let SESSIONID;
SESSIONID = '789bf048595d2b15c25700a8168ec8ec';

/*
{
    "id": "d054b2ae-5851-4cae-ab3d-c91e2f94a29e",
    "username": "btp_po_l1_l2@asia.meap.com",
    "email": "btp_po_l1_l2@asia.meap.com",
    "familyName": "BTP PO L1 L2",
    "origin": "sap.custom",
    "externalId": "btp_po_l1_l2@asia.meap.com",
    "zoneId": "8b000472-9622-4622-88d1-ad2954c03ad2",
    "verified": false,
    "legacyVerificationBehavior": false,
    "roleCollections": [
        "ZSG_BTP_SD_SO.1822_LEVEL_DEF_BB",
        "ZSG_BTP_SD_SO.1822_LEVEL_2",
        "Sales_Order"
    ],
    "version": 0
}
 */
async function getRoles(userid) {
    const url = "https://emea.cockpit.btp.cloud.sap/ajax/1a9a42eb-f11a-4aab-a27a-f1d3523c7db2/cf-ap10/8b000472-9622-4622-88d1-ad2954c03ad2/getUserRoleCollectionAssignments/8b000472-9622-4622-88d1-ad2954c03ad2/sap.custom"
    const response = await fetch(`${url}?userid=${userid}`, {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            "X-ClientSession-Id": SESSIONID,
            "X-Requested-With": "XMLHttpRequest",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin"
        },
        "referrer": "https://emea.cockpit.btp.cloud.sap/cockpit",
        "method": "GET",
        "mode": "cors"
    });

    const userDetails = await response.json();
    return userDetails;
}

async function getRolesSIT(userEmail) {
    const response = await fetch(`https://emea.cockpit.btp.cloud.sap/ajax/1a9a42eb-f11a-4aab-a27a-f1d3523c7db2/cf-ap10/1aba33fd-727d-4e9c-941f-c0cbe36c8796/getUserRoleCollectionAssignments/1aba33fd-727d-4e9c-941f-c0cbe36c8796/httpsa5e2bjyuh.accounts.ondemand.com?userid=${userEmail}`, {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            "X-ClientSession-Id": SESSIONID,
            "X-Requested-With": "XMLHttpRequest",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin"
        },
        "referrer": "https://emea.cockpit.btp.cloud.sap/cockpit",
        "method": "GET",
        "mode": "cors"
    });
    const userDetails = await response.json();
    return userDetails;
}

/*
body
{
            "id": "d054b2ae-5851-4cae-ab3d-c91e2f94a29e",
            "username": "btp_po_l1_l2@asia.meap.com",
            "email": "btp_po_l1_l2@asia.meap.com",
            "familyName": "BTP PO L1 L2",
            "origin": "sap.custom",
            "externalId": "btp_po_l1_l2@asia.meap.com",
            "zoneId": "8b000472-9622-4622-88d1-ad2954c03ad2",
            "verified": false,
            "legacyVerificationBehavior": false,
            "roleCollections": ["ZSG_BTP_SD_SO.1822_LEVEL_DEF_BB", "ZSG_BTP_SD_SO.1822_LEVEL_2", "Sales_Order", "~q22_900_Z_APP.SECURITY.ADM_ISS"],
            "version": 0
        }
 */
async function updateRoleCollectionAssignments(userId, userDetails) {
    const url = "https://emea.cockpit.btp.cloud.sap/ajax/1a9a42eb-f11a-4aab-a27a-f1d3523c7db2/cf-ap10/8b000472-9622-4622-88d1-ad2954c03ad2/updateUserRoleCollection/8b000472-9622-4622-88d1-ad2954c03ad2"
    await fetch(`${url}?userid=${userId}`, {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            "X-ClientSession-Id": SESSIONID,
            "X-Requested-With": "XMLHttpRequest",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "Priority": "u=1"
        },
        "referrer": "https://emea.cockpit.btp.cloud.sap/cockpit",
        "body": JSON.stringify(userDetails),
        "method": "PUT",
        "mode": "cors"
    });
}

async function updateRoleSIT(userId, userDetails) {
    await fetch(`https://emea.cockpit.btp.cloud.sap/ajax/1a9a42eb-f11a-4aab-a27a-f1d3523c7db2/cf-ap10/1aba33fd-727d-4e9c-941f-c0cbe36c8796/updateUserRoleCollection/1aba33fd-727d-4e9c-941f-c0cbe36c8796?userid=${userId}`, {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            "X-ClientSession-Id": SESSIONID,
            "X-Requested-With": "XMLHttpRequest",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "Priority": "u=1"
        },
        "referrer": "https://emea.cockpit.btp.cloud.sap/cockpit",
        "body": JSON.stringify(userDetails),
        "method": "PUT",
        "mode": "cors"
    });
}



async function cloneInUAT(ORIGINAL_USER, CLONED_USER) {
    const oUserDetails = await getRoles(ORIGINAL_USER);
    const oClonedDetails = await getRoles(CLONED_USER);

    for (let role of oUserDetails.roleCollections) {
        oClonedDetails.roleCollections.push(role);
    }

    await updateRoleCollectionAssignments(CLONED_USER, oClonedDetails);
}

async function cloneInSIT(ORIGINAL_USER, CLONED_USER) {
    const oUserDetails = await getRolesSIT(ORIGINAL_USER);
    const oClonedDetails = await getRolesSIT(CLONED_USER);

    for (let role of oUserDetails.roleCollections) {
        oClonedDetails.roleCollections.push(role);
    }

    await updateRoleSIT(CLONED_USER, oClonedDetails);
}

ORIGINAL_USER = "Winghong.Chui@asia.meap.com"
CLONED_USER = "WHCHUI_SV@asia.meap.com"

async function main() {
    await cloneInUAT(ORIGINAL_USER, CLONED_USER);
    // await cloneInSIT(ORIGINAL_USER, CLONED_USER);
}

main()