import uuid
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)
import pytest

@pytest.fixture(scope="module", autouse=True)
def run_startup():
    with client:
        yield


def make_user():
    # unique email each run so tests don't clash with existing rows
    return {
        "name": "Test User",
        "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
        "password": "Test@12345",
    }


def register(creds=None):
    creds = creds or make_user()
    r = client.post("/auth/register", json=creds)
    return creds, r


def auth(token):
    return {"Authorization": f"Bearer {token}"}


def test_root_ok():
    assert client.get("/").status_code == 200


def test_register_returns_token_and_user():
    creds, r = register()
    assert r.status_code == 200, r.text
    body = r.json()
    assert "token" in body
    assert body["user"]["email"] == creds["email"]


def test_register_duplicate_email_rejected():
    creds, _ = register()
    r = client.post("/auth/register", json=creds)
    assert r.status_code == 400


def test_login_success():
    creds, _ = register()
    r = client.post("/auth/login", json={"email": creds["email"], "password": creds["password"]})
    assert r.status_code == 200, r.text
    assert "token" in r.json()


def test_login_wrong_password_rejected():
    creds, _ = register()
    r = client.post("/auth/login", json={"email": creds["email"], "password": "wrong-password"})
    assert r.status_code == 401


def test_me_requires_token():
    r = client.get("/auth/me")
    assert r.status_code in (401, 403)


def test_me_with_valid_token():
    creds, r = register()
    token = r.json()["token"]
    r = client.get("/auth/me", headers=auth(token))
    assert r.status_code == 200
    assert r.json()["email"] == creds["email"]


def test_upload_requires_token():
    r = client.post("/upload", files={"file": ("a.pdf", b"%PDF-1.4", "application/pdf")})
    assert r.status_code in (401, 403)


def test_upload_rejects_empty_file():
    _, r = register()
    token = r.json()["token"]
    r = client.post(
        "/upload",
        files={"file": ("empty.pdf", b"", "application/pdf")},
        headers=auth(token),
    )
    assert r.status_code in (400, 422), r.text

def test_upload_rejects_non_pdf():
    _, r = register()
    token = r.json()["token"]
    r = client.post("/upload", files={"file": ("bad.exe", b"not a pdf", "application/octet-stream")}, headers=auth(token))
    assert r.status_code == 415

def test_upload_rejects_fake_pdf():
    _, r = register()
    token = r.json()["token"]
    r = client.post("/upload", files={"file": ("fake.pdf", b"just text", "application/pdf")}, headers=auth(token))
    assert r.status_code == 400

def test_upload_rejects_oversized_file():
    _, r = register()
    token = r.json()["token"]
    big = b"%PDF" + b"0" * (10 * 1024 * 1024 + 1)
    r = client.post("/upload", files={"file": ("big.pdf", big, "application/pdf")}, headers=auth(token))
    assert r.status_code == 413