FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt /app/
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

COPY src/ /app/src
COPY main.py /app

CMD ["python", "-m",  "app.main"]
