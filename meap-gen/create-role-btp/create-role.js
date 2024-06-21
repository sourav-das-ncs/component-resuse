let SessionID = '';
SessionID = "3595fb51c2a79ba65b40b6d6b3aff4ca"


async function createRoleSIT(role_name, description) {
    await fetch("https://emea.cockpit.btp.cloud.sap/ajax/1a9a42eb-f11a-4aab-a27a-f1d3523c7db2/cf-ap10/1aba33fd-727d-4e9c-941f-c0cbe36c8796/roleCollectionsCallNew/1aba33fd-727d-4e9c-941f-c0cbe36c8796/create", {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            "X-ClientSession-Id": SessionID,
            "X-Requested-With": "XMLHttpRequest",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "Priority": "u=1",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache"
        },
        "referrer": "https://emea.cockpit.btp.cloud.sap/cockpit",
        "body": JSON.stringify({
            name: role_name,
            description: description,
        }),
        "method": "POST",
        "mode": "cors"
    });
}

async function createRole(role_name, description) {
    await fetch("https://emea.cockpit.btp.cloud.sap/ajax/1a9a42eb-f11a-4aab-a27a-f1d3523c7db2/cf-ap10/8b000472-9622-4622-88d1-ad2954c03ad2/roleCollectionsCallNew/8b000472-9622-4622-88d1-ad2954c03ad2/create", {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            "X-ClientSession-Id": SessionID,
            "X-Requested-With": "XMLHttpRequest",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "Priority": "u=1"
        },
        "referrer": "https://emea.cockpit.btp.cloud.sap/cockpit/",
        "body": JSON.stringify({
            name: role_name,
            description: description,
        }),
        "method": "POST",
        "mode": "cors"
    });
}

async function main() {
    for (let dt in PGS) {
        for (let pg of PGS[dt]) {

            try {
                let role = `ZSG_MM_PO_${dt}_L1_APPR.${pg}`;
                await createRole(role, `PO Approve Role for ${pg} L1`);
                console.log(role, "created");

                role = `ZSG_MM_PO_${dt}_L2_APPR.${pg}`;
                await createRole(role, `PO Approve Role for ${pg} L2`);
                console.log(role, "created");

                role = `ZSG_MM_PO_${dt}_L3_APPR.${pg}`;
                await createRole(role, `PO Approve Role for ${pg} L3`);
                console.log(role, "created");
            } catch (e) {
                console.log("Role error :", e);
            }
        }

    }
}

PGS = {
    "T": [
        "SG1",
        "SG2",
        "SG3",
        "SG4",
        "SG5",
        "SG6",
        "SG7",
        "SG8",
        "SG9",
        "SGB",
        "SGC",
        "SGF"
    ],
    "NTB": [
        "SG1",
        "SG2",
        "SG3",
        "SG4",
        "SG5",
        "SG6",
        "SG7",
        "SG8",
        "SG9",
        "SGB",
        "SGC",
        "SGF",
        "SPP",
        "SPM",
        "SSM"
    ],
    "NTS": [
        "SGL",
        "SGK",
        "SGJ",
        "AOM",
        "AOZ",
        "AOT",
        "AOC",
        "AOE",
        "SG1",
        "SG2",
        "SG3",
        "SG4",
        "SG5",
        "SG6",
        "SG7",
        "SG8",
        "SG9",
        "SGB",
        "SGC",
        "SGF",
        "SPP",
        "SPM",
        "SSM",
        "MD",
        "SP",
        "AF",
        "HR",
        "CP",
        "LC",
        "POR",
        "PUR",
        "ISS",
        "LG",
        "PF",
        "AOS",
        "AOR",
        "AOI",
        "AOY",
        "AOH",
        "AOL",
        "AOP",
        "AOF"
    ]
}

main()