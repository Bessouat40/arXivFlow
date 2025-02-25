from datetime import datetime, timedelta
from prefect import flow, task

from src import ArXivWrapper, Config

from .data_pipeline import ingest_articles_in_minio
from .feature_pipeline import ingest_articles_in_vector_store

@task
def fetch_articles(topic: str, days_ago: int, k: int) -> list:
    target_date = datetime.now() - timedelta(days=days_ago)
    wrapper = ArXivWrapper(date=target_date, topic=topic)
    wrapper.get_articles(k=k)
    print(f"Fetched {len(wrapper.articles)} articles for topic '{topic}' on {target_date.strftime('%Y-%m-%d')}")
    return wrapper.articles

@flow(name="ArXiv to Vector Store and MinIO Pipeline")
def arxiv_pipeline(
    topic = Config.ARXIV_TOPIC,
    days_ago = 1,
    k = 10,
    bucket_name = Config.BUCKET_NAME
):
    articles = fetch_articles(topic, days_ago, k)
    result_message_vs = ingest_articles_in_vector_store(articles)
    print(result_message_vs)
    result_message_minio = ingest_articles_in_minio(bucket_name, articles)
    print(result_message_minio)
