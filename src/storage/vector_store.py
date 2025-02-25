from raglight import ChromaVS, Settings, Builder
from pypdf import PdfReader
import requests
import io
from langchain_core.documents import Document

from ..config.config import Config

Settings.setup_logging()

class VectorStore:

    def __init__(self):
        persist_directory = Config.PERSIST_DIRECTORY
        model_embeddings = Config.EMBEDDING_MODEL
        collection_name = Config.COLLECTION_NAME

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
                    print(f"No text find for {title} pdf...")
                    return

                doc = Document(page_content=text, metadata={"source": title})
                splits = self.vector_store.split_docs([doc])
                self.vector_store.add_index(splits)
                print(f"PDF indexed : {title}")
            else:
                print(f"Error during {title} downloading : status {response.status_code}")
        except Exception as e:
            print(f"Error during {title} indexation : {e}")

    @staticmethod
    def get_text_from_pdf(response):
        pdf_bytes = response.content
        pdf_file = io.BytesIO(pdf_bytes)
        
        reader = PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text

    def ingest_articles(self, articles):
        for article in articles:
            self.ingestPDFInVectorStore(article.pdf_path, article.title)
