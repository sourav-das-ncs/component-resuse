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
                    "CC": set(),
                    "PRG": set(),
                    "PC": set(),
                    "PLNT": set(),
                    "ACTVT": {},
                    "USERS": {"NO USER"}
                }

            if auth_obj == "S_TCODE":
                nosql_struct[role]["TCODE"][frm_val] = {
                    "TCODE": frm_val,
                    "DESC": tcode_desc[frm_val] if frm_val in tcode_desc else ""
                }

            if fld_name == "BUKRS":
                nosql_struct[role]["CC"].add(frm_val)

            if fld_name == "EKGRP":
                nosql_struct[role]["PRG"].add(frm_val)

            if fld_name == "PRCTR":
                nosql_struct[role]["PC"].add(frm_val)

            if fld_name == "WERKS":
                nosql_struct[role]["PLNT"].add(frm_val)

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
            if "DESC" in row:
                nosql_struct[role]["DESC"] = row['DESC']

    with open('parent_derive_role_mapping.csv', 'r') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            role = row['ROLE']
            desc = row['DESC']
            if role not in nosql_struct:
                continue
            if "DESC" in nosql_struct[role]:
                continue
            nosql_struct[role]["DESC"] = desc

    # print(nosql_struct)

    with open('../data.json', 'w') as f:
        json.dump(nosql_struct, f, cls=SetEncoder)

    output = []

    fields = ["USER NAME", "ROLE NAME", "ROLE DESC", "TCODE", "TCODE DESC", "COMPANY CODE", "PURCHASE GROUP",
              "PROFIT CENTER",
              "PLANT",
              "AUTH OBJ", "AUTH OBJ DESC", "FIELD NAME", "FROM VAL", "TO VAL", "FROM DESC", "TO DESC"]

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
                    "USER NAME": username,
                    "ROLE NAME": role_name,
                    "ROLE DESC": role["DESC"],
                    "TCODE": tcode_obj["TCODE"],
                    "TCODE DESC": tcode_obj["DESC"]
                })

            for CC in role["CC"]:
                add_row({
                    "USER NAME": username,
                    "ROLE NAME": role_name,
                    "ROLE DESC": role["DESC"],
                    "COMPANY CODE": CC,
                })

            for PRG in role["PRG"]:
                add_row({
                    "USER NAME": username,
                    "ROLE NAME": role_name,
                    "ROLE DESC": role["DESC"],
                    "PURCHASE GROUP": PRG
                })

            for PC in role["PC"]:
                add_row({
                    "USER NAME": username,
                    "ROLE NAME": role_name,
                    "ROLE DESC": role["DESC"],
                    "PROFIT CENTER": PC
                })

            for PLNT in role["PLNT"]:
                add_row({
                    "USER NAME": username,
                    "ROLE NAME": role_name,
                    "ROLE DESC": role["DESC"],
                    "PLANT": PLNT
                })

            for auth_obj in role["ACTVT"]:
                dic_row = role["ACTVT"][auth_obj]
                add_row({
                    "USER NAME": username,
                    "ROLE NAME": role_name,
                    "ROLE DESC": role["DESC"],
                    "AUTH OBJ": dic_row["OBJ"],
                    "AUTH OBJ DESC": dic_row["OBJ_DESC"],
                    "FIELD NAME": dic_row["FIELD_NAME"],
                    "FROM VAL": dic_row["FROM_VAL"],
                    "TO VAL": dic_row["TO_VAL"],
                    "FROM DESC": dic_row["FROM_DESC"],
                    "TO DESC": dic_row["TO_DESC"]
                })

    df = pd.DataFrame(output, columns=fields)

    print("data frame created", df.head())

    df.to_excel("output-q22-901.xlsx", index=False)

    # with open('../output.csv', 'w', encoding='UTF8', newline='') as f:
    #     writer = csv.DictWriter(f, fieldnames=fields)
    #     writer.writeheader()
    #     writer.writerows(output)

    pass


if __name__ == '__main__':
    main()
