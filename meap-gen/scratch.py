import requests
import requests.auth

CLIENT_ID = "sb-zbtp_po_process!t28725"
CLIENT_SECRET = "oucOyqpbTOJvSv6UuXzGduuiBV8="
TOKEN_URL = "https://meap-uat-5p41q7ce.authentication.ap10.hana.ondemand.com/oauth/token"
BASE_URL = "https://zbtp-po-process-srv-uat.cfapps.ap10.hana.ondemand.com/service/zbtp_po_process"


def get_token():
    client_auth = requests.auth.HTTPBasicAuth(CLIENT_ID, CLIENT_SECRET)
    post_data = {"grant_type": "client_credentials"}
    response = requests.post(TOKEN_URL,
                             auth=client_auth,
                             data=post_data)
    token_json = response.json()
    return token_json["access_token"]


def main():
    token = get_token()
    print(f"Token: {token}")
    PONumber = "5180152187"
    PORequestNumber = "P240000077"
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'  # Optional, based on the API requirements
    }
    response = requests.get(BASE_URL + f"/approvedRelasePO()?PONumber={PONumber}&PORequestNumber={PORequestNumber}",
                            headers=headers)
    print(response.json())
    pass


if __name__ == "__main__":
    main()
