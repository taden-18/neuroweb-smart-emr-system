
# Smart Hypertension EMR

AI-Assisted Clinical Support Prototype

## Overview

Smart Hypertension EMR is a prototype Electronic Medical Record system designed to assist clinicians in managing hypertension cases through structured documentation, risk analysis, and AI-assisted workflows.

The system was developed in IntelliJ IDEA using:

* HTML for frontend structure
* CSS and Bootstrap for styling and layout
* JavaScript for client-side logic
* Chart.js for blood pressure visualization
* Python FastAPI (main.py) for planned backend API integration

Although full frontend and backend integration was not achieved, the architecture and system design were clearly defined.


## System Architecture

The system was designed using a client-server model:

Frontend built with HTML, CSS, and JavaScript
Planned REST API communication using fetch()
Backend built with FastAPI in main.py
AI and clinical risk logic handled server-side

This structure allows future scalability and AI enhancement.


## Core Features

Login and Dashboard
The application begins with a doctor login interface. After login, the dashboard displays a patient queue with search functionality, an option to add new patients, dark mode toggle, and logout functionality.

Patient Profile
Selecting a patient opens the patient profile section, which includes:

* Voice consultation using the Web Speech API
* Live transcription display
* Manual blood pressure input
* Automated risk analysis
* Structured SOAP note generation
* Printable clinical report
* Blood pressure trend visualization using Chart.js


## Blood Pressure Risk Logic

The frontend JavaScript includes logic to classify blood pressure readings into:

* Normal
* Stage 1 Hypertension
* Stage 2 Hypertension
* Hypertensive Crisis

The calculated risk level is displayed in the risk analysis panel and incorporated into structured SOAP notes.


## Backend Design (main.py)

The FastAPI backend was designed to provide:

* Blood pressure analysis endpoints
* AI-assisted SOAP note generation
* Natural language processing of transcribed notes
* Clinical decision support logic

Example planned endpoint:

@app.post("/analyze-bp")
def analyze_bp(data: dict):
return {"risk": "Stage 2 Hypertension"}

Frontend communication was planned using JavaScript fetch requests.


## Integration Challenges

During development, the following challenges were encountered:

* CORS configuration issues
* Localhost port mismatches
* Fetch request debugging
* Browser microphone permission constraints

Despite these challenges, the system architecture, data flow, and integration strategy were clearly mapped.


## System Workflow

Doctor login
Dashboard access
Patient selection
Voice consultation and transcription
Blood pressure entry
Risk analysis
SOAP note generation
Report printing


## Purpose and Academic Value

This project demonstrates:

* Full-stack system design
* Clinical workflow modeling
* Healthcare informatics application
* REST API planning
* AI-ready architecture

