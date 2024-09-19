import sqlite3
from contextlib import closing
from datetime import datetime


def main():

    with closing(sqlite3.connect('../identifier.sqlite')) as conn:
        conn.row_factory = sqlite3.Row
        conn.set_trace_callback(print)

        with closing(conn.cursor()) as cursor:
            results = cursor.execute("""
            SELECT * FROM ECC_AGR_USERS
            """).fetchall()
            for result in results:
                print(result)
                date = datetime.strptime(result['TO_DAT'], '%d/%m/%Y')
                newDate = date.strftime('%Y-%m-%d')
                print(newDate)
                with closing(conn.cursor()) as curr:
                    curr.execute("""
                    UPDATE ECC_AGR_USERS SET TO_DAT = ? WHERE AGR_NAME = ? AND UNAME = ? AND FROM_DAT = ?
                    """, [newDate, result['AGR_NAME'], result['UNAME'], result['FROM_DAT']])

                    curr.execute("COMMIT")








if __name__ == "__main__":
    main()