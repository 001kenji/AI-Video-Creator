import os
import json
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# Default paths (customize as needed)
DEFAULT_CLIENT_SECRETS_FILE = "client_secret.json"  # Bundled with your app
DEFAULT_TOKEN_FILE = "token.json"                  # Auto-created after auth
SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]

def get_authenticated_service():
    """Authenticate user and persist credentials automatically"""
    
    credentials = None

    # 1. Try loading existing token
    if os.path.exists(DEFAULT_TOKEN_FILE):
        try:
            credentials = Credentials.from_authorized_user_file(
                DEFAULT_TOKEN_FILE, SCOPES
            )
        except Exception as e:
            print(f"⚠ Error loading credentials: {e}")
            os.remove(DEFAULT_TOKEN_FILE)  # Remove invalid token

    # 2. If no valid credentials, start OAuth flow
    if not credentials or not credentials.valid:
        if credentials and credentials.expired and credentials.refresh_token:
            try:  # Attempt token refresh
                credentials.refresh(Request())
            except Exception as e:
                print(f"⚠ Token refresh failed: {e}")
                credentials = None
        else:
            # First-time authentication flow
            flow = InstalledAppFlow.from_client_secrets_file(
                DEFAULT_CLIENT_SECRETS_FILE,
                SCOPES,
                redirect_uri="urn:ietf:wg:oauth:2.0:oob"  # For copy-paste flow
            )

            # Generate auth URL for user
            auth_url, _ = flow.authorization_url(
                access_type="offline",
                prompt="consent"
            )

            print("🔑 Authorize this application by visiting this URL:")
            print(auth_url)

            # Get authorization code from user
            code = input("➡ Enter the authorization code: ").strip()
            credentials = flow.fetch_token(code=code)

        # Save credentials for future runs
        with open(DEFAULT_TOKEN_FILE, "w") as token_file:
            token_file.write(credentials.to_json())

    # 3. Build and return YouTube service
    return build("youtube", "v3", credentials=credentials)

# Usage
youtube = get_authenticated_service()
# Use youtube object for API operations