import google.generativeai as genai
from django.conf import settings
import json
import numpy as np

genai.configure(api_key=settings.GEMINI_API_KEY)

model = genai.GenerativeModel('gemini-1.5-flash')


def analyze_resume(resume_text):
    prompt = f"""
You are an expert technical recruiter analyzing a resume.
Extract the following information and return ONLY valid JSON.
No explanation. No markdown. No code blocks. Just raw JSON.

Resume Text:
{resume_text}

Return this exact JSON structure:
{{
    "skills": ["skill1", "skill2", "skill3"],
    "experience_years": 2.5,
    "education": [
        {{
            "degree": "BCA",
            "institution": "University Name",
            "year": "2022"
        }}
    ],
    "summary": "One paragraph professional summary",
    "job_titles": ["Backend Developer", "Django Developer"],
    "languages": ["Python", "JavaScript"]
}}

Rules:
- skills must be specific technical skills only
- experience_years must be a number
- If information is not found use empty array or null
- Return ONLY the JSON object nothing else
"""

    try:
        response = model.generate_content(prompt)
        result_text = response.text.strip()

        if result_text.startswith('```'):
            result_text = result_text.split('```')[1]
            if result_text.startswith('json'):
                result_text = result_text[4:]

        return json.loads(result_text)

    except Exception as e:
        print(f'Resume analysis error: {str(e)}')
        return {
            'skills': [],
            'experience_years': 0,
            'education': [],
            'summary': '',
            'job_titles': [],
            'languages': []
        }


def calculate_match_score(candidate_skills, job_skills):
    if not job_skills:
        return 0, [], []

    candidate_set = set(s.lower() for s in candidate_skills)
    job_set = set(s.lower() for s in job_skills)

    matched = candidate_set.intersection(job_set)
    missing = job_set.difference(candidate_set)

    score = round((len(matched) / len(job_set)) * 100, 1)

    return score, list(matched), list(missing)


def generate_interview_questions(resume_text, job_description, job_title):
    prompt = f"""
You are an expert technical interviewer.
Generate 10 interview questions for this specific candidate
applying for this specific job.

Job Title: {job_title}

Job Description:
{job_description[:1000]}

Candidate Resume:
{resume_text[:1000]}

Generate 5 technical questions and 5 behavioral questions.
Return ONLY valid JSON. No explanation. No markdown. No code blocks.

{{
    "technical_questions": [
        {{
            "question": "Question text here",
            "why_asked": "Brief reason based on candidate profile"
        }}
    ],
    "behavioral_questions": [
        {{
            "question": "Question text here",
            "why_asked": "Brief reason based on candidate profile"
        }}
    ]
}}
"""

    try:
        response = model.generate_content(prompt)
        result_text = response.text.strip()

        if result_text.startswith('```'):
            result_text = result_text.split('```')[1]
            if result_text.startswith('json'):
                result_text = result_text[4:]

        return json.loads(result_text)

    except Exception as e:
        print(f'Interview questions error: {str(e)}')
        return {
            'technical_questions': [],
            'behavioral_questions': []
        }


def generate_cover_letter(resume_text, job_description, job_title, company_name):
    prompt = f"""
Write a professional cover letter for this candidate
applying for this specific job.

Job Title: {job_title}
Company: {company_name}

Job Description:
{job_description[:800]}

Candidate Resume:
{resume_text[:800]}

Rules:
- 3 paragraphs maximum
- Professional but warm tone
- Highlight matching skills specifically
- Do not use generic phrases like I am writing to apply
- Make it sound genuine and specific
- Return only the cover letter text no subject line
"""

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f'Cover letter error: {str(e)}')
        return ''


def generate_embedding(text):
    try:
        result = genai.embed_content(
            model='models/embedding-001',
            content=text[:8000],
            task_type='retrieval_document'
        )
        return result['embedding']
    except Exception as e:
        print(f'Embedding error: {str(e)}')
        return None


def cosine_similarity(vec1, vec2):
    vec1 = np.array(vec1)
    vec2 = np.array(vec2)
    dot_product = np.dot(vec1, vec2)
    magnitude = np.linalg.norm(vec1) * np.linalg.norm(vec2)
    if magnitude == 0:
        return 0
    return dot_product / magnitude