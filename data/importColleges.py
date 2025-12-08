"""
Clear MongoDB colleges collection and import data/colleges_cleaned.csv.
Requires: pip install pymongo
"""

import csv
import os
from typing import Optional
from urllib.parse import urlparse
from pymongo import MongoClient

# Mongo connection string (override via MONGO_URL env if needed)
MONGO_URL = os.getenv(
    "MONGO_URL"
)

DATA_FILE = os.path.join(os.path.dirname(__file__), "colleges_cleaned.csv")


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
    db_name = parsed.path.lstrip("/") or "test"
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
        name = row.get("INSTNM")
        if not name:
            continue

        docs.append(
            {
                "INSTNM": name,
                "CITY": row.get("CITY") or "",
                "STABBR": row.get("STABBR") or "",
                "ZIP": row.get("ZIP") or "",
                "INSTURL": row.get("INSTURL") or "",
                "CONTROL": to_number(row.get("CONTROL")),
                "ADM_RATE": to_number(row.get("ADM_RATE")),
                "SAT_AVG": to_number(row.get("SAT_AVG")),
            }
        )

    print(f"Prepared {len(docs)} college documents")
    if not docs:
        print("No documents to insert; exiting.")
        client.close()
        return

    deleted = colleges.delete_many({})
    print(f"Cleared existing colleges: {deleted.deleted_count}")

    result = colleges.insert_many(docs, ordered=False)
    print(f"Inserted {len(result.inserted_ids)} colleges")

    client.close()
    print("Done.")


if __name__ == "__main__":
    main()
