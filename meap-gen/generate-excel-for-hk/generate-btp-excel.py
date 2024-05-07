import json
import sys

import pandas as pd


def main():
    btp_roles = {}
    output = []
    with open('btp-roles.json', 'r') as f:
        roles = json.load(f)
        for role in roles:
            if len(role['users']) <= 0:
                output.append({
                    'ROLE_NAME': role['name'],
                    'ROLE_DESCRIPTION': role['description'],
                    'USER_EMAIL': 'No User'
                })
                continue
            for user in role['users']:
                output.append({
                    'ROLE_NAME': role['name'],
                    'ROLE_DESCRIPTION': role['description'],
                    'USER_EMAIL': user['email']
                })

    df = pd.DataFrame(output, columns=["USER_EMAIL", "ROLE_NAME", "ROLE_DESCRIPTION"])
    df.to_excel("btp-roles-assignment.xlsx", index=False)
    pass


if __name__ == '__main__':
    main()
