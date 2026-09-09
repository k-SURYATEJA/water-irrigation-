"""
FastAPI application entrypoint for AI + Quantum-Inspired Irrigation System.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database.db import init_db, SessionLocal
from .seed.demo_data import seed_database
from .api.endpoints import router as api_router

app = FastAPI(
    title="Quantum-Inspired Irrigation & Water Resource Allocation Optimization API",
    description="Intelligent decision-support system for Krishna-Godavari command areas",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "project": "AI + Quantum-Inspired Irrigation and Water Resource Allocation",
        "commandArea": "Krishna-Godavari River Basins (Andhra Pradesh)",
        "optimization": "Transverse-Field Simulated Quantum Annealing (QUBO)",
        "documentation": "/docs"
    }
