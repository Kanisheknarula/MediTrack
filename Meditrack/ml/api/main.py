from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
import random

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------------------------
# MOCK DATA
# --------------------------------------------------------------------

AREAS = ["indore", "bhopal", "ujjain"]

def generate_mock_daily_data(days=15):
    base = 50
    today = datetime.now()
    dates = []
    quantities = []
    for i in range(days):
        dt = today - timedelta(days=(days-i))
        q = base + random.randint(-20, 40)
        dates.append(dt.strftime("%Y-%m-%d"))
        quantities.append(max(q, 0))
    return dates, quantities

# --------------------------------------------------------------------
# ✔ LIST AREAS  → RETURNS ARRAY (frontend expects array)
# --------------------------------------------------------------------
@app.get("/list_areas")
def list_areas():
    return [a.lower() for a in AREAS]

# --------------------------------------------------------------------
# ✔ AREA AMU REPORT  → MATCH EXACTLY WHAT FRONTEND WANTS
# --------------------------------------------------------------------
class AreaRequest(BaseModel):
    area: str

@app.post("/area_amu_report")
def area_amu_report(req: AreaRequest):

    if req.area.lower() not in AREAS:
        return {"error": "Area not found"}

    dates, quantities = generate_mock_daily_data()

    return {
        "daily_trend": {
            "dates": dates,
            "quantities": quantities    # FIXED
        },
        "mean_quantity": round(sum(quantities) / len(quantities), 2),
        "std_quantity": round(random.uniform(10, 30), 2),
        "total_records": len(quantities),
        "anomalies": []  # keeps frontend happy
    }

# --------------------------------------------------------------------
# ✔ AMU BY CITY (frontend expects cities & quantities)
# --------------------------------------------------------------------
@app.get("/amu_by_city")
def amu_by_city():
    cities = ["indore", "bhopal", "ujjain"]
    values = [random.randint(20, 100) for _ in cities]
    return {
        "cities": cities,
        "quantities": values
    }

# --------------------------------------------------------------------
# ✔ DETECT ANOMALIES → frontend expects array
# --------------------------------------------------------------------
@app.post("/detect_anomalies")
def detect_anomalies(req: AreaRequest):
    dates, quantities = generate_mock_daily_data()
    anomalies = []

    for d, q in zip(dates, quantities):
        if q > 90 or q < 20:
            anomalies.append({"date": d, "quantity": q})

    return anomalies  # FRONTEND EXPECTS ARRAY

# --------------------------------------------------------------------
# RUN COMMAND:
# uvicorn main:app --reload --port 8001
# --------------------------------------------------------------------
