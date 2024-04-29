import pandas as pd


def get_parent_mapping():
    parent_mapping = {}
    pa_df = pd.read_excel("parent-derived-roles.XLSX", sheet_name="Sheet1")
    pa_df.fillna("", inplace=True)
    for _, row in pa_df.iterrows():
        parent_mapping[row.AGR_NAME] = row.PARENT_AGR
    return parent_mapping


def create_role_metadata(rolename, auth_data):
    role = {
        "name": rolename,
        "objects": {}
    }
    role_df = auth_data[auth_data['AGR_NAME'] == rolename]
    for index, row in role_df.iterrows():
        obj = row.OBJECT
        if obj not in role['objects']:
            role['objects'][obj] = {}
        field = row.FIELD
        if field not in role['objects'][obj]:
            role['objects'][obj][field] = []
        role['objects'][obj][field].append({
            "from": row.LOW,
            "to": row.HIGH,
            "auth": row.AUTH,
        })
        # print(row.Object)
    return role
    pass


def found_value(constantValue, field):
    for value in field:
        if value['from'] == constantValue['from'] and value['to'] == constantValue['to']:
            return True
    return False


def compare_roles(role1, role2, output):
    role1_name = role1['name']
    role2_name = role2['name']
    object_count = 0
    field_count = 0
    value_count = 0
    for obj in role1['objects']:
        if obj not in role2['objects']:
            remark = f"object {obj} not in {role2['name']}"
            print(remark)
            output.append({"ROLE1": role1_name, "ROLE2": role2_name, "REMARKS": remark})
            object_count += 1
            continue
        for field in role1['objects'][obj]:
            if field not in role2['objects'][obj]:
                remark = f"field {field} not in {role2['name']}"
                print(remark)
                output.append({"ROLE1": role1_name, "ROLE2": role2_name, "REMARKS": remark})
                field_count += 1
                continue
            for value in role1['objects'][obj][field]:
                if not found_value(value, role2['objects'][obj][field]):
                    value_count += 1
                    remark = f"{field} field value {value} not found in {role2['name']}"
                    print(remark)
                    output.append({"ROLE1": role1_name, "ROLE2": role2_name, "REMARKS": remark})
                    continue

    for obj in role2['objects']:
        if obj not in role1['objects']:
            object_count += 1
            remark = f"object {obj} not in {role1['name']}"
            print(remark)
            output.append({"ROLE1": role1_name, "ROLE2": role2_name, "REMARKS": remark})
            continue
        for field in role2['objects'][obj]:
            if field not in role1['objects'][obj]:
                field_count += 1
                remark = f"field {field} not in {role1['name']}"
                print(remark)
                output.append({"ROLE1": role1_name, "ROLE2": role2_name, "REMARKS": remark})
                continue
            for value in role2['objects'][obj][field]:
                if not found_value(value, role1['objects'][obj][field]):
                    value_count += 1
                    remark = f"{field} field value {value} not found in {role1['name']}"
                    print(remark)
                    output.append({"ROLE1": role1_name, "ROLE2": role2_name, "REMARKS": remark})
                    continue

    output.append({"ROLE1": role1_name, "ROLE2": role2_name,
                   "REMARKS": f"Object Count: {object_count}, Field Count: {field_count}, Value Count: {value_count}"})
    return object_count, field_count, value_count
    pass


def main():
    global MASTER_ROLE, DERIVED_ROLE

    pmap = get_parent_mapping()

    auth_data = pd.read_excel("all-role-auth-obj.XLSX", sheet_name="Sheet1")
    auth_data.fillna("", inplace=True)

    # master_role = create_role_metadata("ZSG_SD_BL.PRO_XXX", auth_data)
    # derived_role = create_role_metadata("ZSG_SD_BL.PRO_872", auth_data)
    # compare_roles(master_role, derived_role, debug=True)

    unique_roles = auth_data['AGR_NAME'].unique()
    cache = {}
    output = []
    for role1 in unique_roles:
        if role1 not in pmap:
            print(f"{role1} no parent mapping")
            continue
        role2 = pmap[role1]
        if len(role2) <= 0:
            continue
        if role1 == role2:
            continue

        if role1 not in cache:
            cache[role1] = create_role_metadata(role1, auth_data)

        master_role = cache[role1]
        # print(master_role)

        if role2 not in cache:
            cache[role2] = create_role_metadata(role2, auth_data)

        derived_role = cache[role2]
        # print(derived_role)

        object_count, field_count, value_count = compare_roles(master_role, derived_role, output)
        # if object_count > 0 :
        #     print(role1, role2)

        output.append({"ROLE1": role1, "ROLE2": role2, "REMARKS": ""})

    out_df = pd.DataFrame(output, columns=["ROLE1", "ROLE2", "REMARKS"])
    out_df.to_excel("difference.xlsx", index=False)

    pass


if __name__ == '__main__':
    main()
