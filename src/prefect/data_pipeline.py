from prefect import task, get_run_logger
from src.storage.minio_client import MinIOClient
from src.config import Config
@task
def ingest_articles_in_minio(bucket_name: str, articles: list) -> str:
    logger = get_run_logger()
    minio_client = MinIOClient(
        endpoint=Config.MINIO_ENDPOINT,
        access_key=Config.MINIO_ROOT_USER,
        secret_key=Config.MINIO_ROOT_PASSWORD
    )
    minio_client.ingestDocsInMinio(bucket_name, articles)
    return f"Ingested {len(articles)} articles into bucket '{bucket_name}'"
