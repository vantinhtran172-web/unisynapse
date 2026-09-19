"""
ACB Bank API Service for UniSynapse.
Handles VietQR generation, automated authentication, transaction polling, and payment verification.
Ported and enhanced from 'File gốc tai về/src/acb_api.py'.
"""

import os
import time
import json
import uuid
import urllib.parse
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any

import requests
import urllib3
urllib3.disable_warnings()

from ..core.config import (
    ACB_API_URL,
    ACB_CLIENT_ID,
    ACB_USERNAME,
    ACB_PASSWORD,
    ACB_ACCOUNT_NUMBER,
    ACB_ACCOUNT_NAME,
    ACB_BANK_NAME,
    ACB_DEPOSITS_ENABLED,
    POINTS_PER_10K_VND,
)

logger = logging.getLogger("acb_service")


class ACBService:
    api_url: str = ACB_API_URL
    client_id: str = ACB_CLIENT_ID
    username: str = ACB_USERNAME
    password: str = ACB_PASSWORD
    account_number: str = ACB_ACCOUNT_NUMBER
    account_name: str = ACB_ACCOUNT_NAME
    bank_name: str = ACB_BANK_NAME

    _token_path: Path = Path(__file__).resolve().parent.parent / "data" / "acb_token.txt"
    _cached_token: Optional[str] = None
    _token_expires_at: float = 0.0

    @classmethod
    def generate_vietqr(cls, amount_vnd: int, order_code: str) -> str:
        """
        Generate standard VietQR image URL for ACB account.
        Compatible with all Vietnamese banking apps (Vietcombank, MB, Techcombank, ACB, MoMo, etc.)
        """
        encoded_name = urllib.parse.quote(cls.account_name)
        encoded_code = urllib.parse.quote(order_code.strip())
        return (
            f"https://img.vietqr.io/image/{cls.bank_name}-{cls.account_number}-compact2.png"
            f"?amount={amount_vnd}&addInfo={encoded_code}&accountName={encoded_name}"
        )

    @classmethod
    def calculate_points(cls, amount_vnd: int) -> int:
        """
        Calculate UniPoints for given VND amount with tiered bonus:
        - 10,000 VND  -> 1,000 UP (Base rate: 1 VND = 0.1 UP)
        - 20,000 VND  -> 2,200 UP (+10% Bonus)
        - 50,000 VND  -> 6,000 UP (+20% Bonus)
        - 100,000 VND -> 13,000 UP (+30% Bonus)
        """
        base_rate = POINTS_PER_10K_VND / 10000.0  # default 0.1 UP/VND
        raw_points = int(amount_vnd * base_rate)
        if amount_vnd >= 100000:
            return int(raw_points * 1.30)
        elif amount_vnd >= 50000:
            return int(raw_points * 1.20)
        elif amount_vnd >= 20000:
            return int(raw_points * 1.10)
        return raw_points

    @classmethod
    def login(cls) -> Optional[str]:
        """Login to ACB API and acquire Bearer access token."""
        headers = {
            "Content-Type": "application/json; charset=utf-8",
            "Host": "apiapp.acb.com.vn",
            "User-Agent": "ACB-MBA/5 CFNetwork/1325.0.1 Darwin/21.1.0",
        }
        data = {
            "clientId": cls.client_id,
            "username": cls.username,
            "password": cls.password,
        }
        try:
            res = requests.post(
                f"{cls.api_url}/mb/v2/auth/tokens",
                headers=headers,
                json=data,
                verify=False,
                timeout=12,
            )
            if res.status_code >= 400:
                logger.error(f"ACB Login HTTP {res.status_code}: {res.text[:200]}")
                return None

            js = res.json()
            refresh_token = js.get("refreshToken")
            access_token = js.get("accessToken")

            # Exchange refreshToken for active legacy session accessToken if available
            if refresh_token:
                try:
                    ref_res = requests.post(
                        f"{cls.api_url}/mb/v2/auth/refresh",
                        headers={
                            "authorization": f"Bearer {refresh_token}",
                            "User-Agent": "ACB-MBA/5 CFNetwork/1325.0.1 Darwin/21.1.0",
                        },
                        verify=False,
                        timeout=10,
                    )
                    if ref_res.status_code < 400:
                        ref_js = ref_res.json()
                        access_token = ref_js.get("accessToken", access_token)
                except Exception as ref_err:
                    logger.warning(f"ACB refresh token notice: {ref_err}")

            if access_token:
                cls._cached_token = access_token
                cls._token_expires_at = time.time() + 280  # 5 min validity window
                try:
                    cls._token_path.parent.mkdir(parents=True, exist_ok=True)
                    cls._token_path.write_text(access_token, encoding="utf-8")
                except Exception as io_err:
                    logger.debug(f"Could not write acb_token.txt: {io_err}")
                return access_token

            return None
        except Exception as exc:
            logger.error(f"ACB Login exception: {exc}")
            return None

    @classmethod
    def get_token(cls) -> Optional[str]:
        """Get cached token if still fresh, otherwise read from disk or login anew."""
        if cls._cached_token and time.time() < cls._token_expires_at:
            return cls._cached_token

        if cls._token_path.exists():
            try:
                disk_token = cls._token_path.read_text(encoding="utf-8").strip()
                if disk_token:
                    cls._cached_token = disk_token
                    cls._token_expires_at = time.time() + 180
                    return disk_token
            except Exception:
                pass

        return cls.login()

    @classmethod
    def get_account_payment_info(cls) -> Optional[Dict[str, Any]]:
        """Query account status and available balance."""
        token = cls.get_token()
        if not token:
            token = cls.login()
        if not token:
            return None

        url = f"{cls.api_url}/mb/legacy/ss/cs/bankservice/transfers/list/account-payment"
        headers = {
            "authorization": f"Bearer {token}",
            "User-Agent": "ACB-MBA/5 CFNetwork/1325.0.1 Darwin/21.1.0",
        }
        try:
            r = requests.get(url, headers=headers, verify=False, timeout=12)
            if r.status_code < 400:
                return r.json()
            elif r.status_code in (401, 403):
                # Retry once after fresh login
                fresh_token = cls.login()
                if fresh_token:
                    r2 = requests.get(url, headers={"authorization": f"Bearer {fresh_token}"}, verify=False, timeout=12)
                    if r2.status_code < 400:
                        return r2.json()
        except Exception as exc:
            logger.warning(f"Error fetching ACB account payment info: {exc}")
        return None

    @classmethod
    def get_transaction_history(cls, days: int = 2) -> Optional[List[Dict[str, Any]]]:
        """Retrieve recent incoming/outgoing transactions from ACB."""
        token = cls.get_token()
        if not token:
            token = cls.login()
        if not token:
            return None

        now_ms = int(time.time() * 1000)
        from_ms = now_ms - (days * 86400 * 1000)

        url = (
            f"{cls.api_url}/mb/legacy/ss/cs/person/transaction-history/list"
            f"?account={cls.account_number}&transactionType=ALL&from={from_ms}&to={now_ms}&min=&max="
        )
        headers = {
            "Host": "apiapp.acb.com.vn",
            "x-conversation-id": str(uuid.uuid4()),
            "Authorization": f"Bearer {token}",
            "Cache-Control": "no-cache",
            "Accept-Language": "vi",
            "x-request-id": str(uuid.uuid4()),
            "apikey": "null",
            "User-Agent": "ACB-MBA/5 CFNetwork/1333.0.4 Darwin/21.5.0",
            "x-app-version": "3.25.0",
            "Accept": "application/json, text/plain, */*",
        }
        try:
            resp = requests.get(url, headers=headers, verify=False, timeout=12)
            if resp.status_code == 200:
                data = resp.json()
                return data.get("data", [])
            elif resp.status_code in (401, 403):
                logger.info(f"ACB Transaction History returned {resp.status_code}: {resp.text[:120]}")
                return None
        except Exception as err:
            logger.warning(f"Error fetching ACB transactions: {err}")
        return None

    @classmethod
    def get_live_balance(cls) -> Optional[float]:
        """Fetch current available balance for the configured ACB account."""
        info = cls.get_account_payment_info()
        if not info:
            return None
        data = info.get("data", [])
        for acc in data:
            if str(acc.get("accountNumber", "")).strip() == str(cls.account_number).strip():
                return float(acc.get("balance", 0.0))
        if data and isinstance(data, list):
            return float(data[0].get("balance", 0.0))
        return None

    @classmethod
    def verify_transaction(
        cls,
        order_code: str,
        amount_vnd: int,
        initial_balance: Optional[float] = None,
        already_used_refs: Optional[Any] = None,
    ) -> Dict[str, Any]:
        """
        Check if an incoming transaction strictly matches order_code memo and amount_vnd.
        Enforces strict transfer description (memo) verification to ensure each payment
        is credited to the exact corresponding order invoice, preventing unintended settlements
        when multiple orders share the same amount.
        """
        import re
        code_upper = order_code.strip().upper()
        code_alnum = re.sub(r"[^A-Z0-9]", "", code_upper)
        used_set = set(already_used_refs or [])

        # Check transaction statement from bank
        transactions = cls.get_transaction_history(days=2)
        if transactions is not None:
            for tx in transactions:
                if tx.get("type") != "IN":
                    continue
                amt = float(tx.get("amount") or 0)
                if amt < float(amount_vnd):
                    continue

                raw_desc = str(tx.get("description") or "")
                desc_upper = raw_desc.upper()
                desc_alnum = re.sub(r"[^A-Z0-9]", "", desc_upper)

                # Strict check: transfer description MUST contain the specific order_code
                if code_upper not in desc_upper and (not code_alnum or code_alnum not in desc_alnum):
                    continue

                # Unique bank transaction reference to prevent replay/duplicate crediting
                tx_ref = str(
                    tx.get("transactionNumber")
                    or tx.get("id")
                    or tx.get("reference")
                    or tx.get("refNo")
                    or ""
                ).strip()
                if not tx_ref and tx.get("transactionDate"):
                    tx_ref = f"{tx.get('transactionDate')}_{int(amt)}_{code_alnum}"

                if tx_ref and tx_ref in used_set:
                    logger.warning(
                        "Bank transaction %s already credited to another order; skipping for %s.",
                        tx_ref, code_upper
                    )
                    continue

                return {
                    "matched": True,
                    "transaction": tx,
                    "tx_ref": tx_ref or code_upper,
                    "method": "statement_memo_match",
                    "api_available": True,
                    "message": f"Tìm thấy giao dịch nạp tiền hợp lệ khớp mã '{code_upper}' (+{amt:,.0f} VNĐ).",
                }

        return {
            "matched": False,
            "transaction": None,
            "tx_ref": None,
            "api_available": True,
            "message": f"Chưa phát hiện giao dịch có nội dung chuyển khoản chứa mã '{code_upper}' với số tiền tối thiểu {amount_vnd:,.0f} đ.",
        }

