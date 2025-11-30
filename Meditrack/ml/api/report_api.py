from fastapi import APIRouter
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import numpy as np

router = APIRouter()

# ---------------------------------------------------
# CONNECT TO MONGODB ATLAS
# ---------------------------------------------------
client = MongoClient(
    "mongodb+srv://meditrack:meditrack%401234@meditrack.f29hlqn.mongodb.net/?retryWrites=true&w=majority&appName=Meditrack"
)

db = client["MediTrack"]        # EXACT DB NAME
collection = db["amu"]          # EXACT COLLECTION NAME


# ---------------------------------------------------
# HELPER: Convert MongoDB ObjectId to string
# ---------------------------------------------------
def serialize(doc):
    doc["_id"] = str(doc["_id"])
    return doc


# ---------------------------------------------------
# MAIN API: Generate Statistical Report
# ---------------------------------------------------
@router.post("/area_amu_report")
async def area_amu_report(payload: dict):

    area = payload.get("area", "").strip().lower()

    # fetch all area documents
    docs = list(collection.find())

    clean_docs = []
    for d in docs:
        db_area = "".join(d.get("area", "").lower().split())
        if db_area == "".join(area.split()):
            clean_docs.append(d)

    if len(clean_docs) == 0:
        return {"message": f"No AMU data found for: {area}"}

    # convert data for statistics
    quantities = [d["quantity"] for d in clean_docs]
    dates = [datetime.strptime(d["date"], "%Y-%m-%d") for d in clean_docs]

    # sort by date
    paired = sorted(list(zip(dates, quantities)), key=lambda x: x[0])
    dates_sorted = [p[0].strftime("%Y-%m-%d") for p in paired]
    quantities_sorted = [p[1] for p in paired]

    # compute stats
    total_records = len(quantities_sorted)
    mean_quantity = float(np.mean(quantities_sorted))
    std_quantity = float(np.std(quantities_sorted))

    max_index = int(np.argmax(quantities_sorted))
    min_index = int(np.argmin(quantities_sorted))

    max_day = dates_sorted[max_index]
    min_day = dates_sorted[min_index]

    # build anomaly detection (simple z-score)
    z_scores = (quantities_sorted - np.mean(quantities_sorted)) / np.std(quantities_sorted)
    anomalies = []

    for i, z in enumerate(z_scores):
        if abs(z) > 1:  # threshold = 1 SD
            anomalies.append({
                "date": dates_sorted[i],
                "quantity": quantities_sorted[i],
                "z_score": float(z)
            })

    # final response
    response = {
        "area": area,
        "total_records": total_records,
        "mean_quantity": mean_quantity,
        "std_quantity": std_quantity,
        "max_usage_day": max_day,
        "min_usage_day": min_day,
        "daily_trend": {
            "dates": dates_sorted,
            "quantities": quantities_sorted
        },
        "anomalies": anomalies
    }

    return response

@router.get("/list_areas")
async def list_areas():
    docs = collection.find()
    areas = set()

    for d in docs:
        if "area" in d:
            clean = "".join(d["area"].lower().split())
            areas.add(clean)

    # Return sorted unique area names
    return {"areas": sorted(list(areas))}
