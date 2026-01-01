"""
AI Health Symptom Analyzer - Backend Server
A FastAPI-based medical symptom analysis application using AI
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.requests import Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import os
import json
import httpx
from datetime import datetime
import uuid
import PyPDF2
from io import BytesIO
from dotenv import load_dotenv
import pathlib

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AI Health Symptom Analyzer",
    description="An AI-powered health symptom analysis and preliminary diagnosis tool",
    version="1.0.0"
)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files and templates
# Use absolute paths for Vercel deployment
base_dir = pathlib.Path(__file__).parent.parent
static_dir = base_dir / "static"
templates_dir = base_dir / "templates"

app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")
templates = Jinja2Templates(directory=str(templates_dir))

# In-memory storage (replace with database in production)
analyses_db = {}
users_db = {}

# =============================================================================
# Pydantic Models
# =============================================================================

class SymptomInput(BaseModel):
    symptoms: List[str] = Field(..., min_length=1, description="List of symptoms")
    duration: str = Field(..., description="How long symptoms have been present")
    severity: str = Field(..., description="Severity level: mild, moderate, severe")
    age: int = Field(..., ge=0, le=150, description="Patient age")
    gender: str = Field(..., description="Patient gender")
    medical_history: Optional[str] = Field(None, description="Any relevant medical history")

class ChatMessage(BaseModel):
    message: str = Field(..., description="User message for health consultation")
    context: Optional[str] = Field(None, description="Previous conversation context")

class AnalysisResponse(BaseModel):
    analysis_id: str
    timestamp: str
    symptoms: List[str]
    preliminary_assessment: str
    possible_conditions: List[dict]
    recommendations: List[str]
    urgency_level: str
    disclaimer: str

class UserSignup(BaseModel):
    email: str
    password: str
    name: str
    user_type: str = "patient"  # patient or healthcare_provider

class UserLogin(BaseModel):
    email: str
    password: str

# =============================================================================
# AI Analysis Functions
# =============================================================================

async def get_ai_analysis(prompt: str) -> str:
    """
    Get AI-powered health analysis using Groq API
    Falls back to a structured response if API is unavailable
    """
    groq_api_key = os.getenv("GROQ_API_KEY")
    
    if groq_api_key:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {groq_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "llama-3.3-70b-versatile",
                        "messages": [
                            {
                                "role": "system",
                                "content": """You are a helpful medical AI assistant. You provide preliminary health information based on symptoms described. 
                                
IMPORTANT DISCLAIMERS:
- You are NOT a replacement for professional medical advice
- Always recommend consulting a healthcare provider for proper diagnosis
- In case of emergency symptoms, advise immediate medical attention
- Provide educational information only

Format your responses as structured JSON with the following fields:
- preliminary_assessment: A brief overview of the symptoms
- possible_conditions: An array of objects with {name, likelihood, description}
- recommendations: An array of actionable advice
- urgency_level: One of "low", "moderate", "high", "emergency"
- when_to_seek_help: Specific warning signs to watch for"""
                            },
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.3,
                        "max_tokens": 2000
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"Groq API error: {e}")
    
    # Fallback response if API unavailable
    return generate_fallback_response()

def generate_fallback_response() -> str:
    """Generate a helpful fallback response when AI API is unavailable"""
    return json.dumps({
        "preliminary_assessment": "Based on the symptoms provided, I can offer some general health information. However, for accurate diagnosis, please consult a healthcare professional.",
        "possible_conditions": [
            {
                "name": "General Health Consultation Needed",
                "likelihood": "N/A",
                "description": "Your symptoms require professional medical evaluation for accurate diagnosis."
            }
        ],
        "recommendations": [
            "Schedule an appointment with your primary care physician",
            "Keep track of your symptoms, noting any changes in severity or new symptoms",
            "Stay hydrated and get adequate rest",
            "Avoid self-medication without professional guidance"
        ],
        "urgency_level": "moderate",
        "when_to_seek_help": "Seek immediate medical attention if you experience: difficulty breathing, chest pain, sudden severe headache, high fever, or any symptoms that are rapidly worsening."
    })

def extract_text_from_pdf(pdf_file: bytes) -> str:
    """Extract text content from uploaded PDF file"""
    try:
        pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_file))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")

# =============================================================================
# API Routes - Pages
# =============================================================================

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Render the home page"""
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Render the user dashboard"""
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.get("/health-check")
async def health_check():
    """API health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# =============================================================================
# API Routes - Authentication
# =============================================================================

@app.post("/api/auth/signup")
async def signup(user: UserSignup):
    """Register a new user"""
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    users_db[user.email] = {
        "id": user_id,
        "email": user.email,
        "password": user.password,  # In production, hash this!
        "name": user.name,
        "user_type": user.user_type,
        "created_at": datetime.now().isoformat()
    }
    
    return {
        "message": "User registered successfully",
        "user_id": user_id,
        "email": user.email
    }

@app.post("/api/auth/login")
async def login(credentials: UserLogin):
    """Authenticate user"""
    user = users_db.get(credentials.email)
    
    if not user or user["password"] != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "message": "Login successful",
        "user_id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "user_type": user["user_type"]
    }

# =============================================================================
# API Routes - Symptom Analysis
# =============================================================================

@app.post("/api/analyze/symptoms", response_model=AnalysisResponse)
async def analyze_symptoms(symptoms_data: SymptomInput):
    """
    Analyze user symptoms and provide preliminary health information
    """
    analysis_id = str(uuid.uuid4())
    
    # Build the prompt for AI analysis
    prompt = f"""
    Please analyze the following health symptoms and provide a structured assessment:
    
    **Patient Information:**
    - Age: {symptoms_data.age} years old
    - Gender: {symptoms_data.gender}
    - Medical History: {symptoms_data.medical_history or 'None provided'}
    
    **Symptoms:**
    {', '.join(symptoms_data.symptoms)}
    
    **Duration:** {symptoms_data.duration}
    **Severity:** {symptoms_data.severity}
    
    Please provide:
    1. A preliminary assessment of these symptoms
    2. Possible conditions that could cause these symptoms (with likelihood)
    3. Recommended next steps
    4. Urgency level (low/moderate/high/emergency)
    5. Warning signs that would require immediate medical attention
    
    Remember: This is for educational purposes only and not a medical diagnosis.
    """
    
    # Get AI analysis
    ai_response = await get_ai_analysis(prompt)
    
    try:
        # Try to parse JSON from AI response
        # Handle cases where response might be wrapped in markdown code blocks
        if "```json" in ai_response:
            ai_response = ai_response.split("```json")[1].split("```")[0]
        elif "```" in ai_response:
            ai_response = ai_response.split("```")[1].split("```")[0]
        
        analysis_data = json.loads(ai_response)
    except json.JSONDecodeError:
        # If parsing fails, use the raw response
        analysis_data = {
            "preliminary_assessment": ai_response,
            "possible_conditions": [],
            "recommendations": ["Please consult a healthcare professional for accurate diagnosis"],
            "urgency_level": "moderate"
        }
    
    # Build response
    response = AnalysisResponse(
        analysis_id=analysis_id,
        timestamp=datetime.now().isoformat(),
        symptoms=symptoms_data.symptoms,
        preliminary_assessment=analysis_data.get("preliminary_assessment", "Analysis complete"),
        possible_conditions=analysis_data.get("possible_conditions", []),
        recommendations=analysis_data.get("recommendations", []),
        urgency_level=analysis_data.get("urgency_level", "moderate"),
        disclaimer="This analysis is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare provider for proper diagnosis and treatment."
    )
    
    # Store analysis
    analyses_db[analysis_id] = response.dict()
    
    return response

@app.post("/api/analyze/report")
async def analyze_medical_report(file: UploadFile = File(...)):
    """
    Upload and analyze a medical report PDF
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Read and extract text from PDF
    pdf_content = await file.read()
    extracted_text = extract_text_from_pdf(pdf_content)
    
    if not extracted_text:
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")
    
    analysis_id = str(uuid.uuid4())
    
    # Build prompt for medical report analysis
    prompt = f"""
    Please analyze the following medical report and provide a patient-friendly summary:
    
    **Medical Report Content:**
    {extracted_text[:4000]}  # Limit text length
    
    Please provide:
    1. A clear, easy-to-understand summary of the report findings
    2. Key health indicators and what they mean
    3. Any abnormal values and their significance
    4. Recommended follow-up actions
    5. Questions the patient might want to ask their doctor
    
    Format the response in a way that's accessible to someone without medical training.
    """
    
    ai_response = await get_ai_analysis(prompt)
    
    return {
        "analysis_id": analysis_id,
        "timestamp": datetime.now().isoformat(),
        "filename": file.filename,
        "analysis": ai_response,
        "disclaimer": "This analysis is for informational purposes only. Please discuss these results with your healthcare provider."
    }

@app.post("/api/chat")
async def health_chat(chat_data: ChatMessage):
    """
    Interactive health consultation chat
    """
    prompt = f"""
    User health question: {chat_data.message}
    
    Previous context: {chat_data.context or 'None'}
    
    Please provide helpful, accurate health information while:
    1. Being empathetic and supportive
    2. Providing evidence-based information
    3. Recommending professional consultation when appropriate
    4. Avoiding definitive diagnoses
    """
    
    response = await get_ai_analysis(prompt)
    
    return {
        "response": response,
        "timestamp": datetime.now().isoformat()
    }

# =============================================================================
# API Routes - History & Data
# =============================================================================

@app.get("/api/analyses")
async def get_all_analyses():
    """Get all stored analyses (for demo purposes)"""
    return {"analyses": list(analyses_db.values())}

@app.get("/api/analyses/{analysis_id}")
async def get_analysis(analysis_id: str):
    """Get a specific analysis by ID"""
    if analysis_id not in analyses_db:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analyses_db[analysis_id]

# =============================================================================
# Run Application
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
