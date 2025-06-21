from flask import Flask, request
import google.generativeai as genai
import json
import typing_extensions as typing
import os
import mysql.connector

# This is output format that we want AI return
class Type(typing.TypedDict):
    news_type: str

class Source(typing.TypedDict):
    news_outlet: int

class Author(typing.TypedDict):
    author: int

class Content(typing.TypedDict):
    citations: int
    comparison: int
    fact_checking: int

class Consistency(typing.TypedDict):
    logical_consistency: int

class Tone(typing.TypedDict):
    tone: int

class Political(typing.TypedDict):
    political: int

class Source_details(typing.TypedDict):
    news_outlet_details:str
    author_details:str

class Content_details(typing.TypedDict):
    citations_details: str
    comparison_details: str
    fact_checking_details: str

class Consistency_details(typing.TypedDict):
    contradictory_details: str

class Tone_details(typing.TypedDict):
    tone_details: str

class Political_details(typing.TypedDict):
    political_details: str




app = Flask(__name__)

# Handle the POST reuqest
@app.route('/', methods= ['POST'])
def index():
    # extract the url that our pulgin provide
    # Connect to MySQL database
    # Check if this URL in our database
    # If not, We will try to analyse this URL, If this URL is not undefined,
    # It is not a news article. close theconnection to database
    # and return "undefined"
    # If yes, We will return the data that select by MySQL query
    url = request.data.decode('utf-8')
    con = mysql.connector.connect(user='s4689177', password='123',
            host = 'localhost', database = 'flask_app')
    cur = con.cursor()
    cur.execute("SELECT website FROM news WHERE website = %s", (url,))
    result = cur.fetchone()
    if (result is None):
        if ai(url, cur, con):
            cur.close()
            con.close()
            return "undefined"
    cur.execute("SELECT * FROM news WHERE website = %s", (url,))
    elementList = cur.fetchall()
    cur.close()
    con.close()
    return elementList
    
    # This is the function that we use to analyse article
    # It requires the URL, cur object and con object from database
def ai(url, cur, con):
    # AI configuration and marking criteria
    genai.configure(api_key = 'AIzaSyBFEGW3bfo0ktp_viG-VwDq6ycBqRr0EWE')
    model = genai.GenerativeModel("gemini-1.5-pro")
    
    prompt_word = """
    Please help me analyse this news article to alert readers if the article may contain misinformation:
    Use the following scoring criteria to give a credibility score (out of 100). 
    1. Source Credibility (30 points)
    •   News Outlet, Domain (15 points):
    •   Author (15 points):
    2. Content Accuracy (35 points)
    •   Citations (5 points):
    •   Comparison with Other Media (15 points):
    •   Fact-Checking (15 points):
    3. Logical Consistency (10 points)
    •   Contradictory Details (10 points):
    4. Content Style (25 points)
    •   Sensationalism, Emotional Tone (15 points):
    •   Political or Economic Agenda (10 points):
    o	Full 10 points if there is no clear political or economic agenda.
    o	5-8 points if there is some bias or leaning toward a particular political or economic viewpoint.
    o	0-4 points if the content clearly serves a specific political or economic purpose.
    Final grade Calculation
    The final grade is the sum of all the points from the above categories, with a maximum of 100 points.
    Apart from this, determine the type of news (choose one from 'Hard News', 'Soft News', 'Sports News', 'Business News', 'Science & Technology News', 'Health News'.
    Return news type 'undefined‘ only if website is the home page of a news website or it is not an individual article with a specific news focus.
    Hints:
    Hard News focuses on timely, factual reporting of significant events. It often deals with serious topics like politics, war, crime, economics, and natural disasters.
    Soft News focuses on lighter topics like entertainment, lifestyle, human interest stories, arts, and culture.
"""

    # shart chat with AI
    # send our marking criteria
    chat = model.start_chat()
    
    chat.send_message(prompt_word)
    
    # check the type of news
    # if is "undefined", return "1"
    # else process those data and insert into datbase
    typeMsg = chat.send_message(" what is the news type?" + url, 
        generation_config=genai.GenerationConfig(response_mime_type="application/json", response_schema=list[Type]))
    jsonText = json.loads(typeMsg.text)
    newsType = jsonText[0]['news_type']
    if "undefined" in newsType:
        return 1

    sourceMsg = chat.send_message(" what are the News Outlet, Domain and Author score?", generation_config=genai.GenerationConfig(response_mime_type="application/json", response_schema=list[Source]))
    jsonText = json.loads(sourceMsg.text)
    newsOutlet = jsonText[0]['news_outlet']
    
    authorMsg = chat.send_message(" what is the socre of author?", generation_config=genai.GenerationConfig(response_mime_type="application/json", response_schema=list[Author]))
    jsonText = json.loads(authorMsg.text)
    author = jsonText[0]['author']

    contentMsg = chat.send_message(" what are the Citations, Comparison with Other Media and Fact-Checking score?", generation_config=genai.GenerationConfig(response_mime_type="application/json", response_schema=list[Content]))
    jsonText = json.loads(contentMsg.text)
    citations = jsonText[0]['citations']
    comparison = jsonText[0]['comparison']
    fact = jsonText[0]['fact_checking']

    consistencyMsg = chat.send_message(" what is the Contradictory Details score?", generation_config=genai.GenerationConfig(response_mime_type="application/json", response_schema=list[Consistency]))
    jsonText = json.loads(consistencyMsg.text)
    consistency = jsonText[0]['logical_consistency']

    toneMsg = chat.send_message(" what are the Sensationalism, Emotional Tone score?", generation_config=genai.GenerationConfig(response_mime_type="application/json", response_schema=list[Tone]))
    jsonText = json.loads(toneMsg.text)
    tone = jsonText[0]['tone'] 

    politicalMsg = chat.send_message(" what is Political or Economic Agenda score? Use this JSON schema: {'political': int}", generation_config=genai.GenerationConfig(response_mime_type="application/json", response_schema=list[Political]))
    jsonText = json.loads(politicalMsg.text)
    agenda = jsonText[0]['political']

    sourceDetailsMsg = chat.send_message("Give the analysis details for Source Credibility categories, Use this JSON schema: {'author_details': str, 'news_outlet_details': str}", generation_config=genai.GenerationConfig(response_mime_type="application/json", response_schema=list[Source_details]))
    jsonText = json.loads(sourceDetailsMsg.text)
    newsOutletDetails = jsonText[0]['news_outlet_details']
    authorDetails  =  jsonText[0]['author_details']

    contentDetailsMsg = chat.send_message("Give the analysis details for Content Accuracy categories, Use this JSON schema: {'citations_details': str, 'comparison_details': str, 'fact_checking_details': str}", generation_config=genai.GenerationConfig(response_mime_type="application/json", response_schema=list[Content_details]))
    jsonText = json.loads(contentDetailsMsg.text)
    citationsDetails = jsonText[0]['citations_details']
    comparisonDetails  =  jsonText[0]['comparison_details']
    factDetails = jsonText[0]['fact_checking_details']

    consistencyDetailsMsg = chat.send_message("Give the analysis details for Logical Consistency categories, Use this JSON schema: {'contradictory_details': str}", generation_config=genai.GenerationConfig(response_mime_type="application/json", response_schema=list[Consistency_details]))
    jsonText = json.loads(consistencyDetailsMsg.text)
    consistencyDetails = jsonText[0]['contradictory_details']

    toneDetailsMsg = chat.send_message("Give the analysis details for Sensationalism, Emotional Tone categories, Use this JSON schema: {'tone_details': str}", generation_config=genai.GenerationConfig(response_mime_type="application/json", response_schema=list[Tone_details]))
    jsonText = json.loads(toneDetailsMsg.text)
    toneDetails =  jsonText[0]['tone_details']
    
    politicalDetailsMsg = chat.send_message("Give the analysis details for Political or Economic Agenda  categories, Use this JSON schema: {'political_details': str}", generation_config=genai.GenerationConfig(response_mime_type="application/json", response_schema=list[Political_details]))
    jsonText = json.loads(politicalDetailsMsg.text)
    agendaDetails =  jsonText[0]['political_details']
    
    cur.execute("INSERT INTO news VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
            ,(None,url,newsType,newsOutlet,newsOutletDetails, author, authorDetails, citations,
            citationsDetails, comparison, comparisonDetails, fact, factDetails,
            consistency, consistencyDetails, tone, toneDetails, agenda, agendaDetails))
    con.commit()
    return 0



@app.route('/foobar')
def foobar():
    return "<span style='color:blue'>Hello, This is Team CS</span>"
