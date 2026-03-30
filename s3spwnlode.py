import os
import sys

import boto3
from botocore.exceptions import NoCredentialsError

# Load .env from this folder (same folder as this script). .env is gitignored.
def _load_dotenv() -> None:
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if not os.path.isfile(env_path):
        return
    with open(env_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value


_load_dotenv()

# Region must be the API code (e.g. eu-north-1), not the console label.
s3 = boto3.client("s3", region_name="eu-north-1")

bucket = "ecwc-image"

try:
    paginator = s3.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=bucket):
        for obj in page.get("Contents", []):
            key = obj["Key"]
            parts = [p for p in key.split("/") if p]
            if not parts:
                continue
            local_path = os.path.join("downloads", *parts)
            parent = os.path.dirname(local_path)
            if parent:
                os.makedirs(parent, exist_ok=True)
            s3.download_file(bucket, key, local_path)
except NoCredentialsError:
    sys.stderr.write(
        "No AWS credentials found.\n"
        "  Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in the environment, or\n"
        "  create a .env file next to this script with those two variables, or\n"
        "  run: aws configure\n"
    )
    sys.exit(1)
