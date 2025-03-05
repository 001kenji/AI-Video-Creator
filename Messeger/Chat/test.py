import requests

# Replace with the actual access token
access_token = "ya29.a0AeXRPp7qHasdgmoXT76UNHxAC5OYq7ZbdvHfR7heeBO2Xk_Qmlyfgk3dhtXJgCeD6G19OfTX3msr6l0eIHpdEqGXuvi0AOMZgQ_ds-TI7rpUeeTY63Q5J6tZnTjLDjH6VXScZtXfhjV1fziVe616sMqiT0H767jZjqTcjtMNnwaCgYKATkSARMSFQHGX2MiCQZPz__RzxxG2jwCExxnnA0177"

response = requests.post(
    "https://accounts.google.com/o/oauth2/revoke",
    params={"token": access_token},
    headers={"content-type": "application/x-www-form-urlencoded"},
)

if response.status_code == 200:
    print("✅ OAuth token revoked successfully.")
else:
    print("⚠ Failed to revoke token:", response.json())
