let SESSIONID;
SESSIONID = '-6916019dca9cd9125c583938d41bba25';

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

//
// ORIGINAL_USER = "CheeYen.Tan@asia.meap.com"
// CLONED_USER = "TRG_BTP_02@asia.meap.com"

async function main() {
    // const oUserDetails = await getRoles(ORIGINAL_USER);
    // const oClonedDetails = await getRoles(CLONED_USER);

    for (let email of ASSINGMMENT) {
        const oUserDetails = await getRoles(email);
        if (oUserDetails) {
            oUserDetails.roleCollections.push("~q22_901_ZSG_PS_PRJ.DSP_XXX");
            await updateRoleCollectionAssignments(email, oUserDetails);
        }
    }


}


ASSINGMMENT = [
    "Andrew.Shen@asia.meap.com",
    "Royston.Kwik@asia.meap.com",
    "MyintThuzar.Khin@asia.meap.com",
    "Sani.Saleh@asia.meap.com",
    "WeePheng.Lau@asia.meap.com",
    "Damien.Yuen@asia.meap.com",
    "WaiMun.Leong@asia.meap.com",
    "ChoonChin.Tay@asia.meap.com",
    "Katherine.Tan@asia.meap.com",
    "Elaine.Ong@asia.meap.com",
    "Kathrine.Lee@asia.meap.com",
    "Dave.Heng@asia.meap.com",
    "Priscilla.Ong@asia.meap.com",
    "Daniel.Lee@asia.meap.com",
    "Zona.Liew@asia.meap.com",
    "Abel.Neui@asia.meap.com",
    "HoKim.Ng@asia.meap.com",
    "Takahito.Noda@asia.meap.com",
    "Levinon.Nobrera@asia.meap.com",
    "JiannHorng.Lui@asia.meap.com",
    "ChoonHiok.Tay@asia.meap.com",
    "KhengTiong.Low@asia.meap.com",
    "Patrick.Chu@asia.meap.com",
    "Denis.Tan@asia.meap.com",
    "FangWee.Lim@asia.meap.com",
    "CheeYen.Tan@asia.meap.com",
    "Yuka.Iwasaki@asia.meap.com",
    "Yvonne.Chia@asia.meap.com",
    "WenMan.Wang@asia.meap.com",
    "Evelyn.Tan@asia.meap.com",
    "Pensie.B@asia.meap.com",
    "Grace.Chan@asia.meap.com",
    "MunLeng.Chua@asia.meap.com",
    "KaiSia.Lee@asia.meap.com",
    "LiLin.Kong@asia.meap.com",
    "Jason.Liew@asia.meap.com",
    "JingEn.Chong@asia.meap.com",
    "Nigel.Ho@asia.meap.com",
    "ChungMong.Voo@asia.meap.com",
    "Wilfred.Cher@asia.meap.com",
    "Anthony.Fung@asia.meap.com",
    "Jeffrey.Chia@asia.meap.com",
    "SoonLeng.Tan@asia.meap.com",
    "Kelvin.Loh@asia.meap.com",
    "Clifford.Chua@asia.meap.com",
    "Garry.Quek@asia.meap.com",
    "PengLeong.Ho@asia.meap.com",
    "MongPing.Ng@asia.meap.com",
    "ChuanWan.Chiam@asia.meap.com",
    "ChengFook.Teoh@asia.meap.com",
]

main()
