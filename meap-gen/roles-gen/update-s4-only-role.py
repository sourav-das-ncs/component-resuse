import csv
import re
import sqlite3
from contextlib import closing

import numpy as np
import pandas as pd


def processr_row(row, conn):
    remarks = row['Remarks']
    AGR_NAME = row['AGR_NAME']
    OBJECT = row['OBJECT']
    FIELD = row['FIELD']
    row['comments'] = ""
    if remarks == "Copy from 872":
        AGR_NAME = AGR_NAME.replace("873", "872")
        with closing(conn.cursor()) as cursor:
            results = cursor.execute("""
                SELECT * FROM "901_AGR_1251_DUMP" 
                WHERE AGR_NAME = ?
                AND OBJECT = ? AND FIELD = ?
                                        """, [AGR_NAME, OBJECT, FIELD]).fetchall()

            row["LOW"] = results[0]['LOW']
            row["HIGH"] = results[0]['HIGH']

        if row["LOW"] is None and row["HIGH"] is None:
            row['comments'] = "no value found"

    elif remarks == "Copy from any other existing role":
        AGR_NAME = AGR_NAME.replace("716", "%")
        with closing(conn.cursor()) as cursor:
            results = cursor.execute("""
                SELECT * FROM "901_AGR_1251_DUMP" 
                WHERE AGR_NAME LIKE ?
                AND OBJECT = ? AND FIELD = ? AND LOW IS NOT NULL
                                        """, [AGR_NAME, OBJECT, FIELD]).fetchall()
            if len(results) > 0:
                row["LOW"] = results[0]['LOW']
                row["HIGH"] = results[0]['HIGH']

        if row["LOW"] is None and row["HIGH"] is None:
            row['comments'] = "no value found"

    elif remarks == "Copy from ZSG_MM_LO.PRO-GR related roles":
        # AGR_NAME = AGR_NAME.replace("716", "%")
        with closing(conn.cursor()) as cursor:
            results = cursor.execute("""
                SELECT * FROM "901_AGR_1251_DUMP" 
                WHERE AGR_NAME LIKE 'ZSG_MM_LO.NT.PRO-GR_%'
                AND OBJECT = ? AND FIELD = ? AND LOW IS NOT NULL
                                        """, [OBJECT, FIELD]).fetchall()
            if len(results) > 0:
                row["LOW"] = results[0]['LOW']
                row["HIGH"] = results[0]['HIGH']

        if row["LOW"] is None and row["HIGH"] is None:
            row['comments'] = "no value found"
        pass

    elif remarks == "Copy values from existing role":
        # AGR_NAME = AGR_NAME.replace("716", "%")
        AGR_NAME = re.sub(r"(\d{3}|XXX)", r"%", AGR_NAME)
        with closing(conn.cursor()) as cursor:
            results = cursor.execute("""
                SELECT * FROM "901_AGR_1251_DUMP" 
                WHERE AGR_NAME LIKE ?
                AND OBJECT = ? AND FIELD = ? AND LOW IS NOT NULL
                                        """, [AGR_NAME, OBJECT, FIELD]).fetchall()
            if len(results) > 0:
                row["LOW"] = results[0]['LOW']
                row["HIGH"] = results[0]['HIGH']

        if row["LOW"] is None and row["HIGH"] is None:
            row['comments'] = "no value found"
        pass

    elif remarks == "Copy values from ZSG_MM_PO.PRO related roles":
        AGR_NAME = re.sub(r"(\d{3}|XXX)", r"%", AGR_NAME)
        with closing(conn.cursor()) as cursor:
            results = cursor.execute("""
                SELECT * FROM "901_AGR_1251_DUMP" 
                WHERE AGR_NAME LIKE ?
                AND OBJECT = ? AND FIELD = ? AND LOW IS NOT NULL
                                        """, [AGR_NAME, OBJECT, FIELD]).fetchall()
            if len(results) > 0:
                row["LOW"] = results[0]['LOW']
                row["HIGH"] = results[0]['HIGH']

        if row["LOW"] is None and row["HIGH"] is None:
            row['comments'] = "no value found"

    elif remarks == "Copy values from ZSG_MM_PO.PRT roles":
        with closing(conn.cursor()) as cursor:
            results = cursor.execute("""
                SELECT * FROM "901_AGR_1251_DUMP" 
                WHERE AGR_NAME = 'ZSG_MM_PO.PRT'
                AND OBJECT = ? AND FIELD = ? AND LOW IS NOT NULL
                                        """, [OBJECT, FIELD]).fetchall()
            if len(results) > 0:
                row["LOW"] = results[0]['LOW']
                row["HIGH"] = results[0]['HIGH']

        if row["LOW"] is None and row["HIGH"] is None:
            row['comments'] = "no value found"

    elif remarks == "Please check between old role to new role on the values":
        AGR_NAME = re.sub(r"(\d{3}|XXX)", r"%", AGR_NAME)
        with closing(conn.cursor()) as cursor:
            results = cursor.execute("""
                SELECT * FROM "901_AGR_1251_DUMP" 
                WHERE AGR_NAME LIKE ?
                AND OBJECT = ? AND FIELD = ? AND LOW IS NOT NULL
                                        """, [AGR_NAME, OBJECT, FIELD]).fetchall()
            if len(results) > 0:
                row["LOW"] = results[0]['LOW']
                row["HIGH"] = results[0]['HIGH']

        if row["LOW"] is None and row["HIGH"] is None:
            row['comments'] = "no value found"

    print(row)
    pass


def main():
    with closing(sqlite3.connect('../identifier.sqlite')) as conn:
        conn.row_factory = sqlite3.Row
        conn.set_trace_callback(print)
        df = pd.read_csv("data.csv").replace(np.nan, None)
        data = df.to_dict(orient='records')
        for row in data:
            processr_row(row, conn)

        pd.DataFrame(data).to_excel("data-new.xlsx", index=False)


if __name__ == '__main__':
    main()
