from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from src.storage.minio_client import MinIOClient
from src.storage.vector_store import VectorStore
from src.config.config import Config
import uvicorn

minio_client = MinIOClient('localhost:9000', 'minioadmin', 'minioadmin')
vector_store: VectorStore = VectorStore()

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

@app.get('/getPapers')
async def get_papers():
    return minio_client.get_docs(Config.BUCKET_NAME)

@app.get('/findSimilarity')
async def get_similarity(user_input:str):
    docs = vector_store.similarity_search(user_input)
    sources = list(set(doc.metadata['source'] for doc in docs))
    print(docs)
    return {'sources': sources}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
