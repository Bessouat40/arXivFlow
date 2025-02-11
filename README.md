# arXivFlow

arXivFlow is an end-to-end MLOps pipeline that automatically fetches, processes, and ingests the latest ArXiv research papers into a MinIO object storage system. The pipeline is orchestrated using Prefect to allow scheduling and easy automation.

## Features

- Fetch ArXiv Papers: Automatically query the ArXiv API for research papers based on a topic and publication date.
- PDF Ingestion: Download the PDF files and store them in a MinIO bucket.
- Pipeline Orchestration: Use Prefect flows and tasks to schedule and manage the pipeline.

## Installation

1. Clone the repository

```bash
git clone <your-repo-url>
cd arXivFlow
```

2. Install the required packages

```bash
python3 -m pip install -r requirements.txt
```

## Usage

### Running the Pipeline with Prefect Scheduling

You can run the pipeline as a scheduled flow using Prefect. For example, to run the pipeline daily at midnight, use the Prefect deployment approach or serve the flow directly (for testing purposes).

```bash
python3 -m main
```

## Configuration

### Topic and Date Filtering

The pipeline fetches articles based on a given topic and a target date (e.g., yesterday).

You can modify these parameters in your flow (`in src/prefect/pipeline.py`).

### MinIO Credentials and Bucket

The MinIOClient is configured with default credentials (`minioadmin/minioadmin`) and an endpoint (`localhost:9000`). The bucket name used is "`llm-pdf`". Make sure your MinIO instance is running and accessible.

## Prerequisites

- Python 3.11 (or compatible version)

- MinIO: Make sure you have a running MinIO server. You can start one using Docker:

```bash
docker run -d --name minio_server \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"
```

## TODO

- [ ] **Containerization with Docker:** Create a Dockerfile to containerize the application and manage its dependencies.

- [ ] **Embedding Extraction:** Use a model to extract and store embeddings from the PDFs for later semantic search.

- [ ] **Semantic Search:** Implement a semantic search feature that leverages the stored embeddings to enable more accurate article search.
