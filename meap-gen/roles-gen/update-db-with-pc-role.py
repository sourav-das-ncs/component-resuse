import sqlite3
import re


def get_pc_mapping(conn):
    c = conn.cursor()
    pc_map = {}
    c.execute('SELECT * FROM profit_center_mapping')
    result = c.fetchall()
    for row in result:
        oldPc = row['OLD_PC']
        newPc = row['NEW_PC']
        pc_map[oldPc] = newPc
    c.close()
    return pc_map


def s4_derived_role(ECC_ROLE_NAME, pc_map):
    role = ECC_ROLE_NAME
    split = re.split("(.*)_([0-9]{3})(_?.*)", role)
    split = list(filter(lambda x: len(x) > 0, split))
    if len(split) == 3:
        OLD_PC = split[1]
        if OLD_PC in pc_map:
            newPC = pc_map[OLD_PC]
            return split[0] + '_' + newPC + split[2]
    if len(split) == 2:
        OLD_PC = split[1]
        if OLD_PC in pc_map:
            newPC = pc_map[OLD_PC]
            return split[0] + '_' + newPC
    if len(split) == 1:
        return split[0]
    return ""


def get_new_profit_center(ECC_ROLE_NAME, pc_map):
    role = ECC_ROLE_NAME
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


def update_s4_derived_roles(conn, ECC_ROLE_NAME, S4_DERIVED_ROLE_NAME):
    # print(ECC_ROLE_NAME, S4_DERIVED_ROLE_NAME)

    c = conn.cursor()

    r = c.execute(f"SELECT * FROM PC_MAPPED_ECC_ROLES WHERE ECC_ROLE = '{ECC_ROLE_NAME}' ").fetchall()

    if len(r) <= 0:
        print("INSERTING", ECC_ROLE_NAME)
        c.execute(f"INSERT INTO PC_MAPPED_ECC_ROLES VALUES ('{ECC_ROLE_NAME}', '', '{S4_DERIVED_ROLE_NAME}')")
        if c.rowcount <= 0:
            raise RuntimeError("Failed " + ECC_ROLE_NAME)
        pass
    else:
        c.execute(
            f"UPDATE PC_MAPPED_ECC_ROLES SET S4_DERIVED_ROLE = '{S4_DERIVED_ROLE_NAME}' WHERE ECC_ROLE = '{ECC_ROLE_NAME}'")
        if c.rowcount <= 0:
            raise RuntimeError("Failed " + ECC_ROLE_NAME)
        pass
    c.execute('COMMIT')
    c.close()
    pass


def main():
    conn = sqlite3.connect('../identifier.sqlite')
    conn.row_factory = sqlite3.Row

    pc_map = get_pc_mapping(conn)

    c = conn.cursor()
    result = c.execute("""SELECT DISTINCT AGR_NAME
                FROM ECC_AGR_1251_DUMP
                WHERE (AGR_NAME LIKE 'ZSG%' OR AGR_NAME LIKE 'Z\\_%' ESCAPE '\\')
    """).fetchall()

    c.close()
    count = 0
    for row in result:
        ECC_ROLE_NAME = row['AGR_NAME']
        S4_DERIVED_ROLE_NAME = s4_derived_role(ECC_ROLE_NAME, pc_map)
        if S4_DERIVED_ROLE_NAME and len(S4_DERIVED_ROLE_NAME) > 0:
            update_s4_derived_roles(conn, ECC_ROLE_NAME, S4_DERIVED_ROLE_NAME)
            count += 1
        else:
            print(ECC_ROLE_NAME)
    print(count)
    conn.close()
    # print(result[0]['AGR_NAME'])


if __name__ == "__main__":
    main()
