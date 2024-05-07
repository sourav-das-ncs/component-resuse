async function getBtpRoleAssignment(role) {
    const response = await fetch(`https://emea.cockpit.btp.cloud.sap/ajax/1a9a42eb-f11a-4aab-a27a-f1d3523c7db2/cf-ap10/8b000472-9622-4622-88d1-ad2954c03ad2/getRoleCollectionUsersCall/8b000472-9622-4622-88d1-ad2954c03ad2/loadRoleCollectionDetailUsers?rolecollection=${role}`, {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json; charset=UTF-8",
            "X-ClientSession-Id": "64852c5d8fdd22a56a34f05fa6c2d1be",
            "X-Requested-With": "XMLHttpRequest",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "Priority": "u=1",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache"
        },
        "referrer": "https://emea.cockpit.btp.cloud.sap/cockpit",
        "method": "GET",
        "mode": "cors"
    });
    const data = await response.json()

    if (data.hasOwnProperty("userReferences")) {
        return data.userReferences;
    }

    return [];
}

async function getRoles() {
    const response = await fetch("https://emea.cockpit.btp.cloud.sap/ajax/1a9a42eb-f11a-4aab-a27a-f1d3523c7db2/cf-ap10/8b000472-9622-4622-88d1-ad2954c03ad2/getRoleCollectionsDetailsCall/8b000472-9622-4622-88d1-ad2954c03ad2", {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            "X-ClientSession-Id": "64852c5d8fdd22a56a34f05fa6c2d1be",
            "X-Requested-With": "XMLHttpRequest",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache"
        },
        "referrer": "https://emea.cockpit.btp.cloud.sap/cockpit",
        "method": "GET",
        "mode": "cors"
    });

    const data = await response.json()
    return data;
}

async function main() {
    const roles = await getRoles();
    btp_roles = [];
    for (const role of roles) {
        if (role.name.startsWith("~q22_901")) {
            role.users = await getBtpRoleAssignment(role.name)
            btp_roles.push(role)
        }
    }
    console.log(btp_roles);
}

main()