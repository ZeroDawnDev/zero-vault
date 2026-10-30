from pathlib import Path
from datetime import datetime
import base64
import re
import html

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from categorization import categorize_transaction


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).parent

CREDENTIALS_FILE = BASE_DIR / "credentials.json"
TOKEN_FILE = BASE_DIR / "token.json"

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

DEBIT_EMAIL = "yuchodebit@jp-bank.japanpost.jp"


# ============================================================
# GMAIL AUTHENTICATION
# ============================================================

def get_gmail_service():
    """Authenticate with Gmail and return the Gmail API client."""

    creds = None

    # Load previously saved authorization.
    if TOKEN_FILE.exists():
        try:
            creds = Credentials.from_authorized_user_file(
                str(TOKEN_FILE),
                SCOPES,
            )
        except (ValueError, OSError):
            # The saved token is malformed or unreadable.
            creds = None

    # Refresh expired credentials when possible.
    if creds and creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
        except Exception as exc:
            from google.auth.exceptions import RefreshError

            if isinstance(exc, RefreshError):
                print(
                    "Saved Gmail authorization is no longer valid. "
                    "Starting OAuth authorization again."
                )
                creds = None
            else:
                raise

    # Ask the user to authorize Gmail if necessary.
    if not creds or not creds.valid:
        if not CREDENTIALS_FILE.exists():
            raise FileNotFoundError(
                f"Credentials file not found: {CREDENTIALS_FILE}"
            )

        flow = InstalledAppFlow.from_client_secrets_file(
            str(CREDENTIALS_FILE),
            SCOPES,
        )

        creds = flow.run_local_server(
            host="127.0.0.1",
            port=0,
            open_browser=True,
        )

    # Save authorization for subsequent requests.
    TOKEN_FILE.write_text(
        creds.to_json(),
        encoding="utf-8",
    )

    # Create Gmail API client.
    service = build(
        "gmail",
        "v1",
        credentials=creds,
    )

    return service

# ============================================================
# EMAIL BODY EXTRACTION
# ============================================================

def decode_email_body(payload):
    """Extract readable text from a Gmail message payload."""

    text_parts = []
    html_parts = []
    parts_to_check = [payload]

    while parts_to_check:
        part = parts_to_check.pop(0)

        mime_type = part.get("mimeType", "")
        body = part.get("body", {})
        data = body.get("data")

        if data:
            try:
                decoded = base64.urlsafe_b64decode(
                    data + "=" * (-len(data) % 4)
                ).decode(
                    "utf-8",
                    errors="replace",
                )

                if mime_type == "text/plain":
                    text_parts.append(decoded)

                elif mime_type == "text/html":
                    html_parts.append(decoded)

            except (ValueError, TypeError):
                pass

        parts_to_check.extend(part.get("parts", []))

    # Prefer plain text when available.
    if text_parts:
        return "\n".join(text_parts)

    # Fall back to HTML if no plain-text part exists.
    if html_parts:
        combined_html = "\n".join(html_parts)

        # Convert common HTML structure into readable text.
        combined_html = re.sub(
            r"(?i)<br\s*/?>|</p>|</div>|</tr>|</li>",
            "\n",
            combined_html,
        )

        combined_html = re.sub(
            r"<[^>]+>",
            " ",
            combined_html,
        )

        combined_html = html.unescape(combined_html)

        return combined_html

    return ""


# ============================================================
# EMAIL HEADER HELPERS
# ============================================================

def get_header_value(headers, header_name):
    """Get a header value without depending on header capitalization."""

    for header in headers:
        if header.get("name", "").lower() == header_name.lower():
            return header.get("value", "")

    return ""


# ============================================================
# JAPAN POST BANK TRANSACTION PARSER
# ============================================================

def parse_debit_email(message):
    """
    Parse a Japan Post Bank debit notification.

    Returns a transaction dictionary if the email contains the
    expected transaction details. Otherwise, returns None.
    """

    payload = message.get("payload", {})
    headers = payload.get("headers", [])

    sender = get_header_value(headers, "From")
    subject = get_header_value(headers, "Subject")

    # Accept only emails from the expected bank notification address.
    if DEBIT_EMAIL.lower() not in sender.lower():
        return None

    body = decode_email_body(payload)

    if not body:
        return None

    # Normalize line endings and non-breaking spaces.
    body = body.replace("\r\n", "\n")
    body = body.replace("\r", "\n")
    body = body.replace("\xa0", " ")

    # Extract transaction date and time.
    date_match = re.search(
        r"利用日時\s*[:：]?\s*"
        r"(\d{4}[/-]\d{1,2}[/-]\d{1,2}"
        r"\s+\d{1,2}:\d{2}:\d{2})",
        body,
    )

    # Extract merchant.
    merchant_match = re.search(
        r"利用店舗\s*[:：]?\s*([^\n]+)",
        body,
    )

    # Extract amount.
    amount_match = re.search(
        r"利用金額\s*[:：]?\s*([\d,]+)\s*円?",
        body,
    )

    # Extract currency if present.
    currency_match = re.search(
        r"利用通貨\s*[:：]?\s*([A-Z]{3})",
        body,
    )

    # Authorization number may not always be present.
    authorization_match = re.search(
        r"承認番号\s*[:：]?\s*([A-Za-z0-9-]+)",
        body,
    )

    # The required fields must all be present.
    if not all([
        date_match,
        merchant_match,
        amount_match,
    ]):
        return None

    # Parse date and time.
    date_string = date_match.group(1).strip()

    parsed_date = None

    for date_format in (
        "%Y/%m/%d %H:%M:%S",
        "%Y-%m-%d %H:%M:%S",
        "%Y/%m/%d %H:%M:%S",
    ):
        try:
            parsed_date = datetime.strptime(
                date_string,
                date_format,
            )
            break
        except ValueError:
            continue

    if parsed_date is None:
        return None

    merchant = merchant_match.group(1).strip()
    amount = int(
        amount_match.group(1).replace(",", "")
    )
    category = categorize_transaction(merchant, amount)

    currency = (
        currency_match.group(1).strip()
        if currency_match
        else "JPY"
    )

    authorization_number = (
        authorization_match.group(1).strip()
        if authorization_match
        else None
    )

    # Reject incomplete or invalid transaction details.
    if not merchant or amount <= 0:
        return None

    return {
        "merchant": merchant,
        "amount": amount,
        "currency": currency,
        "transaction_date": parsed_date.isoformat(),
        "payment_method": "JP Bank Debit",
        "category": category,
        "authorization_number": authorization_number,
        "status": "pending_confirmation",
        "gmail_message_id": message.get("id"),
        "email_subject": subject,
    }


# ============================================================
# FETCH TRANSACTION EMAILS
# ============================================================

def fetch_debit_transactions(max_results=100):
    """
    Fetch recent Japan Post Bank debit notification emails
    and return successfully parsed transactions.

    The Gmail query searches the last 90 days.
    """

    service = get_gmail_service()

    results = service.users().messages().list(
        userId="me",
        q=f"from:{DEBIT_EMAIL} newer_than:90d",
        maxResults=max_results,
    ).execute()

    messages = results.get("messages", [])
    transactions = []

    # Gmail returns message IDs, so retrieve each full message.
    for item in messages:
        message = service.users().messages().get(
            userId="me",
            id=item["id"],
            format="full",
        ).execute()

        transaction = parse_debit_email(message)

        if transaction:
            transactions.append(transaction)

    return transactions

