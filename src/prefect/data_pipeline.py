from prefect import task
from src.storage.minio_client import MinIOClient
from src import Config
@task
def ingest_articles_in_minio(bucket_name: str, articles: list) -> str:
    minio_client = MinIOClient(
        endpoint=Config.MINIO_ENDPOINT,
        access_key=Config.MINIO_ACCESS_KEY,
        secret_key=Config.MINIO_SECRET_KEY
    )
    minio_client.ingestDocsInMinio(bucket_name, articles)
    return f"Ingested {len(articles)} articles into bucket '{bucket_name}'"
