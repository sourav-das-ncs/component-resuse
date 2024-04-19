import csv
import json

import pandas as pd


class SetEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, set):
            return list(obj)
        return json.JSONEncoder.default(self, obj)


def main():
    # df = pd.ExcelFile('all_roles.xlsx')
    # print(df.sheet_names)
    # print()

    df = pd.read_excel('reconfigured.xlsx', sheet_name="usermapping")
    df.fillna('', inplace=True)
    print(df.head())
    # df.to_csv("all_roles.csv", index=False)

    data = {}

    for index, row in df.iterrows():

        mrole = row['MASTER_ROLE']
        if mrole not in data:
            data[mrole] = {
                "btp_role": row['BTP_ROLE'],
                "desc": row['BTP_DESC'],
                "users": set(),
            }
        email = row['E-Mail Address']
        if len(email) > 0:
            data[mrole]['users'].add(email)

    with open('role-user.json', 'w') as f:
        json.dump(data, f, cls=SetEncoder)

    pass


if __name__ == '__main__':
    main()
