from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import fitz
import tempfile
import os
import re
import mysql.connector
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(title="SmartMatch AI Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="smartmatch_ai"
    )

def extract_text_from_pdf(pdf_path: str) -> str:
    if not pdf_path or not os.path.exists(pdf_path):
        return ""

    try:
        doc = fitz.open(pdf_path)
        full_text = []

        for page in doc:
            text = page.get_text("text", sort=True)
            full_text.append(text)

        doc.close()
        return "\n".join(full_text).strip()
    except Exception:
        return ""

def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r"[^a-zA-Z0-9+#.\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def compute_similarity_score(source_text: str, target_text: str) -> float:
    source_text = normalize_text(source_text)
    target_text = normalize_text(target_text)

    if not source_text or not target_text:
        return 0.0

    try:
        vectorizer = TfidfVectorizer()
        vectors = vectorizer.fit_transform([source_text, target_text])
        score = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
        return round(float(score) * 100, 2)
    except Exception:
        return 0.0

def fetch_all_skills():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, skill_name FROM skills")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows

def extract_skills_from_text(text: str, skills_rows):
    normalized = normalize_text(text)
    found = []

    for row in skills_rows:
      skill = row["skill_name"].lower().strip()
      if skill and skill in normalized:
          found.append({
              "skill_id": row["id"],
              "skill_name": row["skill_name"]
          })

    return found

def get_job_required_skills_text(job_id: int) -> str:
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT s.skill_name
        FROM job_required_skills jrs
        JOIN skills s ON jrs.skill_id = s.id
        WHERE jrs.job_id = %s
    """, (job_id,))
    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return " ".join([row["skill_name"] for row in rows])

def get_freelancer_skills_text(freelancer_id: int) -> str:
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT s.skill_name
        FROM freelancer_skills fs
        JOIN skills s ON fs.skill_id = s.id
        WHERE fs.freelancer_id = %s
    """, (freelancer_id,))
    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return " ".join([row["skill_name"] for row in rows])

def fetch_latest_jobs():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT jobs.id, jobs.title, jobs.description, jobs.location, jobs.budget_min, jobs.budget_max
        FROM jobs
        ORDER BY jobs.id DESC
        LIMIT 20
    """)
    rows = cursor.fetchall()

    cursor.close()
    conn.close()
    return rows

def fetch_latest_freelancers():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT freelancers.id,
               freelancers.expected_salary,
               freelancers.availability,
               freelancers.location,
               freelancers.pdf_path,
               profiles.phone_number
        FROM freelancers
        LEFT JOIN profiles ON freelancers.user_id = profiles.user_id
        ORDER BY freelancers.id DESC
        LIMIT 20
    """)
    rows = cursor.fetchall()

    cursor.close()
    conn.close()
    return rows

def save_match(freelancer_id: int, job_id: int, match_score: float):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id FROM matches
        WHERE freelancer_id = %s AND job_id = %s
    """, (freelancer_id, job_id))
    existing = cursor.fetchone()

    if existing:
        cursor.execute("""
            UPDATE matches
            SET match_score = %s
            WHERE freelancer_id = %s AND job_id = %s
        """, (match_score, freelancer_id, job_id))
    else:
        cursor.execute("""
            INSERT INTO matches (freelancer_id, job_id, match_score)
            VALUES (%s, %s, %s)
        """, (freelancer_id, job_id, match_score))

    conn.commit()
    cursor.close()
    conn.close()

@app.get("/")
def root():
    return {"message": "SmartMatch AI Agent is running"}

@app.post("/analyze/freelancer-pdf")
async def analyze_freelancer_pdf(
    freelancer_id: int = Form(...),
    pdf: UploadFile = File(...)
):
    suffix = os.path.splitext(pdf.filename)[1] or ".pdf"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await pdf.read()
        tmp.write(content)
        temp_path = tmp.name

    try:
        extracted_text = extract_text_from_pdf(temp_path)
        skills_rows = fetch_all_skills()
        found_skills = extract_skills_from_text(extracted_text, skills_rows)
        jobs = fetch_latest_jobs()

        ranked_jobs = []
        for job in jobs:
            required_skills_text = get_job_required_skills_text(job["id"])
            job_text = f"""
                {job.get('title', '')}
                {job.get('description', '')}
                {job.get('location', '')}
                {required_skills_text}
            """

            score = compute_similarity_score(extracted_text, job_text)

            ranked_jobs.append({
                "job_id": job["id"],
                "title": job["title"],
                "location": job["location"],
                "budget_min": job["budget_min"],
                "budget_max": job["budget_max"],
                "match_score": score
            })

            save_match(freelancer_id, job["id"], score)

        ranked_jobs.sort(key=lambda x: x["match_score"], reverse=True)

        return {
            "success": True,
            "extracted_text_preview": extracted_text[:1500],
            "detected_skills": found_skills,
            "top_matches": ranked_jobs[:5]
        }

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/analyze/job-pdf")
async def analyze_job_pdf(
    job_id: int = Form(...),
    pdf: UploadFile = File(...)
):
    suffix = os.path.splitext(pdf.filename)[1] or ".pdf"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await pdf.read()
        tmp.write(content)
        temp_path = tmp.name

    try:
        extracted_text = extract_text_from_pdf(temp_path)
        skills_rows = fetch_all_skills()
        found_skills = extract_skills_from_text(extracted_text, skills_rows)
        freelancers = fetch_latest_freelancers()

        ranked_freelancers = []

        for freelancer in freelancers:
            freelancer_skills_text = get_freelancer_skills_text(freelancer["id"])

            freelancer_cv_text = ""
            if freelancer.get("pdf_path"):
                node_backend_root = os.path.join("..", "backend")
                relative_pdf = freelancer["pdf_path"].lstrip("/\\")
                absolute_pdf_path = os.path.join(
                    node_backend_root,
                    relative_pdf.replace("/", os.sep)
                )
                freelancer_cv_text = extract_text_from_pdf(absolute_pdf_path)

            freelancer_text = f"""
                {freelancer.get('location', '')}
                {freelancer.get('availability', '')}
                {freelancer.get('expected_salary', '')}
                {freelancer_skills_text}
                {freelancer_cv_text}
            """

            score = compute_similarity_score(extracted_text, freelancer_text)

            ranked_freelancers.append({
                "freelancer_id": freelancer["id"],
                "location": freelancer.get("location") or "N/A",
                "expected_salary": freelancer.get("expected_salary") or "N/A",
                "availability": freelancer.get("availability") or "N/A",
                "phone_number": freelancer.get("phone_number") or "N/A",
                "match_score": score
            })

            save_match(freelancer["id"], job_id, score)

        ranked_freelancers.sort(key=lambda x: x["match_score"], reverse=True)

        return {
            "success": True,
            "extracted_text_preview": extracted_text[:1500],
            "detected_skills": found_skills,
            "top_matches": ranked_freelancers[:5]
        }

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)