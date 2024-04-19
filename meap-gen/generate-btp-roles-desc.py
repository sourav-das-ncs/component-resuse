import csv
import json

import pandas as pd


def get_role_metadata():
    role_metadata = {}

    with open('parent_derive_role_mapping.csv', 'r') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            role = row['ROLE']
            parent_role = row['MASTER_ROLE']
            desc = row['DESC']
            if role not in role_metadata:
                role_metadata[role] = {}
            role_metadata[role]["parent_role"] = parent_role
            role_metadata[role]["desc"] = desc

    with open('role_desc.csv', 'r') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            role = row['ROLE']
            desc = row['DESC']
            if role not in role_metadata:
                continue
            role_metadata[role]["desc"] = desc
    return role_metadata


def main():
    global ROLES
    # df = pd.ExcelFile('all_roles.xlsx')
    # print(df.sheet_names)
    # print()
    role_metadata = get_role_metadata()

    df = pd.read_excel('C:\\Users\\P1360072\\OneDrive - NCS PTE LTD\\Copy of Active MEAP Users in P11 with roles_.xlsx',
                       sheet_name="usermapping")

    print(df.head())
    # df.to_csv("all_roles.csv", index=False)

    data = {}

    # ROLES = set(ROLES)

    def aply(row):
        df_role = row['Role']
        if df_role not in role_metadata:
            print("Role not found ", df_role)
            return ""
        parent_role = role_metadata[df_role]["parent_role"]
        if parent_role == "":
            return df_role
        # if parent_role in ROLES:
        #     return parent_role
        return parent_role
        pass

    def btp_role(row):
        df_role = row['MASTER_ROLE']
        return f"~q22_901_{df_role}"

    def btp_desc(row):
        df_role = row['MASTER_ROLE']
        if df_role in role_metadata:
            return role_metadata[df_role]["desc"]
        return ""

    df['MASTER_ROLE'] = df.apply(aply, axis=1)
    df['BTP_ROLE'] = df.apply(btp_role, axis=1)
    df['BTP_DESC'] = df.apply(btp_desc, axis=1)
    # print(row['Role'])

    df.to_excel('reconfigured.xlsx', index=False, sheet_name="usermapping")
    # for role in ROLES:
    #     filtered_df = df[df['Role'].str.contains(role, case=False, regex=False)]
    #     data[role] = {
    #         "btp_role": "",
    #         "desc": "",
    #         "users": filtered_df['E-Mail Address'].dropna().to_list(),
    #     }

    with open('role-user.json', 'w') as f:
        json.dump(data, f)

    pass


if __name__ == '__main__':
    main()
