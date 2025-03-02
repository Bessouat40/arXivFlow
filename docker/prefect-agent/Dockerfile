FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt /app/
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

COPY backend/src/ /app/src
COPY backend/main.py /app

CMD ["python", "-m",  "main"]
