import json
import sqlite3
from contextlib import closing

import pandas as pd


def isRolePresent(conn, ROLE_NAME):
    with closing(conn.cursor()) as cursor:
        sql = """
                SELECT COUNT(*) FROM DEV_AGR_1251_DUMP
                WHERE AGR_NAME = ?
                """
        # print(sql)
        result = cursor.execute(sql, [ROLE_NAME]).fetchone()
        return result[0] > 0


def isObjectPresent(conn, ROLE_NAME, OBJECT):
    with closing(conn.cursor()) as cursor:
        sql = """
                SELECT COUNT(*) FROM DEV_AGR_1251_DUMP
                WHERE AGR_NAME = ? AND OBJECT = ?
                """
        # print(sql)
        result = cursor.execute(sql, [ROLE_NAME, OBJECT]).fetchone()
        return result[0] > 0


def isFieldPresent(conn, ROLE_NAME, OBJECT, FIELD):
    with closing(conn.cursor()) as cursor:
        sql = """
                SELECT COUNT(*) FROM DEV_AGR_1251_DUMP
                WHERE AGR_NAME = ? AND OBJECT = ? AND FIELD = ?
                """
        # print(sql)
        result = cursor.execute(sql, [ROLE_NAME, OBJECT, FIELD]).fetchone()
        return result[0] > 0


def isLOWPresent(conn, ROLE_NAME, OBJECT, FIELD, LOW):
    with closing(conn.cursor()) as cursor:
        sql = """
                SELECT COUNT(*) FROM DEV_AGR_1251_DUMP
                WHERE AGR_NAME = ? AND OBJECT = ? AND FIELD = ? AND LOW is ?
                """
        # print(sql)
        result = cursor.execute(sql, [ROLE_NAME, OBJECT, FIELD, LOW]).fetchone()
        return result[0] > 0


def isHIGHPresent(conn, ROLE_NAME, OBJECT, FIELD, LOW, HIGH):
    with closing(conn.cursor()) as cursor:
        sql = """
                SELECT COUNT(*) FROM DEV_AGR_1251_DUMP
                WHERE AGR_NAME = ? AND OBJECT = ? AND FIELD = ? AND LOW is ? AND HIGH is ?
                """
        # print(sql)
        result = cursor.execute(sql, [ROLE_NAME, OBJECT, FIELD, LOW, HIGH]).fetchone()
        return result[0] > 0


def getRemarks(conn, ROLE_NAME, OBJECT, FIELD, LOW, HIGH):
    with closing(conn.cursor()) as cursor:
        sql = """
                SELECT DISTINCT Remarks FROM AUTH_COMP_FINAL_REMARKS
                WHERE ECC_ROLE = ? AND OBJECT = ? AND FIELD = ? AND LOW is ? AND HIGH is ?
            """
        # print(sql)
        result = cursor.execute(sql, [ROLE_NAME, OBJECT, FIELD, LOW, HIGH]).fetchall()
        remarks = set(map(lambda r: r['Remarks'], result))
        return ",".join(remarks)
        pass


def getTranslatedValues(conn, ROLE_NAME, OBJECT, FIELD, LOW, HIGH):
    with closing(conn.cursor()) as cursor:
        sql = """
                        SELECT TRANSLATED_LOW, TRANSLATED_HIGH FROM AUTH_COMP_FINAL_REMARKS
                        WHERE ECC_ROLE = ? AND OBJECT = ? AND FIELD = ? AND LOW is ? AND HIGH is ? AND REL = 'PARENT'
                    """
        # print(sql)
        result = cursor.execute(sql, [ROLE_NAME, OBJECT, FIELD, LOW, HIGH]).fetchall()
        if len(result) > 0:
            return result[0]['TRANSLATED_LOW'], result[0]['TRANSLATED_HIGH']
        else:
            return "", ""


def isReq(conn, ROLE_NAME):
    with closing(conn.cursor()) as cursor:
        sql = """
                SELECT COUNT(*) FROM AUTH_COMP_FINAL_REMARKS
                WHERE ECC_ROLE = ? AND IS_REQ = 'X'
                """
        # print(sql)
        result = cursor.execute(sql, [ROLE_NAME]).fetchone()
        return result[0] > 0


IGNORE_ROLES = {'Z_COPY_SAPALL', 'Z_IN_MM_LO.MB1C',
                'Z_ROLE.ASSIGNMENT.ADM_ISS',
                'Z_IN_SD_TCS.ADM_TMP',
                'Z_ROLE_DATAEXTRACTION',
                'Z_ROLE_MM_TCODES',
                'Z_TEMPROLE-STMS',
                'Z_TEMPROLE-STVARV',
                'Z_TEMP_AUTH',
                'Z_TEMP_SU01'}


def checkIfValuePresentInS4(conn, ecc_row, output: list):
    if ecc_row['AGR_NAME'] in IGNORE_ROLES:
        return
    if not isReq(conn, ecc_row['AGR_NAME']):
        return
    with closing(conn.cursor()) as cursor:
        tl, th = getTranslatedValues(conn,
                                     ecc_row['AGR_NAME'],
                                     ecc_row['OBJECT'],
                                     ecc_row['FIELD'],
                                     ecc_row['LOW'],
                                     ecc_row['HIGH'])

        obj = {
            "ECC_ROLE": ecc_row['AGR_NAME'],
            'S4_DERIVED_ROLE': ecc_row['S4_DERIVED_ROLE'],
            'OBJECT': ecc_row['OBJECT'],
            'FIELD': ecc_row['FIELD'],
            'LOW': ecc_row['LOW'],
            'HIGH': ecc_row['HIGH'],
            'TRANSLATED_LOW': tl,
            'TRANSLATED_HIGH': th,
            'IS_PRESENT': 'NO',
            'REL': 'PARENT',
            'S4_LOW': ecc_row['LOW'] if isLOWPresent(conn,
                                                     ecc_row['S4_DERIVED_ROLE'],
                                                     ecc_row['OBJECT'],
                                                     ecc_row['FIELD'],
                                                     ecc_row['LOW']) else '#NA',
            'S4_HIGH': ecc_row['HIGH'] if isHIGHPresent(conn,
                                                        ecc_row['S4_DERIVED_ROLE'],
                                                        ecc_row['OBJECT'],
                                                        ecc_row['FIELD'],
                                                        ecc_row['LOW'],
                                                        ecc_row['HIGH']) else '#NA',
            'S4_MATCHED_ROLE': ecc_row['S4_DERIVED_ROLE'] if isRolePresent(conn,
                                                                           ecc_row['S4_DERIVED_ROLE']) else '#NA',
            'S4_MATCHED_OBJECT': ecc_row['OBJECT'] if isObjectPresent(conn,
                                                                      ecc_row['S4_DERIVED_ROLE'],
                                                                      ecc_row['OBJECT']) else '#NA',
            'S4_MATCHED_FIELD': ecc_row['FIELD'] if isFieldPresent(conn,
                                                                   ecc_row['S4_DERIVED_ROLE'],
                                                                   ecc_row['OBJECT'],
                                                                   ecc_row['FIELD']) else '#NA',
            'REMARKS': getRemarks(conn,
                                  ecc_row['AGR_NAME'],
                                  ecc_row['OBJECT'],
                                  ecc_row['FIELD'],
                                  ecc_row['LOW'],
                                  ecc_row['HIGH'])
        }

        output.append(obj)

        if obj['S4_HIGH'] == '#NA':
            # sql = """
            #         SELECT * FROM DEV_AGR_1251_DUMP
            #         WHERE AGR_NAME = ? AND OBJECT = ? AND FIELD = ?
            #         """
            # # print(sql)
            # result = cursor.execute(sql, [ecc_row['S4_DERIVED_ROLE'], ecc_row['OBJECT'], ecc_row['FIELD']]).fetchall()
            # for row in result:
            #     output.append({
            #         "ECC_ROLE": ecc_row['AGR_NAME'],
            #         'OBJECT': ecc_row['OBJECT'],
            #         'FIELD': ecc_row['FIELD'],
            #         'LOW': ecc_row['LOW'],
            #         'HIGH': ecc_row['HIGH'],
            #         'IS_PRESENT': 'NO',
            #         'REL': 'CHILD',
            #         'S4_LOW': row['LOW'],
            #         'S4_HIGH': row['HIGH'],
            #         'S4_MATCHED_ROLE': row['AGR_NAME'],
            #         'S4_MATCHED_OBJECT': row['OBJECT'],
            #         'S4_MATCHED_FIELD': row['FIELD']
            #     })
            pass
        else:
            obj['IS_PRESENT'] = 'YES'
        print(obj)

    pass


def main():
    output = []

    with closing(sqlite3.connect('../identifier.sqlite')) as conn:
        conn.row_factory = sqlite3.Row
        conn.set_trace_callback(print)

        with closing(conn.cursor()) as cursor:
            results = cursor.execute("""
            SELECT AGR_NAME, S4_DERIVED_ROLE, OBJECT, FIELD, LOW, HIGH
            FROM ECC_AGR_1251_DUMP
            JOIN PC_MAPPED_ECC_ROLES ON AGR_NAME = ECC_ROLE
            WHERE ( AGR_NAME LIKE 'ZSG%' )
            ORDER BY S4_DERIVED_ROLE, OBJECT, FIELD
            """).fetchall()

            # WHERE ( AGR_NAME LIKE 'ZAL%' OR AGR_NAME LIKE 'ZSG%' OR AGR_NAME LIKE 'Z\\_%' ESCAPE '\\')

            for row in results:
                checkIfValuePresentInS4(conn, row, output)
    # print(json.dumps(output, indent=4))

    df = pd.DataFrame(output, columns=output[0].keys())

    print("data frame created", df.head())

    df.to_excel("AUTH_COMP.xlsx", index=False)

    pass


if __name__ == "__main__":
    main()
