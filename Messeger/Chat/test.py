import os
import json
from django.conf import settings
import requests

folder_name = str('kenjicladia@gmail.com')

file_path = os.path.join('D:\Programming\MELA (MEdia Linked Ai)\Messeger\media\kenjicladia@gmail.com','token.json')
if os.path.exists(file_path):
    # Open and read the JSON file
    with open(file_path, 'r') as file:
        token_data = json.load(file)

    # Retrieve the 'token' key
    access_token = token_data.get("token")
    print(access_token)
    response = requests.post(
        "https://accounts.google.com/o/oauth2/revoke",
        params={"token": access_token},
        headers={"content-type": "application/x-www-form-urlencoded"},
    )
    if response.status_code == 200:
        print("✅ OAuth token revoked successfully.")
    else:
        print("⚠ Failed to revoke token:", response.json())