import json
import os
from pathlib import Path

# ── Where is our data file? ──────────────────────────────────────────────────
# Path goes up one level from /backend to the project root, then into /data
DATA_PATH = Path(__file__).parent.parent / "data" / "mock_meter_data.json"


def load_meter_data() -> dict:
    """
    Reads the mock Eneco smart meter JSON file and returns it as a Python dict.
    This is the raw data — everything else builds on top of this.
    """
    with open(DATA_PATH, "r") as f:
        return json.load(f)


def get_household_info() -> dict:
    """
    Returns basic household details:
    - address, EV info, solar panel status, monthly budget
    """
    data = load_meter_data()
    return data["household"]


def get_tariffs() -> dict:
    """
    Returns the energy tariff structure:
    - peak vs off-peak hours
    - price per kWh for each
    - solar feed-in rate
    """
    data = load_meter_data()
    return data["tariffs"]


def get_monthly_summary() -> dict:
    """
    Returns the monthly summary:
    - total consumption, cost, solar generation
    - EV charging totals
    - whether the household is over budget
    - pre-calculated insights
    """
    data = load_meter_data()
    return data["monthly_summary"]


def get_hourly_readings(date: str = None) -> list:
    """
    Returns hourly readings for a specific date.
    If no date given, returns the first available day.
    
    Each reading contains:
    - hour, kwh used, tariff type, solar generated, EV charging on/off
    """
    data = load_meter_data()
    readings = data["daily_readings"]

    if date:
        # Find the specific day requested
        for day in readings:
            if day["date"] == date:
                return day["hourly_readings"]
        return []  # Date not found

    # Default: return first available day
    return readings[0]["hourly_readings"]


def get_daily_summary(date: str = None) -> dict:
    """
    Returns full day summary including:
    - total consumption, solar, EV, gas
    - appliance breakdown
    - hourly readings
    """
    data = load_meter_data()
    readings = data["daily_readings"]

    if date:
        for day in readings:
            if day["date"] == date:
                return day
        return {}

    return readings[0]


def get_peak_hours_usage() -> list:
    """
    Filters hourly readings to return ONLY peak hour data.
    Useful for showing the user when they're spending the most.
    """
    hourly = get_hourly_readings()
    return [h for h in hourly if h["tariff"] == "peak"]


def get_off_peak_hours_usage() -> list:
    """
    Filters hourly readings to return ONLY off-peak hour data.
    Useful for recommending when to shift appliance usage.
    """
    hourly = get_hourly_readings()
    return [h for h in hourly if h["tariff"] == "off_peak"]


def get_ev_charging_hours() -> list:
    """
    Returns only the hours when EV was charging.
    Used to analyse charging patterns and suggest optimisation.
    """
    hourly = get_hourly_readings()
    return [h for h in hourly if h["ev_charging"] is True]


def get_context_for_ai() -> str:
    """
    THE MOST IMPORTANT FUNCTION.
    
    Builds a single clean text string combining all household data.
    This is what we feed into the AI as context — the RAG document.
    
    Think of it as: converting structured JSON → readable summary
    that Claude can reason about.
    """
    household = get_household_info()
    tariffs = get_tariffs()
    summary = get_monthly_summary()
    daily = get_daily_summary()
    ev_hours = get_ev_charging_hours()

    context = f"""
HOUSEHOLD INFORMATION:
- Address: {household['address']}
- Has Solar Panels: {household['has_solar_panels']}
- Has Electric Vehicle: {household['has_ev']} ({household['ev_model']})
- EV Battery Capacity: {household['ev_battery_capacity_kwh']} kWh
- Monthly Budget: €{household['monthly_budget_eur']}

ENERGY TARIFFS:
- Peak Hours: {tariffs['peak_hours']} at €{tariffs['peak_rate_eur_per_kwh']}/kWh
- Off-Peak Hours: {tariffs['off_peak_hours']} at €{tariffs['off_peak_rate_eur_per_kwh']}/kWh
- Solar Feed-in Rate: €{tariffs['solar_feed_in_rate_eur_per_kwh']}/kWh

MONTHLY SUMMARY ({summary['month']}):
- Total Consumption: {summary['total_kwh_consumed']} kWh
- Solar Generated: {summary['total_solar_generated_kwh']} kWh
- EV Charging Total: {summary['total_ev_charged_kwh']} kWh
- Gas Used: {summary['total_gas_m3']} m³
- Total Cost: €{summary['total_cost_eur']}
- Monthly Budget: €{summary['budget_eur']}
- Over Budget By: €{summary['over_budget_eur']}
- Peak Usage Hour: {summary['peak_usage_hour']}
- Average Daily Usage: {summary['avg_daily_kwh']} kWh

DAILY BREAKDOWN ({daily['date']}):
- Heating: {daily['appliance_breakdown']['heating_kwh']} kWh
- Washing Machine: {daily['appliance_breakdown']['washing_machine_kwh']} kWh
- Dishwasher: {daily['appliance_breakdown']['dishwasher_kwh']} kWh
- EV Charging: {daily['appliance_breakdown']['ev_charging_kwh']} kWh

EV CHARGING PATTERN:
- EV charged during these hours: {[h['hour'] for h in ev_hours]}
- All EV charging happened at off-peak rate (€{tariffs['off_peak_rate_eur_per_kwh']}/kWh) ✓

KEY INSIGHTS:
{chr(10).join(f"- {insight}" for insight in summary['insights'])}
"""
    return context.strip()