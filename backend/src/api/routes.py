from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from src.storage.minio_client import MinIOClient
from src.storage.vector_store import VectorStore
from src.config.config import Config
import os

from raglight import Builder, AgenticRAGConfig, AgenticRAG, Settings

minio_client = MinIOClient(Config.MINIO_ENDPOINT, Config.MINIO_ROOT_USER, Config.MINIO_ROOT_PASSWORD)
vector_store: VectorStore = VectorStore()

Settings.setup_logging()

persist_directory = Config.PERSIST_DIRECTORY

Settings.setup_logging()

vector_store = Builder() \
.with_embeddings(Settings.HUGGINGFACE, model_name=Config.EMBEDDING_MODEL) \
.with_vector_store(Settings.CHROMA, persist_directory=persist_directory, collection_name=Config.COLLECTION_NAME) \
.build_vector_store()

config = AgenticRAGConfig(
            provider = Settings.MISTRAL.lower(),
            model = "codestral-latest",
            vector_store=vector_store,
            k=10,
        )

agenticRag = AgenticRAG(config)

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
    response = agenticRag.generate(chat_input.user_input)
    return {'response': response}
