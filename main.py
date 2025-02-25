from src import arxiv_pipeline

if __name__ == "__main__":
    arxiv_pipeline.serve(
        name="arxiv-extraction",
        cron="0 0 * * *",  # Run daily at midnight
    )