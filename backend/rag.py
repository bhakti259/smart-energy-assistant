import os
from anthropic import Anthropic
from dotenv import load_dotenv
from data_loader import get_context_for_ai

# ── Load API key from .env file ───────────────────────────────────────────────
load_dotenv()

# ── Initialise the Anthropic client ──────────────────────────────────────────
client = Anthropic()


def ask_energy_assistant(user_question: str, conversation_history: list = None) -> str:
    """
    The core RAG function.
    
    What happens here:
    1. Load the energy context (our data)
    2. Build a system prompt telling Claude who it is
    3. Send the user question + context + history to Claude
    4. Return Claude's answer
    
    conversation_history: list of previous messages for multi-turn chat
    """

    # Step 1 — Get the energy data as text
    energy_context = get_context_for_ai()

    # Step 2 — System prompt: tells Claude its role and gives it the data
    system_prompt = f"""You are an intelligent energy assistant for Eneco Belgium.
You help households understand their energy consumption and save money.

You have access to the following real-time smart meter data for this household:

{energy_context}

Your personality:
- Friendly, clear, and helpful
- Always specific — use actual numbers from the data
- Proactive — don't just answer the question, add one useful tip
- Think like a smart energy advisor, not a chatbot

You can help with:
- Explaining energy bills and consumption patterns
- EV charging optimisation (when is cheapest/greenest to charge)
- Appliance scheduling recommendations
- Solar panel usage analysis
- Budget tracking and saving tips

Always base your answers on the actual data provided above.
If something is not in the data, say so honestly.
Respond in the same language the user writes in (English or Dutch).
"""

    # Step 3 — Build the messages list
    # If there's conversation history, include it for multi-turn chat
    messages = []

    if conversation_history:
        messages.extend(conversation_history)

    # Add the current user question
    messages.append({
        "role": "user",
        "content": user_question
    })

    # Step 4 — Call the Claude API
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        system=system_prompt,
        messages=messages
    )

    # Step 5 — Extract and return the text response
    return response.content[0].text


def get_ev_recommendation(current_battery_percent: int = 20) -> str:
    """
    Specialised function for EV charging recommendations.
    
    Takes current battery level and returns a specific
    recommendation on when and how to charge tonight.
    
    This shows how you can build targeted AI functions
    on top of the base RAG pattern.
    """
    question = f"""
    My EV battery is currently at {current_battery_percent}%.
    When should I charge it tonight to minimise cost?
    Give me a specific charging schedule with expected cost.
    """
    return ask_energy_assistant(question)


def get_appliance_recommendation(appliance: str, preferred_time: str = None) -> str:
    """
    Specialised function for appliance scheduling.
    
    User says "I need to run my washing machine today"
    AI says "Run it at 11am when your solar peaks — it'll be free"
    """
    question = f"""
    I need to run my {appliance} today.
    {'I prefer to run it around ' + preferred_time + '.' if preferred_time else ''}
    Based on my tariffs and solar generation, 
    what is the best time to run it and how much will it cost?
    """
    return ask_energy_assistant(question)