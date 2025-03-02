import os

class Config:
    PERSIST_DIRECTORY = os.environ.get("PERSIST_DIRECTORY", "/Users/labess40/dev/arXivFlow/defaultDb")
    MINIO_EXTERNAL_ENDPOINT = os.environ.get("MINIO_EXTERNAL_ENDPOINT")
    EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    COLLECTION_NAME = os.environ.get("COLLECTION_NAME")
    MINIO_ENDPOINT = str(os.environ.get("MINIO_HOST")) + ":" + str(os.environ.get("MINIO_PORT"))
    MINIO_ROOT_USER = os.environ.get("MINIO_ROOT_USER")
    MINIO_ROOT_PASSWORD = os.environ.get("MINIO_ROOT_PASSWORD")
    BUCKET_NAME = "llm-pdf"
    ARXIV_TOPIC = os.environ.get("ARXIV_TOPIC")
