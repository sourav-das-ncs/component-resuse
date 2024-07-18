import json
import sqlite3
from contextlib import closing

import pandas as pd


def isRolePresent(conn, ROLE_NAME):
    with closing(conn.cursor()) as cursor:
        sql = """
                SELECT COUNT(*) FROM ECC_AUTH_VIEW
                WHERE S4_DERIVED_ROLE = ?
                """
        # print(sql)
        result = cursor.execute(sql, [ROLE_NAME]).fetchone()
        return result[0] > 0


def isObjectPresent(conn, ROLE_NAME, OBJECT):
    with closing(conn.cursor()) as cursor:
        sql = """
                SELECT COUNT(*) FROM ECC_AUTH_VIEW
                WHERE S4_DERIVED_ROLE = ? AND OBJECT = ?
                """
        # print(sql)
        result = cursor.execute(sql, [ROLE_NAME, OBJECT]).fetchone()
        return result[0] > 0


def isFieldPresent(conn, ROLE_NAME, OBJECT, FIELD):
    with closing(conn.cursor()) as cursor:
        sql = """
                SELECT COUNT(*) FROM ECC_AUTH_VIEW
                WHERE S4_DERIVED_ROLE = ? AND OBJECT = ? AND FIELD = ?
                """
        # print(sql)
        result = cursor.execute(sql, [ROLE_NAME, OBJECT, FIELD]).fetchone()
        return result[0] > 0


def isLOWPresent(conn, ROLE_NAME, OBJECT, FIELD, LOW):
    with closing(conn.cursor()) as cursor:
        sql = """
                SELECT COUNT(*) FROM ECC_AUTH_VIEW
                WHERE S4_DERIVED_ROLE = ? AND OBJECT = ? AND FIELD = ? AND LOW is ?
                """
        # print(sql)
        result = cursor.execute(sql, [ROLE_NAME, OBJECT, FIELD, LOW]).fetchone()
        return result[0] > 0


def isHIGHPresent(conn, ROLE_NAME, OBJECT, FIELD, LOW, HIGH):
    with closing(conn.cursor()) as cursor:
        sql = """
                SELECT COUNT(*) FROM ECC_AUTH_VIEW
                WHERE S4_DERIVED_ROLE = ? AND OBJECT = ? AND FIELD = ? AND LOW is ? AND HIGH is ?
                """
        # print(sql)
        result = cursor.execute(sql, [ROLE_NAME, OBJECT, FIELD, LOW, HIGH]).fetchone()
        return result[0] > 0


def checkIfValuePresentInECC(conn, s4_row, output: list):
    with closing(conn.cursor()) as cursor:
        isObjPresentInEcc = isObjectPresent(conn, s4_row['AGR_NAME'], s4_row['OBJECT'])

        isStarPresentInEcc = isLOWPresent(conn, s4_row['AGR_NAME'], s4_row['OBJECT'], s4_row['FIELD'], s4_row['LOW']) \
                        or isHIGHPresent(conn, s4_row['AGR_NAME'], s4_row['OBJECT'], s4_row['FIELD'], s4_row['LOW'],
                                         s4_row['HIGH'])

        if isObjPresentInEcc and not isStarPresentInEcc:
            # sql = """
            #     SELECT * FROM ECC_AUTH_VIEW
            #     WHERE S4_DERIVED_ROLE = ? AND OBJECT = ? AND FIELD = ? AND LOW = ?
            #     """
            # # print(sql)
            # result = cursor.execute(sql, [s4_row['AGR_NAME'], s4_row['OBJECT'], s4_row['FIELD'],
            #                               s4_row['LOW']]).fetchall()
            # result = list(result)
            obj = {
                "S4_ROLE": s4_row['AGR_NAME'],
                'OBJECT': s4_row['OBJECT'],
                'FIELD': s4_row['FIELD'],
                'LOW': s4_row['LOW'],
                'HIGH': s4_row['HIGH'],
                # 'ECC_LOW': result[0]['LOW'],
                # 'ECC_HIGH': result[0]['HIGH'],
                # 'ECC_S4_DERIVED_ROLE': result[0]['S4_DERIVED_ROLE'],
                # 'ECC_MATCHED_ROLE': result[0]['AGR_NAME'],
                # 'ECC_MATCHED_OBJECT': result[0]['OBJECT'],
                # 'ECC_MATCHED_FIELD': result[0]['FIELD']
            }
            output.append(obj)
            print(obj)

    pass


def main():
    output = []

    with closing(sqlite3.connect('../identifier.sqlite')) as conn:
        conn.row_factory = sqlite3.Row
        conn.set_trace_callback(print)

        with closing(conn.cursor()) as cursor:
            results = cursor.execute("""
            SELECT * FROM "901_AGR_1251_DUMP" WHERE
            AGR_NAME LIKE 'ZSG%' AND (LOW = '*' OR HIGH = '*') 
            ORDER BY AGR_NAME, OBJECT, FIELD
            """).fetchall()

            for row in results:
                checkIfValuePresentInECC(conn, row, output)
    # print(json.dumps(output, indent=4))

    df = pd.DataFrame(output, columns=output[0].keys())

    print("data frame created", df.head())

    df.to_excel("RM_STAR.xlsx", index=False)

    pass


if __name__ == "__main__":
    main()
