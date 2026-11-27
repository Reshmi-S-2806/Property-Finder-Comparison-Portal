# Property Finder Comparison Portal

React + FastAPI + PostgreSQL app to search, shortlist and compare commercial properties.

## 1. Database

docker compose up -d          # starts PostgreSQL on port 5433
```
(or create a database named `propertyfinder` in your own PostgreSQL install and set DATABASE_URL)

## 2. Backend

cd backend
python -m venv venv
source venv/bin/activate      
pip install -r requirements.txt
python seed.py                # adds 40 sample properties
uvicorn app.main:app --reload
```
API runs at http://localhost:8000, interactive docs at http://localhost:8000/docs

## 3. Frontend

cd frontend
npm install
npm run dev
```
Open http://localhost:5173

## API summary
| Method | Path | Purpose |
|---|---|---|
| GET | /properties | Search with filters, sort, pagination |
| GET | /properties/compare?ids=1,2,3 | Fetch 2-3 properties to compare |
| GET/PUT/DELETE | /properties/{id} | Read, update, delete |
| POST | /properties | Create (with contacts) |
| POST | /properties/{id}/photos | Upload photo |
| POST | /properties/{id}/contacts | Add owner/broker contact |
| GET/POST/DELETE | /shortlist, /shortlist/{id} | Shortlist per browser session (X-Session-Id header) |
