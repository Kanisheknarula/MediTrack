# 💊 MediTrack

A smart medicine adherence tracking system that helps users manage their medication schedules, detect missed doses, and track adherence in real-time.

---

## 🚀 Features

- 📅 Medicine schedule management  
- ⏰ Real-time dose tracking  # 🌿 Meditrack – AI-Based Medicine Adherence Monitoring System

Meditrack is an intelligent healthcare monitoring system designed to track medicine intake, analyze user behavior, and generate AI-driven insights to improve adherence and health outcomes.

---

## 🚀 Features

### 📊 Adherence Analysis

* Calculates medication adherence using:

  * **Adherence (%) = (Taken Doses / Total Doses) × 100**
* Classifies adherence into risk levels (Low, Medium, High)

### 🧠 Health Score Prediction

* Generates a **health score (0–100)** based on adherence
* Categorizes user condition:

  * Healthy 🌿
  * Moderate ⚠️
  * Critical 🚨

### 🕒 Pattern Detection

* Identifies **most missed time period** (morning / afternoon / night)
* Detects behavioral trends in medication habits

### 🔍 AI-Based Insights

* Generates human-like explanations:

  * Example: *"User tends to miss medicines at night due to fatigue"*

### 🤖 Smart Recommendations

* Suggests improvements:

  * Reminder setup
  * Routine adjustments
  * Habit correction strategies

### 📈 Data Visualization

* Interactive charts using Chart.js
* Visual comparison of taken vs missed doses

### 📄 Report Generation

* Downloadable AI-generated health report

### 🌿 Farm-Themed UI

* Nature-inspired UI representing health as growth and consistency
* Clean, interactive, and user-friendly dashboard

---

## 🏗️ Tech Stack

* **Frontend:** HTML, CSS, JavaScript
* **Backend:** Node.js (Express)
* **Visualization:** Chart.js
* **Deployment:** Render, Vercel
* **Concepts Used:**

  * Data Analysis
  * Rule-based AI
  * Pattern Recognition

---

## ⚙️ How It Works

1. User medicine logs are stored with:

   * Medicine name
   * Time (morning / afternoon / night)
   * Status (taken / missed)

2. Backend processes logs to:

   * Calculate adherence
   * Detect patterns
   * Generate insights

3. Frontend dashboard displays:

   * Health score
   * Risk level
   * Charts and reports

---

## 🧪 Sample Output

* Adherence: 70%
* Most Missed Time: Night
* Health Score: 70/100 (Moderate)
* Insight:
  *User frequently misses medicines at night due to irregular schedule*

---

## 🌐 Live Demo

* Frontend: [Add your Vercel link here]
* Backend API: [Add your Render link here]

---

## 📂 Project Structure

```
meditrack/
├── server.js
├── package.json
├── index.html
```

---

## 🧠 Future Enhancements

* Machine Learning-based risk prediction
* Time-series trend analysis
* User authentication system
* Database integration (MongoDB)
* Mobile app version

---

## 👨‍💻 Author

**Kanishek Narula**
BTech CSE | Data Science Enthusiast

---

## ⭐ Note

This project demonstrates how AI-driven insights can be applied to healthcare monitoring systems using simple, scalable logic and interactive visualization.

- ❌ Missed dose detection  
- 📊 Adherence percentage calculation  
- 📈 Dashboard with insights  
- 🔗 Full-stack integration (Frontend + Backend + Database)

---

## 🛠️ Tech Stack

- Frontend: React.js  
- Backend: Node.js, Express.js  
- Database: MongoDB  
- Other: REST APIs

---

## 🧠 How It Works

- Users add their medicines and dosage timings  
- System tracks whether doses are taken or missed  
- Calculates adherence percentage  
- Displays insights on dashboard  

---

## ⚙️ Installation

```bash
git clone https://github.com/your-username/MediTrack.git
cd MediTrack
