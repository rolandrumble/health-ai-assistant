# 🏥 AI Health Symptom Analyzer

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An AI-powered health symptom analyzer that provides preliminary health insights based on your symptoms. Built with FastAPI, powered by LLaMA 3 via Groq API.

!<img width="1870" height="723" alt="image" src="https://github.com/user-attachments/assets/40d9d7c6-5b5b-47ce-b3d6-c40544468f99" />


## ⚠️ Important Disclaimer

**This application is for EDUCATIONAL and INFORMATIONAL purposes only.** It does NOT:
- Replace professional medical advice, diagnosis, or treatment
- Provide actual medical diagnoses
- Substitute consultation with a qualified healthcare provider

**Always seek the advice of a physician or other qualified health provider** with any questions you may have regarding a medical condition.

---

## Features

- **🔬 Symptom Analysis** - Describe your symptoms and get AI-powered preliminary assessments
- **📄 Report Analysis** - Upload medical reports (PDF) and get easy-to-understand explanations
- **💬 Health Chat** - Interactive conversation about health concerns
- **🔒 Privacy Focused** - Your data stays secure
- **Responsive Design** - Works on desktop and mobile
- **Instant Results** - Get insights in seconds

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

**Remember:** This tool is for informational purposes only. Always consult healthcare professionals for medical advice.
