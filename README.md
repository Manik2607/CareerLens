# 🔍 CareerLens

A full-stack application built with **Next.js** (frontend) and **FastAPI** (backend).

---

## 📁 Project Structure

```
CareerLens/
├── frontend/          # Next.js application
│   ├── app/           # App Router pages & layouts
│   ├── public/        # Static assets
│   └── package.json
├── backend/           # FastAPI application
│   ├── main.py        # API entrypoint
│   ├── requirements.txt
│   ├── venv/          # Python virtual environment (git-ignored)
│   └── .env.example   # Environment variable template
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.10
- **npm** (comes with Node.js)

---

### 1. Frontend (Next.js)

```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start dev server → http://localhost:3000
```

### 2. Backend (FastAPI)

#### Activate the virtual environment

**Windows (PowerShell):**
```powershell
.\backend\venv\Scripts\Activate.ps1
```

**macOS / Linux:**
```bash
source backend/venv/bin/activate
```

#### Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### Run the server

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at **http://localhost:8000**.  
Interactive docs at **http://localhost:8000/docs**.

---

### 3. Adding New Dependencies

**Frontend:**
```bash
cd frontend
npm install <package-name>
```

**Backend:**
```bash
# Make sure the venv is activated first
pip install <package-name>
pip freeze > requirements.txt      # Update the requirements file
```

---

## 🛠️ Tech Stack

| Layer    | Technology |
| -------- | ---------- |
| Frontend | Next.js (App Router) |
| Backend  | FastAPI |
| Runtime  | Node.js / Python |

---

## 📄 License

MIT
