import json

import pandas as pd


def main():

    output = []

    with open('data-from-btp.json', 'r') as f:
        data = json.load(f)
        for role in data:
            role_name = role['name']
            for user in role['users']:
                user_name = user['username']
                email = user['email']
                output.append({
                    'ROLE': role_name,
                    'USER_NAME': user_name,
                    'EMAIL': email
                })

    pd.DataFrame(output, columns=["ROLE", "USER_NAME", "EMAIl"]).to_excel('user-asignment-btp.xlsx', index=False)
    pass


if __name__ == '__main__':
    main()
