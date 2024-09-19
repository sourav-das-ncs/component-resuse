import csv
import re
import sqlite3
from contextlib import closing

import numpy as np
import pandas as pd

output = []


def processr_row(s4_row, conn):
    AGR_NAME = s4_row['ECC_ROLE']
    LOW = s4_row['LOW']
    OBJECT = s4_row['OBJECT']
    # AGR_NAME = AGR_NAME.replace("ZBC", "ZSG")
    with closing(conn.cursor()) as cursor:
        cursor.execute(
            "SELECT count(*) AS CNT "
            "FROM ECC_AGR_1251_DUMP WHERE ECC_AGR_1251_DUMP.AGR_NAME = ? AND LOW = ? AND OBJECT = ? AND FIELD = 'TCD'",
            (AGR_NAME, LOW, OBJECT))
        row = cursor.fetchall()
        count = row[0]['CNT']
        if count <= 0:
            print(f"AGR_NAME: {AGR_NAME}, LOW: {LOW} not found in ecc")
            output.append({
                "AGR_NAME": s4_row['S4_DERIVED_ROLE'],
                "OBJECT": s4_row['OBJECT'],
                "FIELD": s4_row['FIELD'],
                "S4_TCODE": LOW,
                "ECC_TCODE": "",
                "ECC_ROLE": AGR_NAME,
            })
        else:
            output.append({
                "AGR_NAME": s4_row['S4_DERIVED_ROLE'],
                "OBJECT": s4_row['OBJECT'],
                "FIELD": s4_row['FIELD'],
                "S4_TCODE": LOW,
                "ECC_TCODE": LOW,
                "ECC_ROLE": AGR_NAME,
            })

    # print(row)
    pass


def main():
    with closing(sqlite3.connect('../identifier.sqlite')) as conn:
        conn.row_factory = sqlite3.Row
        conn.set_trace_callback(print)
        with closing(conn.cursor()) as cursor:
            data = cursor.execute(
                "SELECT * FROM '901_AGR_1251_DUMP' S4 "
                "JOIN PC_MAPPED_ECC_ROLES ON PC_MAPPED_ECC_ROLES.S4_DERIVED_ROLE = S4.AGR_NAME "
                "WHERE FIELD = 'TCD'").fetchall()
            for row in data:
                processr_row(row, conn)
        conn.commit()
        pd.DataFrame(output).to_excel("tcodes-in-s4-not-in-ecc.xlsx", index=False)


if __name__ == '__main__':
    main()
