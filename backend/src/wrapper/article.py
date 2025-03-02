import re

class Article:
    def __init__(self, string):
        self.feed_regex = r'<feed>(.*?)</feed>'
        self.entry_regex = r'<entry>(.*?)</entry>'
        self.updated_regex = r'<updated>(.*?)</updated>'
        self.published_regex = r'<published>(.*?)</published>'
        self.title_regex = r'<title>(.*?)</title>'
        self.summary_regex = r'<summary>(.*?)</summary>'
        self.authors_regex = r'<author>(.*?)</author>'
        self.name_regex = r'<name>(.*?)</name>'
        self.pdf_regex = r'<link[^>]*title="pdf"[^>]*href="([^"]*)"[^>]*>'

        self.updated_date = self.find_metadata(string, self.updated_regex)
        self.published_date = self.find_metadata(string, self.published_regex)
        self.title = self.find_metadata(string, self.title_regex)
        self.summary = self.find_metadata(string, self.summary_regex)
        self.authors = self.get_authors(string)
        self.pdf_path = self.find_metadata(string, self.pdf_regex)
        pass

    @staticmethod
    def find_metadata(string, regex):
        match = re.search(regex, string, re.DOTALL)
        return match.group(1) if match else None

    def get_authors(self, string):
        matches = re.findall(self.authors_regex, string, re.DOTALL)
        authors = []
        for match in matches:
            name_match = re.search(self.name_regex, match)
            if name_match:
                authors.append(name_match.group(1))
        return authors
    
    def __str__(self):
        return (f'Title: {self.title}\n'
            f'Authors: {", ".join(self.authors)}\n'
            f'Published: {self.published_date}\n'
            f'Updated: {self.updated_date}\n'
            f'Summary: {self.summary}')