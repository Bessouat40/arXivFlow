from prefect import flow, task
from src.storage import VectorStore

@task
def ingest_articles_in_vector_store(articles: list, logger) -> str:
    vectorStore = VectorStore()
    vectorStore.ingest_articles(articles, logger)
    return f"Ingested {len(articles)} articles into vector store"
