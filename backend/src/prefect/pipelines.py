from datetime import datetime, timedelta
from prefect import flow, task, get_run_logger
from prefect.futures import PrefectFuture

from src.config import Config
from src.wrapper import ArXivWrapper
from .data_pipeline import ingest_articles_in_minio
from .feature_pipeline import ingest_articles_in_vector_store

@task
def fetch_articles(topic: str, days_ago: int, k: int) -> list:
    logger = get_run_logger()
    target_date = datetime.now() - timedelta(days=days_ago)
    wrapper = ArXivWrapper(date=target_date, topic=topic)
    wrapper.get_articles(k=k)
    logger.info(f"Fetched {len(wrapper.articles)} articles for topic '{topic}' on {target_date.strftime('%Y-%m-%d')}")
    return wrapper.articles

@flow(name="ArXiv to Vector Store and MinIO Pipeline")
def arxiv_pipeline(
    topic = Config.ARXIV_TOPIC,
    days_ago = 4,
    k = 10,
    bucket_name = Config.BUCKET_NAME
):
    logger = get_run_logger()
    articles = fetch_articles(topic, days_ago, k)

    if len(articles) > 0:
        vs_future: PrefectFuture = ingest_articles_in_vector_store.submit(articles, logger)
        minio_future: PrefectFuture = ingest_articles_in_minio.submit(bucket_name, articles)

        result_message_vs = vs_future.result()
        logger.info(result_message_vs)
        result_message_minio = minio_future.result()
        logger.info(result_message_minio)
    
    else :
        logger.info("No articles to ingest...")
