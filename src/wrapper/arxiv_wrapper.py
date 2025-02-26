import requests
import re
import os
from datetime import datetime
import logging

from .article import Article

class ArXivWrapper:
    def __init__(self, topic, date):
        self.entry_regex = r'<entry>(.*?)</entry>'
        self.date_format = "%Y-%m-%d"
        self.articles = []
        self.date = date.strftime(self.date_format)
        self.topic = topic
    
    def request_articles(self, topic, start = 0, k = 1): 
        response = requests.get(f'http://export.arxiv.org/api/query?search_query=all:{topic}&start={start}&max_results={k}&sortBy=submittedDate&sortOrder=descending')
        xml_response = response.text
        return xml_response
    
    def get_articles(self, start = 0, k = 50):
        xml_response = self.request_articles(self.topic, start, k)
        matches = re.findall(self.entry_regex, xml_response, re.DOTALL)
        continue_scrapping = self.filter_articles(matches)
        if continue_scrapping:
            self.get_articles(start + k + 1, k)

    def print_articles(self):
        for article in self.articles:
            print(article)
            print('\n')

    def download_article(self, article, directory):
        try :
            response = requests.get(article.pdf_path)
            filename = self.generate_unique_filename(directory, article.title + '.pdf')

            with open(os.path.join(directory, filename), 'wb') as file:
                file.write(response.content)

            logging.info(f"Downloaded: {filename}")

        except Exception as e:
            logging.info(f"Error downloading {article.title} : {e}")

    def download_articles(self, directory):
        for article in self.articles:
            self.download_article(article, directory)

    def filter_articles(self, matches):
        for match in matches :
            article = Article(match)
            
            given_date = datetime.strptime(article.published_date[:10], self.date_format).strftime(self.date_format)

            if given_date == self.date:
                self.articles.append(article)
            else:
                return False
        return True

    def generate_unique_filename(self, directory, base_filename):
        filename, extension = os.path.splitext(base_filename)
        index = 1
        unique_filename = base_filename

        while os.path.exists(os.path.join(directory, unique_filename)):
            unique_filename = f"{filename}_{index}{extension}"
            index += 1

        return unique_filename