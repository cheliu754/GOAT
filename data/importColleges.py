"""
Import college_data.csv into MongoDB.
Requires: pip install pymongo
"""

import csv
import os
from typing import Optional
from urllib.parse import urlparse
from pymongo import MongoClient

# Mongo connection string (override via MONGO_URL env if needed)
MONGO_URL = os.getenv("MONGO_URL")

DATA_FILE = os.path.join(os.path.dirname(__file__), "college_data.csv")


def to_number(value: Optional[str]) -> Optional[float]:
    if value is None:
        return None
    text = str(value).replace(",", "").strip()
    if text == "":
        return None
    try:
        return float(text)
    except ValueError:
        return None


def get_db(client: MongoClient):
    parsed = urlparse(MONGO_URL)
    # db_name = parsed.path.lstrip("/") or "goat"
    db_name = "test"
    return client.get_database(db_name)


def main():
    print(f"Connecting to Mongo: {MONGO_URL}")
    client = MongoClient(MONGO_URL)
    db = get_db(client)
    colleges = db["colleges"]

    if not os.path.isfile(DATA_FILE):
        raise FileNotFoundError(f"CSV file not found: {DATA_FILE}")

    with open(DATA_FILE, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    print(f"Parsed {len(rows)} rows")

    docs = []
    for row in rows:
        name = row.get("") or row.get("name") or row.get("INSTNM")
        if not name:
            continue

        apps = to_number(row.get("Apps"))
        accepts = to_number(row.get("Accept"))
        adm_rate = accepts / apps if apps and accepts and apps > 0 else None

        is_private = str(row.get("Private", "")).strip().lower() == "yes"
        grad_rate_raw = to_number(row.get("Grad.Rate"))
        grad_rate = None
        if grad_rate_raw is not None:
          # Grad.Rate in the CSV looks like percentage (e.g., 60)
          grad_rate = grad_rate_raw / 100 if grad_rate_raw > 1 else grad_rate_raw

        docs.append(
            {
                "INSTNM": name,
                "CONTROL": 2 if is_private else 1,  # 1 public, 2 private
                "ADM_RATE": adm_rate,
                "GRAD_RATE": grad_rate,
            }
        )

    print(f"Prepared {len(docs)} college documents")
    if not docs:
        print("No documents to insert; exiting.")
        client.close()
        return

    if os.getenv("CLEAR_COLLECTION", "false").lower() == "true":
        result = colleges.delete_many({})
        print(f"Cleared existing colleges: {result.deleted_count}")

    insert_result = colleges.insert_many(docs, ordered=False)
    print(f"Inserted {len(insert_result.inserted_ids)} colleges")

    client.close()
    print("Done.")


if __name__ == "__main__":
    main()
