import json
import time
import urllib.request

BASE = "http://localhost:8000"


def req(path, method="GET", data=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = None if data is None else json.dumps(data).encode("utf-8")
    request = urllib.request.Request(BASE + path, data=body, headers=headers, method=method)
    with urllib.request.urlopen(request, timeout=10) as response:
        return json.loads(response.read().decode("utf-8"))


out = {}
try:
    admin = req("/auth/login", "POST", {"username": "admin", "password": "Admin@123"})
    admin_token = admin.get("token")

    approved = None
    approved_err = ""
    try:
        approved = req("/api/approved-products", token=admin_token)
    except Exception as e:
        approved_err = str(e)

    username = f"diag_{int(time.time())}"
    signup = req("/auth/signup", "POST", {
        "username": username,
        "email": f"{username}@example.com",
        "password": "User@123",
        "full_name": "Diag User",
    })

    user_products = req("/user/products", token=signup.get("token"))

    out = {
        "approved_endpoint_exists": approved is not None,
        "approved_count": approved.get("count") if approved else -1,
        "approved_products": approved.get("products") if approved else [],
        "approved_error": approved_err,
        "user_products_count": user_products.get("count"),
        "user_products": user_products.get("products", []),
    }
except Exception as e:
    out = {"fatal_error": str(e)}

print(json.dumps(out))
