import csv
import re
import sqlite3
from contextlib import closing
from datetime import date, datetime

import numpy as np
import pandas as pd

output = []
from dateutil.parser import parse

ECC_ASGN = {}
S4_ASGN = {}

output = []


def isRolePresent(conn, ROLE_NAME):
    with closing(conn.cursor()) as cursor:
        sql = """
                SELECT COUNT(*) FROM DEV_AGR_1251_DUMP
                WHERE AGR_NAME = ?
                """
        # print(sql)
        result = cursor.execute(sql, [ROLE_NAME]).fetchone()
        return result[0] > 0


def process(conn):
    for key in ECC_ASGN.keys():
        eccItem = ECC_ASGN[key]

        isPresentInS4 = key in S4_ASGN

        remark = "Pending"

        if isPresentInS4:
            remark = "OK"

        if eccItem['TO_DATE'] < datetime(2024, 9, 30, 0, 0):
            if isPresentInS4:
                remark = "present in s4, but validity expired in ecc"
            else:
                remark = "validity expired"

        roleIsThere = isRolePresent(conn, eccItem['S4_DERIVED_ROLE'])
        if not roleIsThere:
            remark = "role is not there in s4"

        output.append({
            "UNAME": eccItem['UNAME'],
            "ECC_ROLE": eccItem["AGR_NAME"],
            "S4_DERIVED_ROLE": eccItem['S4_DERIVED_ROLE'],
            "TO_DATE": eccItem['TO_DATE'],
            "REMARKS": remark,
        })

        # s4Item = S4_ASGN[key]

    # print(row)
    pass


def main():
    with closing(sqlite3.connect('../identifier.sqlite')) as conn:
        conn.row_factory = sqlite3.Row
        conn.set_trace_callback(print)
        with closing(conn.cursor()) as cursor:
            data = cursor.execute(
                """
                SELECT * FROM ECC_AGR_USERS ECC
                  JOIN PC_MAPPED_ECC_ROLES ON PC_MAPPED_ECC_ROLES.ECC_ROLE = ECC.AGR_NAME
                """).fetchall()
            for row in data:
                to_date = parse(row['TO_DAT'])
                KEY = row['S4_DERIVED_ROLE'] + row['UNAME']
                ECC_ASGN[KEY] = {
                    "AGR_NAME": row['AGR_NAME'],
                    "S4_DERIVED_ROLE": row['S4_DERIVED_ROLE'],
                    "UNAME": row['UNAME'],
                    "TO_DATE": to_date
                }

            data = cursor.execute(
                """
                SELECT * FROM UAT_AGR_USERS S4
                  JOIN PC_MAPPED_ECC_ROLES ON PC_MAPPED_ECC_ROLES.S4_DERIVED_ROLE = S4.AGR_NAME
                """).fetchall()
            for row in data:
                to_date = parse(row['TO_DAT'])
                KEY = row['S4_DERIVED_ROLE'] + row['UNAME']
                S4_ASGN[KEY] = {
                    "AGR_NAME": row['AGR_NAME'],
                    "S4_DERIVED_ROLE": row['S4_DERIVED_ROLE'],
                    "UNAME": row['UNAME'],
                    "TO_DATE": to_date
                }
        # conn.commit()

        # print(ECC_ASGN)
        # print(S4_ASGN)
        process(conn)
        print(output)
        pd.DataFrame(output).to_excel("user-assignment-cmp.xlsx", index=False)


if __name__ == '__main__':
    main()
