from fastapi import FastAPI
import uvicorn
import tensorflow as tf
import joblib
import numpy as np

app = FastAPI()

model = tf.keras.models.load_model("../models/mrl_model.keras")
scaler = joblib.load("../models/mrl_scaler.pkl")

@app.post("/predict_mrl")
def predict(data: dict):
    dose = data["dose"]
    days = data["days_since_treatment"]
    weight = data["weight"]

    X = np.array([[dose, days, weight]])
    X_scaled = scaler.transform(X)

    prediction = model.predict(X_scaled)[0][0]

    return {"predicted_residue_ppm": float(prediction)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
