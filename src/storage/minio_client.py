import os
import io
import uuid
import requests
from minio import Minio
import logging

class MinIOClient:
    def __init__(self, endpoint, access_key, secret_key):
        self.minio_client = Minio(
            endpoint,                  # e.g. "localhost:9000"
            access_key=access_key,     # e.g. "minioadmin"
            secret_key=secret_key,     # e.g. "minioadmin"
            secure=False
        )
        
    def generate_unique_object_name(self, base_filename):
        filename, extension = os.path.splitext(base_filename)
        unique_id = uuid.uuid4().hex
        return f"{filename}_{unique_id}{extension}"
    
    def ensure_bucket_exists(self, bucket_name):
        if not self.minio_client.bucket_exists(bucket_name):
            self.minio_client.make_bucket(bucket_name)
            logging.info(f"Bucket '{bucket_name}' created.")
        else:
            logging.info(f"Bucket '{bucket_name}' already exists.")

    def ingestDocsInMinio(self, bucket_name, articles):
        self.ensure_bucket_exists(bucket_name)
        for article in articles:
            self.ingestDocInMinio(bucket_name, article)
    
    def ingestDocInMinio(self, bucket_name, article):
        try:
            response = requests.get(article.pdf_path)
            if response.status_code == 200:
                pdf_bytes = response.content
                object_name = self.generate_unique_object_name(article.title + ".pdf")
                pdf_file = io.BytesIO(pdf_bytes)
                file_size = len(pdf_bytes)
                self.minio_client.put_object(
                    bucket_name,
                    object_name,
                    pdf_file,
                    file_size,
                    content_type="application/pdf"
                )
                logging.info(f"Ingested into MinIO: {object_name}")
            else:
                logging.info(f"Error downloading PDF for {article.title} (status {response.status_code})")
        except Exception as e:
            logging.info(f"Error ingesting {article.title} into MinIO: {e}")

    def get_docs(self, bucket_name):
        """
        Liste les objets présents dans le bucket et renvoie leurs informations.
        """
        try:
            self.ensure_bucket_exists(bucket_name)
            objects = self.minio_client.list_objects(bucket_name)
            docs_info = []
            for obj in objects:
                url = self.minio_client.presigned_get_object(bucket_name, obj.object_name)
                title = ''.join(obj.object_name.split('_')[:-1])
                docs_info.append({
                    "title": title,
                    "pdfUrl": url
                })
            return docs_info
        except Exception as e:
            logging.error(f"Error retrieving docs from bucket '{bucket_name}': {e}")
            return []

