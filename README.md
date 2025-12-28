# 🏥 AI Health Symptom Analyzer

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An AI-powered health symptom analyzer that provides preliminary health insights based on your symptoms. Built with FastAPI, powered by LLaMA 3 via Groq API.

![HealthAI Screenshot](assets/screenshot.png)

## ⚠️ Important Disclaimer

**This application is for EDUCATIONAL and INFORMATIONAL purposes only.** It does NOT:
- Replace professional medical advice, diagnosis, or treatment
- Provide actual medical diagnoses
- Substitute consultation with a qualified healthcare provider

**Always seek the advice of a physician or other qualified health provider** with any questions you may have regarding a medical condition.

---

## 🚀 Features

- **🔬 Symptom Analysis** - Describe your symptoms and get AI-powered preliminary assessments
- **📄 Report Analysis** - Upload medical reports (PDF) and get easy-to-understand explanations
- **💬 Health Chat** - Interactive conversation about health concerns
- **🔒 Privacy Focused** - Your data stays secure
- **📱 Responsive Design** - Works on desktop and mobile
- **⚡ Instant Results** - Get insights in seconds

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | FastAPI (Python) |
| **AI/LLM** | LLaMA 3 via Groq API |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **PDF Processing** | PyPDF2 |
| **Styling** | Custom CSS with CSS Variables |

---

## 📂 Project Structure

```
health-ai-assistant/
├── server/
│   └── main.py           # FastAPI backend server
├── static/
│   ├── css/
│   │   └── style.css     # Application styles
│   └── js/
│       └── app.js        # Frontend JavaScript
├── templates/
│   └── index.html        # Main HTML template
├── uploads/              # Temporary file uploads
├── requirements.txt      # Python dependencies
├── .env.example          # Environment template
├── vercel.json           # Vercel deployment config
├── railway.json          # Railway deployment config
├── Dockerfile            # Docker configuration
├── .gitignore
└── README.md
```

---

## ⚙️ Local Setup

### Prerequisites

- Python 3.9 or higher
- pip (Python package manager)
- Git
- A free Groq API key ([Get one here](https://console.groq.com/))

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/health-ai-assistant.git
cd health-ai-assistant
```

### Step 2: Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Groq API key
# GROQ_API_KEY=your_groq_api_key_here
```

### Step 5: Run the Application

```bash
# From the project root directory
uvicorn server.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 6: Open in Browser

Navigate to: **http://localhost:8000**

API Documentation: **http://localhost:8000/docs**

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended - FREE)

1. **Fork this repository** to your GitHub account

2. **Go to [Vercel](https://vercel.com)** and sign in with GitHub

3. **Import your repository**:
   - Click "New Project"
   - Select your forked repository
   - Framework Preset: Other

4. **Add Environment Variables**:
   - `GROQ_API_KEY`: Your Groq API key

5. **Deploy!** Vercel will automatically build and deploy

### Option 2: Railway (FREE tier available)

1. **Go to [Railway](https://railway.app)** and sign in with GitHub

2. **Create New Project** → Deploy from GitHub Repo

3. **Select your repository**

4. **Add Environment Variables**:
   - `GROQ_API_KEY`: Your Groq API key

5. Railway will auto-detect the configuration and deploy

### Option 3: Render (FREE tier available)

1. **Go to [Render](https://render.com)** and sign in

2. **Create New Web Service**

3. **Connect your GitHub repository**

4. **Configure**:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn server.main:app --host 0.0.0.0 --port $PORT`

5. **Add Environment Variables** and deploy

### Option 4: Docker

```bash
# Build the image
docker build -t health-ai-assistant .

# Run the container
docker run -d -p 8000:8000 -e GROQ_API_KEY=your_key health-ai-assistant
```

---

## 💻 Recommended IDEs

### 1. **Cursor AI** (Highly Recommended)
- AI-powered code editor built on VS Code
- Best for AI/ML projects
- Native AI assistance
- [Download](https://cursor.sh/)

### 2. **VS Code**
- Most popular free editor
- Excellent Python support
- Rich extension ecosystem
- **Recommended Extensions**:
  - Python (Microsoft)
  - Pylance
  - Python Debugger
  - GitLens
  - Thunder Client (API testing)
- [Download](https://code.visualstudio.com/)

### 3. **Claude Code (CLI)**
- Best for terminal-based development
- AI-powered coding assistant
- Great for quick iterations
- [Learn more](https://docs.anthropic.com/claude-code)

### 4. **PyCharm**
- Professional Python IDE
- Excellent debugging tools
- Built-in terminal and Git
- [Download](https://www.jetbrains.com/pycharm/)

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Home page |
| `GET` | `/health-check` | API health status |
| `POST` | `/api/auth/signup` | Register new user |
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/analyze/symptoms` | Analyze symptoms |
| `POST` | `/api/analyze/report` | Analyze PDF report |
| `POST` | `/api/chat` | Health chat |
| `GET` | `/api/analyses` | Get all analyses |
| `GET` | `/api/analyses/{id}` | Get specific analysis |

### Example: Analyze Symptoms

```bash
curl -X POST "http://localhost:8000/api/analyze/symptoms" \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["headache", "fatigue", "mild fever"],
    "duration": "3-7 days",
    "severity": "moderate",
    "age": 30,
    "gender": "male",
    "medical_history": "None"
  }'
```

---

## 🎨 Customization

### Changing Colors
Edit CSS variables in `static/css/style.css`:

```css
:root {
    --primary: #0ea5e9;        /* Main brand color */
    --secondary: #8b5cf6;      /* Accent color */
    --bg-primary: #0f172a;     /* Background */
    /* ... more variables */
}
```

### Adding New AI Features
Modify the `get_ai_analysis()` function in `server/main.py`:

```python
async def get_ai_analysis(prompt: str) -> str:
    # Add your custom AI logic here
    pass
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📬 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/health-ai-assistant/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/health-ai-assistant/discussions)

---

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Groq](https://groq.com/) - Fast AI inference
- [LLaMA](https://ai.meta.com/llama/) - Open-source LLM by Meta

---

**Remember:** This tool is for informational purposes only. Always consult healthcare professionals for medical advice.
