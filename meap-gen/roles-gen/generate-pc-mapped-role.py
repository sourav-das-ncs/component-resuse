import csv

import pandas as pd
import re


def get_pc_mapping():
    pc_map = {}
    with open('profit-center-mapping.csv', 'r') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            oldPc = row['Old_PC']
            newPc = row['New_PC']
            pc_map[oldPc] = newPc
    return pc_map


def main():
    pc_map = get_pc_mapping()
    df = pd.read_excel('../reconfigured.xlsx')

    def s4_derived_role(row):
        role = row['Role']
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

    df['S4_DERIVED_ROLE'] = df.apply(s4_derived_role, axis=1)

    df.to_excel('reconfigured.xlsx', index=False, sheet_name="usermapping")

    print(df['S4_DERIVED_ROLE'])

    pass


if __name__ == '__main__':
    main()
