from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

from rag import ask_energy_assistant, get_ev_recommendation, get_appliance_recommendation
from data_loader import get_household_info, get_monthly_summary, get_tariffs

# ── Initialise FastAPI app ────────────────────────────────────────────────────
app = FastAPI(
    title="Smart Energy Assistant API",
    description="AI-powered energy advisor built on Eneco smart meter data",
    version="1.0.0"
)

# ── CORS — allows frontend to talk to this API ────────────────────────────────
# In production you'd restrict this to your actual domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# ── Conversation memory ───────────────────────────────────────────────────────
# Stores chat history per session so Claude remembers context
# In production this would be a database (Redis, PostgreSQL etc)
conversation_store = {}


# ── Request/Response models ───────────────────────────────────────────────────
# Pydantic models define exactly what data the API expects and returns
# This gives you automatic validation and documentation for free

class ChatRequest(BaseModel):
    question: str
    session_id: str = "default"  # identifies the user's conversation

class ChatResponse(BaseModel):
    answer: str
    session_id: str

class EVRequest(BaseModel):
    battery_percent: int = 20

class ApplianceRequest(BaseModel):
    appliance: str
    preferred_time: Optional[str] = None


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "status": "running",
        "service": "Smart Energy Assistant API",
        "version": "1.0.0"
    }


# ── Main chat endpoint ────────────────────────────────────────────────────────
@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """
    The main conversational endpoint.
    
    Accepts a question + session_id.
    Returns Claude's answer.
    
    Multi-turn: each session_id has its own conversation history
    so Claude remembers what was said earlier in the same chat.
    """
    try:
        # Get or create conversation history for this session
        if request.session_id not in conversation_store:
            conversation_store[request.session_id] = []

        history = conversation_store[request.session_id]

        # Ask Claude
        answer = ask_energy_assistant(request.question, history)

        # Save this exchange to history for next turn
        conversation_store[request.session_id].extend([
            {"role": "user", "content": request.question},
            {"role": "assistant", "content": answer}
        ])

        return ChatResponse(answer=answer, session_id=request.session_id)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── EV charging recommendation endpoint ──────────────────────────────────────
@app.post("/recommend/ev")
def ev_recommendation(request: EVRequest):
    """
    Dedicated EV charging endpoint.
    
    A Java/.NET client team could call this single endpoint
    to get an EV recommendation — no AI knowledge needed on their side.
    This is how you drop AI into an existing system cleanly.
    """
    try:
        recommendation = get_ev_recommendation(request.battery_percent)
        return {"recommendation": recommendation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Appliance scheduling endpoint ─────────────────────────────────────────────
@app.post("/recommend/appliance")
def appliance_recommendation(request: ApplianceRequest):
    """
    Dedicated appliance scheduling endpoint.
    User says what appliance, gets back optimal time to run it.
    """
    try:
        recommendation = get_appliance_recommendation(
            request.appliance,
            request.preferred_time
        )
        return {"recommendation": recommendation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Dashboard data endpoint ───────────────────────────────────────────────────
@app.get("/dashboard")
def dashboard():
    """
    Returns all the data the frontend needs to render the dashboard.
    One call — all the data.
    """
    try:
        return {
            "household": get_household_info(),
            "monthly_summary": get_monthly_summary(),
            "tariffs": get_tariffs()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Clear conversation history ────────────────────────────────────────────────
@app.delete("/chat/{session_id}")
def clear_conversation(session_id: str):
    """Resets conversation history for a session."""
    if session_id in conversation_store:
        del conversation_store[session_id]
    return {"message": f"Conversation {session_id} cleared"}


# ── Run the server ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)