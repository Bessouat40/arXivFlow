from datetime import datetime, timedelta
from prefect import flow, task
from src.wrapper.arxiv_wrapper import ArXivWrapper
from src.storage.minio_client import MinIOClient

@task
def fetch_articles(topic: str, days_ago: int, k: int) -> list:
    target_date = datetime.now() - timedelta(days=days_ago)
    wrapper = ArXivWrapper(date=target_date, topic=topic)
    wrapper.get_articles(k=k)
    print(f"Fetched {len(wrapper.articles)} articles for topic '{topic}' on {target_date.strftime('%Y-%m-%d')}")
    return wrapper.articles

@task
def ingest_articles(bucket_name: str, articles: list) -> str:
    minio_client = MinIOClient(
        endpoint='localhost:9000',
        access_key='minioadmin',
        secret_key='minioadmin'
    )
    minio_client.ingestDocsInMinio(bucket_name, articles)
    return f"Ingested {len(articles)} articles into bucket '{bucket_name}'"

@flow(name="ArXiv to MinIO Pipeline")
def arxiv_to_minio_pipeline(
    topic = "llm",
    days_ago = 1,
    k = 10,
    bucket_name = "llm-pdf"
):
    articles = fetch_articles(topic, days_ago, k)
    result_message = ingest_articles(bucket_name, articles)
    print(result_message)