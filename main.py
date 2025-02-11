from src import arxiv_to_minio_pipeline

if __name__ == "__main__":
    arxiv_to_minio_pipeline.serve(
        name="arxiv-extraction",
        cron="0 0 * * *",  # Run daily at midnight
    )