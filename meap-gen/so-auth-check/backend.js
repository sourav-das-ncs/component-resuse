function createSalesOrgLevelMap(aRoles) {
    const salesOrgMap = new Map();
    for (const obj of aRoles) {
        if (obj.APP_LEVEL === "DEF_BB" || obj.APP_LEVEL === "DEF") continue;

        const salesOrg = obj.SALES_ORG;
        const appLevel = parseInt(obj.APP_LEVEL);

        if (!salesOrgMap.has(salesOrg) || appLevel < salesOrgMap.get(salesOrg)) {
            salesOrgMap.set(salesOrg, appLevel);
        }
    }
    console.log(salesOrgMap);
    return salesOrgMap;
}


function getSoRoles(allRoles, oPOReq) {

    const k = 100000;

    function sigmoid(z) {
        return 1 / (1 + Math.exp(-z / k));
    }

    const columns = {
        "DOC_TYPE": "Auart",
        "CUSTOMER": "Kunnr",
        "END_USER": "Enduser",
        "MATERIAL_GRP": "Matkl",
        "PRODUCT_GRP": "Prodg",
        "PRODUCT_HIER": "Prodh"
    };

    const columnsValues = {
        "DOC_TYPE": 10,
        "CUSTOMER": 2,
        "END_USER": 2,
        "MATERIAL_GRP": 3,
        "PRODUCT_GRP": 3,
        "PRODUCT_HIER": 4
    };

    let soRoles = [];
    let allSoRoles = [];
    let default_SO_DC_Role = null;
    let default_SO_DC_BB_Role = null;
    for (let oRole of allRoles) {
        if ((oRole.SALES_ORG === "*" || oRole.SALES_ORG === "ALL") && !isNaN(oRole.APP_LEVEL)) {
            allSoRoles.push(oRole);
            continue;
        }
        if (oRole.SALES_ORG === oPOReq.Vkorg) {
            if (oRole.APP_LEVEL === "DEF") default_SO_DC_Role = oRole;
            else if (oRole.APP_LEVEL === "DEF_BB") default_SO_DC_BB_Role = oRole;
            else {
                if (oRole.APP_LEVEL === "0") {
                    oRole.THRESHOLD = "-Infinity"
                }
                if (oRole.DIST_CHNL !== null && oRole.DIST_CHNL.trim().length > 0 && oRole.DIST_CHNL.trim() !== oPOReq.Vtweg) {
                    console.log("Skipping ", oRole.APP_LEVEL_ROLE, " DIST_CHNL missmatch ");
                    continue;
                }
                if (oRole.DIVISION !== null && oRole.DIVISION.trim().length > 0 && oRole.DIVISION.trim() !== oPOReq.Spart) {
                    console.log("Skipping ", oRole.APP_LEVEL_ROLE, " DIVISION missmatch ");
                    continue;
                }
                let unm = false;
                let matchValue = 3;
                for (let roleCol in columns) {
                    let soCol = columns[roleCol];
                    if (oRole[roleCol] === "" || oRole[roleCol] === null) {
                        continue;
                    }

                    if (oRole[roleCol] === oPOReq[soCol]) {
                        matchValue += columnsValues[roleCol];
                    } else {
                        // skip role if not matching
                        unm = true;
                        break;
                    }
                }
                if (unm) {
                    continue;
                }
                oRole.matchValue = matchValue;

                // if matchValue is same, then sort based on app level, lower approver level should be selected first
                if (oRole.APP_LEVEL !== "" && !isNaN(oRole.APP_LEVEL)) {
                    oRole.matchValue = (matchValue * 100) + Number(oRole.APP_LEVEL);
                }

                soRoles.push(oRole);
            }
        }
    }

    soRoles.sort((a, b) => b.matchValue - a.matchValue);

    // console.log("SO Roles ", soRoles);
    allSoRoles.sort((a, b) => Number.parseInt(b.APP_LEVEL) - Number.parseInt(a.APP_LEVEL));

    const levelMap = createSalesOrgLevelMap(allRoles);

    return {
        SALESORG_LEVEL_MAP: levelMap,
        ANY_SO_ROLES: allSoRoles,
        SO_ROLES: soRoles,
        SO_DEF_ROLE: default_SO_DC_Role,
        SO_DEF_BB_ROLE: default_SO_DC_BB_Role
    }
}

function getL3ApproverRole(allRoles, oPOReq) {
    if (oPOReq.DropShip === "NO") {
        return "NOT_REQ";
    }

    const gpMargin = oPOReq.Util;

    const roleSpec = getSoRoles(allRoles, oPOReq);
    console.log(roleSpec);

    // if no roles are maintained
    // if (roleSpec.SO_ROLES.length <= 0) {
    //     return roleSpec.SO_DEF_ROLE.APP_LEVEL_ROLE;
    // }

    // so roles sorted by matched values desc order
    for (let oRole of roleSpec.SO_ROLES) {
        if (Number(gpMargin) >= Number(oRole.THRESHOLD)) {
            return oRole.APP_LEVEL_ROLE;
        }

        let sLeastLevel = roleSpec.SALESORG_LEVEL_MAP.get(oRole.SALES_ORG) + '';
        if (oRole.APP_LEVEL === sLeastLevel) {
            return oRole.APP_LEVEL_ROLE;
        }
    }


    // if nothing matches
    return "NOT_REQ";
}

function main() {
    const RM = require("./ROLE_MATRIX.json");
    const roles = getL3ApproverRole(RM, PO.d)
    console.log(roles)
}

// get PO /sap/opu/odata/sap/ZODS_PO_WORKFLOW_SRV/POwfstatusSet(PoReqno='P240000277',PoNumber='5180152445',DocType='Z8NB',PruchGroup='SGC')
PO = {
    "d": {
        "__metadata": {
            "id": "https://meaps4hqas.asia.meap.com:44300/sap/opu/odata/sap/ZODS_PO_WORKFLOW_SRV/POwfstatusSet(PoReqno='P240000277',PoNumber='5180152445',DocType='Z8NB',PruchGroup='SG3')",
            "uri": "https://meaps4hqas.asia.meap.com:44300/sap/opu/odata/sap/ZODS_PO_WORKFLOW_SRV/POwfstatusSet(PoReqno='P240000277',PoNumber='5180152445',DocType='Z8NB',PruchGroup='SG3')",
            "type": "ZODS_PO_WORKFLOW_SRV.POwfstatus"
        },
        "PoReqno": "P240000277",
        "PoNumber": "5180152445",
        "DocType": "Z8NB",
        "PruchGroup": "SG3",
        "Ernam": "ChoyTing.Chew@asia.meap.com",
        "Lname": "CHEW",
        "Fname": "CHOY TING",
        "DropShip": "YES",
        "PoValue": "562.460",
        "Wftrgtobtp": "CREATE",
        "Wftrgfrombtp": "TRIGGERED",
        "Wfapprlevel": "L1",
        "Wfapprstatus": "APPR",
        "L1apprEmail": "steven_wc@asia.meap.com",
        "L1approver": "Steven_WC Steven_WC",
        "L1approverRole": "ZSG_BTP_SD_SO.1801_LEVEL_1,ZSG_BTP_SD_SO.1801_LEVEL_DEF_BB,ZSG_BTP_SD_SO.1802_LEVEL_1,ZSG_BTP_SD_SO.1802_LEVEL_DEF_BB,ZSG_MM_PO_T_L1_APPR.SG1,ZSG_MM_PO_T_L1_APPR.SG2,ZSG_MM_PO_T_L1_APPR.SG3,ZSG_MM_PO_T_L2_APPR.SG1,ZSG_MM_PO_T_L2_APPR.SG2,ZSG_MM_PO_T_L2_APPR.SG3,ZSG_MM_PO_T_L3_APPR.SG1,ZSG_MM_PO_T_L3_APPR.SG2,ZSG_MM_PO_T_L3_APPR.SG3,",
        "L1approverDate": "\/Date(1719532800000)\/",
        "L1approverTime": "PT09H27M17S",
        "L1apprStatus": "APPR",
        "L2apprEmail": "",
        "L2approver": "",
        "L2approverRole": "",
        "L2approverDate": null,
        "L2approverTime": "PT00H00M00S",
        "L2apprStatus": "",
        "L3apprEmail": "",
        "L3approver": "",
        "L3approverRole": "",
        "L3approverDate": null,
        "L3approverTime": "PT00H00M00S",
        "L3apprStatus": "",
        "L1comments": "",
        "L2comments": "",
        "L3comments": "",
        "OverallStatus": "INPROG",
        "Wfinstanceid": "0f688e63-352f-11ef-9a3e-eeee0a9cb845",
        "Util": "0.000",
        "Vkorg": "",
        "Vtweg": "",
        "Spart": "",
        "Auart": "",
        "Kunnr": "",
        "Enduser": "",
        "Matkl": "",
        "Prodg": "",
        "Prodh": ""
    }
};

main()
