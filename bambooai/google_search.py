import re
import json
import numpy as np
import requests
import os
from litellm import completion

class SmartSearchOrchestrator:

    def __init__(self, prompt_manager=None, log_and_call_manager=None,output_manager=None,chain_id=None, messages=None):
        self.prompt_manager = prompt_manager
        self.log_and_call_manager = log_and_call_manager
        self.output_manager = output_manager
        self.chain_id = chain_id
        self.messages = messages

    def perform_query(self, prompt_manager, log_and_call_manager, output_manager, chain_id, messages):
        links = None

        try:
            # Only initialize when needed
            if not hasattr(self, 'web_search'):
                self.web_search = WebSearch()
            result, links = self.web_search(prompt_manager, log_and_call_manager, output_manager, chain_id, messages)
        except Exception as e:
            result = f"Error with Web search: {str(e)}"
            output_manager.display_error(result, chain_id=chain_id)

        return result, links
    
    def __call__(self, prompt_manager, log_and_call_manager, output_manager, chain_id, messages):
        return self.perform_query(prompt_manager, log_and_call_manager, output_manager, chain_id, messages)

### SEARCH ACTIONS ###
class WebSearch:
    def __init__(self):

        from bambooai import models

        self.models = models
        self.agent = 'Web Search Executor'
        
    def _extract_search_query(self,messages: str) -> str:
        query = messages[-1]['content']
        search_query = re.sub('\'|"', '',  query).strip()
        search_query = f"Search Internet for: {search_query}"
        return search_query
    
    def _call_search(self,search_query: str) -> str:

        model_id = self.models.get_model_name(self.agent)[0]
        provider = self.models.get_model_name(self.agent)[1]

        response = completion(
            model=f"{provider}/{model_id}",
            messages=[
                {
                    "role": "user",
                    "content": search_query,
                }
            ],
            web_search_options={
                "search_context_size": "medium"  # Options: "low", "medium", "high"
            },
        )
        return response
    
    def _parse_response(self,response: str, output_manager, chain_id) -> str:
        top_links = []
        answer = ""
        
        answer = response.get('choices', [{}])[0].get('message', {}).get('content', '')
        links = response.get('choices', [{}])[0].get('message', {}).get('annotations', [])

        for link in links:
            if link.get('type') == 'url_citation':
                url_citation = link.get("url_citation", {})
                top_links.append({
                    'title': url_citation.get("title"),
                    'url': url_citation.get("url")
                })
            else:
                continue

        return answer, top_links     
    
    def __call__(self, prompt_manager, log_and_call_manager, output_manager, chain_id, messages):
        search_query = self._extract_search_query(messages)
        output_manager.display_tool_info('web_search', search_query, chain_id)
        response = self._call_search(search_query)
        answer, top_links = self._parse_response(response, output_manager, chain_id)
        return answer, top_links
    
### END SEARCH ACTIONS ###
