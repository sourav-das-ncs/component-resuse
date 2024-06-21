import csv
import json
import re

import pandas as pd


def get_email_mapping():
    email_map = {}
    with open('userid-email-map.csv', 'r') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            userid = row['ï»¿User']
            email = row['E-Mail Address']
            email_map[userid] = email
    return email_map


def get_so_mapping():
    so_map = {}
    with open('pc-2-so-map.csv', 'r') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            newPc = row['NEW_PC']
            sorg = row['SALES_ORG']
            if newPc not in so_map:
                so_map[newPc] = []
            so_map[newPc].append(sorg)
    return so_map


def get_pc_mapping():
    pc_map = {}
    with open('profit-center-mapping.csv', 'r') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            oldPc = row['Old_PC']
            newPc = row['New_PC']
            pc_map[oldPc] = newPc
    return pc_map


def s4_derived_role(role_name, pc_map):
    role = role_name
    split = re.split("(.*)_([0-9]{3})(_?.*)", role)
    split = list(filter(lambda x: len(x) > 0, split))
    if len(split) == 3:
        newPC = split[1]
        if split[1] in pc_map:
            newPC = pc_map[split[1]]
        return split[0] + '_' + newPC + split[2]
    if len(split) == 2:
        newPC = split[1]
        if split[1] in pc_map:
            newPC = pc_map[split[1]]
        return split[0] + '_' + newPC
    if len(split) == 1:
        return split[0]
    return ""


def get_new_profit_center(role_name, pc_map):
    role = role_name
    split = re.split("(.*)_([0-9]{3})(_?.*)", role)
    split = list(filter(lambda x: len(x) > 0, split))
    if len(split) == 3:
        newPC = split[1]
        if split[1] in pc_map:
            newPC = pc_map[split[1]]
        return newPC
    if len(split) == 2:
        newPC = split[1]
        if split[1] in pc_map:
            newPC = pc_map[split[1]]
        return newPC
    if len(split) == 1:
        return split[0]
    return ""


def main():
    pc_map = get_pc_mapping()
    so_map = get_so_mapping()
    email_map = get_email_mapping()

    output = []

    uniq = set()

    df = pd.read_excel('output_Q12_dm2.xlsx', sheet_name='ECC')

    def startswith(role_name: str):
        wanted_roles = {'ZSG_CS_NO.PRO', 'ZSG_SD_SO.DSP', 'ZSG_SD_SO.PRO_ADMIN'}
        for wr in wanted_roles:
            if role_name.startswith(wr):
                return True
        return False

    for index, row in df.iterrows():
        role_name = row['ROLE NAME']
        user_name = row['USER NAME']
        if startswith(role_name):
            new_pc = get_new_profit_center(role_name, pc_map)
            email = email_map[user_name] if user_name in email_map else ""
            if new_pc not in so_map:
                continue
            for so in so_map[new_pc]:
                JK = f'JK{user_name}-{new_pc}-{so}'
                if JK not in uniq:
                    output.append({
                        "EMAIL": email,
                        'USER': user_name,
                        'PC': new_pc,
                        'SALE_ORG': so,
                    })
                    uniq.add(JK)

    with open('json-output.json', 'w') as file:
        json.dump(output, file)

    new_df = pd.DataFrame(output, columns=["EMAIL", "USER", "PC", "SALE_ORG"])

    new_df.to_excel('output-so.xlsx', index=False)

    pass


if __name__ == '__main__':
    main()
