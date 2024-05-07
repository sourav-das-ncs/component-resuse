import csv
import json

import pandas as pd


class SetEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, set):
            return list(obj)
        return json.JSONEncoder.default(self, obj)


def get_tcode_desc():
    tcode_desc = {}
    with open('tcode_desc.csv', 'r') as file:
        csv_reader = csv.DictReader(file)
        # data = [row for row in csv_reader]
        for row in csv_reader:
            tcode_desc[row["Transaction Code"]] = row["Text"]
    return tcode_desc


def get_auth_obj_desc():
    auth_obj_desc = {}
    with open('auth_obj_desc.csv', 'r') as file:
        csv_reader = csv.DictReader(file)
        # data = [row for row in csv_reader]
        for row in csv_reader:
            auth_obj_desc[row["ï»¿Object Name"]] = row["Text - Description"]
    return auth_obj_desc


def get_value_desc():
    value_desc = {}
    with open('value_desc.csv', 'r') as file:
        csv_reader = csv.DictReader(file)
        # data = [row for row in csv_reader]
        for row in csv_reader:
            value_desc[row["ï»¿Activity"]] = row["Text"]
    return value_desc


def main():
    tcode_desc = get_tcode_desc()

    auth_obj_desc = get_auth_obj_desc()

    value_desc = get_value_desc()

    nosql_struct = {}

    with open('filtered_roles.csv', 'r') as file:
        csv_reader = csv.DictReader(file)
        # data = [row for row in csv_reader]
        for row in csv_reader:
            role = row['AGR_NAME']
            auth_obj = row['OBJECT']
            fld_name = row['FIELD']
            frm_val = row['LOW']
            to_val = row['HIGH']
            #
            if role not in nosql_struct:
                nosql_struct[role] = {
                    "DESC": "",
                    "TCODE": {},
                    "ACTVT": {},
                    "USERS": {"NO USER"}
                }

            if auth_obj == "S_TCODE":
                nosql_struct[role]["TCODE"][frm_val] = {
                    "TCODE": frm_val,
                    "DESC": tcode_desc[frm_val] if frm_val in tcode_desc else ""
                }

            set_mapping = {
                "BUKRS": "CC",
                "EKGRP": "PRG",
                "PRCTR": "PC",
                "WERKS": "PLNT",
                "SPART": "DIV",
                "VTWEG": "DIST_CHNL",
                "VKORG": "SALES_ORG",
                "EKORG": "PUR_ORG",
                "ZM_PRCTR": "CUSTOM_PC",
                "BWKEY": "VAL_AREA",
                "IWERK": "MAINT_PLAN_PLANT",
                "KOART": "ACC_TYPE",
                "KOKRS": "CO_AREA",
                "LGNUM": "WAHS_COMPLEX",
                "LGTYP": "STRG_TYPE",
                "PLVAR": "PLAN_VER",
                "SWERK": "MAINT_PLANT",
                "VSTEL": "SHP_POINT"
                # "zyc": "STORAGE_LOC",
            }

            if fld_name in set_mapping:
                mv = set_mapping[fld_name]
                if mv not in nosql_struct[role]:
                    nosql_struct[role][mv] = set()
                nosql_struct[role][mv].add(frm_val)

            if fld_name in {"ACTVT", "PS_ACTVT", "SUB_ACTVT"}:
                nosql_struct[role]["ACTVT"][auth_obj] = {
                    "OBJ": auth_obj,
                    "OBJ_DESC": auth_obj_desc[auth_obj] if auth_obj in auth_obj_desc else "",
                    "FIELD_NAME": fld_name,
                    "FROM_VAL": frm_val,
                    "TO_VAL": to_val,
                    "FROM_DESC": value_desc[frm_val] if frm_val in value_desc else "",
                    "TO_DESC": value_desc[to_val] if to_val in value_desc else ""
                }

    with open('all_users.csv', 'r') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            username = row['UNAME']
            role = row['AGR_NAME']
            if role not in nosql_struct:
                continue
            nosql_struct[role]["USERS"].add(username)
            if "NO USER" in nosql_struct[role]["USERS"]:
                nosql_struct[role]["USERS"].remove("NO USER")
            # if "DESC" in row:
            #     nosql_struct[role]["DESC"] = row['DESC']

    with open('parent_derive_role_mapping.csv', 'r') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            role = row['ROLE']
            desc = row['DESC']
            if role not in nosql_struct:
                continue
            # if "DESC" in nosql_struct[role]:
            #     continue
            nosql_struct[role]["DESC"] = desc

    # print(nosql_struct)

    with open('data.json', 'w') as f:
        json.dump(nosql_struct, f, cls=SetEncoder)

    output = []

    fields = ["USER_NAME", "ROLE_NAME", "ROLE_DESC", "TCODE", "TCODE_DESC",
              "AUTH_OBJ", "AUTH_OBJ_DESC", "FIELD_NAME", "FROM_VAL", "TO_VAL", "FROM_DESC", "TO_DESC"]

    int_to_out_fields = {
        "SALES_ORG": "SALES_ORG",
        "DIST_CHNL": "DIST_CHNL",
        "DIV": "DIV",
        # "STORAGE_LOC": "STORAGE_LOC",
        "PUR_ORG": "PURCHASE_GROUP",
        "CC": "COMPANY_CODE",
        "PRG": "PURCHASE_GROUP",
        "PC": "PROFIT_CENTER",
        "PLNT": "PLANT",
        "ZM_PRCTR": "CUSTOM_PC",
        "VAL_AREA": "VAL_AREA",
        "MAINT_PLAN_PLANT": "MAINT_PLAN_PLANT",
        "ACC_TYPE": "ACC_TYPE",
        "CO_AREA": "CO_AREA",
        "WAHS_COMPLEX": "WAHS_COMPLEX",
        "STRG_TYPE": "STRG_TYPE",
        "PLAN_VER": "PLAN_VER",
        "MAINT_PLANT": "MAINT_PLANT",
        "SHP_POINT": "SHP_POINT"
    }

    for ifld in int_to_out_fields:
        fields.append(int_to_out_fields[ifld])

    def add_row(row):
        new_row = {}
        for fld in fields:
            if fld in row:
                new_row[fld] = row[fld]
            else:
                new_row[fld] = ""
        output.append(new_row)
        return new_row

    for role_name in nosql_struct:
        for username in sorted(nosql_struct[role_name]["USERS"]):
            role = nosql_struct[role_name]
            print("Working for ", role_name)
            for tcode in role["TCODE"]:
                tcode_obj = role["TCODE"][tcode]
                add_row({
                    "USER_NAME": username,
                    "ROLE_NAME": role_name,
                    "ROLE_DESC": role["DESC"],
                    "TCODE": tcode_obj["TCODE"],
                    "TCODE_DESC": tcode_obj["DESC"]
                })

            for internal_field in int_to_out_fields:
                if internal_field not in role:
                    continue
                out_field = int_to_out_fields[internal_field]
                for val in role[internal_field]:
                    add_row({
                        "USER_NAME": username,
                        "ROLE_NAME": role_name,
                        "ROLE_DESC": role["DESC"],
                        out_field: val
                    })

            for auth_obj in role["ACTVT"]:
                dic_row = role["ACTVT"][auth_obj]
                add_row({
                    "USER_NAME": username,
                    "ROLE_NAME": role_name,
                    "ROLE_DESC": role["DESC"],
                    "AUTH_OBJ": dic_row["OBJ"],
                    "AUTH_OBJ DESC": dic_row["OBJ_DESC"],
                    "FIELD_NAME": dic_row["FIELD_NAME"],
                    "FROM_VAL": dic_row["FROM_VAL"],
                    "TO_VAL": dic_row["TO_VAL"],
                    "FROM_DESC": dic_row["FROM_DESC"],
                    "TO_DESC": dic_row["TO_DESC"]
                })

    df = pd.DataFrame(output, columns=fields)

    print("data frame created", df.head())

    # df.to_excel("output.xlsx", index=False)

    df.to_csv("output.csv", index=False)

    # with open('../output.csv', 'w', encoding='UTF8', newline='') as f:
    #     writer = csv.DictWriter(f, fieldnames=fields)
    #     writer.writeheader()
    #     writer.writerows(output)

    pass


if __name__ == '__main__':
    main()
