from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from src.storage.minio_client import MinIOClient
from src.storage.vector_store import VectorStore
from src.config.config import Config
import os

from raglight.config.settings import Settings
from raglight import Builder

minio_client = MinIOClient(Config.MINIO_ENDPOINT, Config.MINIO_ROOT_USER, Config.MINIO_ROOT_PASSWORD)
vector_store: VectorStore = VectorStore()

Settings.setup_logging()

persist_directory = "/Users/labess40/dev/arXivFlow/defaultDb"

rag = Builder() \
    .with_embeddings(Settings.HUGGINGFACE, model_name=Settings.DEFAULT_EMBEDDINGS_MODEL) \
    .with_vector_store(Settings.CHROMA, persist_directory=persist_directory, collection_name=Config.COLLECTION_NAME) \
    .with_llm(Settings.MISTRAL, model_name="mistral-large-2411") \
    .build_rag(k = 5)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryModel(BaseModel):
    user_query: str

class ChatInput(BaseModel):
    user_input: str

@app.get('/getPapers')
async def get_papers():
    return minio_client.get_docs(Config.BUCKET_NAME)

@app.get('/findSimilarity')
async def get_similarity(user_input:str):
    docs = vector_store.similarity_search(user_input)
    sources = list(set(doc.metadata['source'] for doc in docs))
    return {'sources': sources}

@app.post('/chat')
async def get_similarity(chat_input: ChatInput):
    response = rag.question_graph(chat_input.user_input)
    return {'response': response}
