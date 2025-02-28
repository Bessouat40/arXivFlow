from raglight import ChromaVS, Settings, Builder
import pdfplumber
import requests
import io
from langchain_core.documents import Document
from concurrent.futures import ThreadPoolExecutor, as_completed
import logging

from src.config import Config

Settings.setup_logging()

class VectorStore:

    def __init__(self):
        persist_directory = Config.PERSIST_DIRECTORY
        model_embeddings = Config.EMBEDDING_MODEL
        collection_name = Config.COLLECTION_NAME

        print(persist_directory)
        print(collection_name)
        print(model_embeddings)

        self.vector_store: ChromaVS = Builder() \
                .with_embeddings(Settings.HUGGINGFACE, model_name=model_embeddings) \
                .with_vector_store(Settings.CHROMA, persist_directory=persist_directory, collection_name=collection_name) \
                .build_vector_store()
            
    def ingestPDFInVectorStore(self, pdf_url: str, title: str):
        try:
            response = requests.get(pdf_url)
            if response.status_code == 200:
                text = self.get_text_from_pdf(response)
                
                if not text:
                    logging.info(f"No text find for {title} pdf...")
                    return

                doc = Document(page_content=text, metadata={"source": title})
                splits = self.vector_store.split_docs([doc])
                self.vector_store.add_index(splits)
                logging.info(f"PDF indexed : {title}")
            else:
                logging.info(f"Error during {title} downloading : status {response.status_code}")
        except Exception as e:
            logging.info(f"Error during {title} indexation : {e}")

    @staticmethod
    def get_text_from_pdf(response):
        pdf_bytes = response.content
        pdf_file = io.BytesIO(pdf_bytes)
        with pdfplumber.open(pdf_file) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() + "\n"
        return text

    def ingest_articles_multiple_threads(self, articles, logger=None):
        docs = []
        total = len(articles)
        processed = 0

        with ThreadPoolExecutor(max_workers=3) as executor:
            future_to_article = {
                executor.submit(self.ingestPDFInVectorStore, article.pdf_path, article.title): article
                for article in articles
            }
            for future in as_completed(future_to_article):
                processed += 1
                if logger : logger.info(f"Processed {processed}/{total} articles")
                doc = future.result()
                if doc:
                    docs.append(doc)

        if docs:
            splits = self.vector_store.split_docs(docs)
            self.vector_store.add_index(splits)
            if logger : logger.info(f"Indexed {len(docs)} documents in batch")
        else:
            if logger : logger.info("No documents were processed successfully")

    def ingest_articles(self, articles, logger=None):
        for idx, article in enumerate(articles) :
            if logger : logger.info(f"Processed {idx + 1}/{len(articles)} articles")
            self.ingestPDFInVectorStore(article.pdf_path, article.title)

    def similarity_search(self, user_input:str) :
        return self.vector_store.similarity_search(user_input, k=30)
