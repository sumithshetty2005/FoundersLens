import time
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from src.agents.agent import (
    create_agent_graph, 
    run_agent,
    model_primary_name,
    model_fallback_name
)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "FoundersLens Flask API is running"})

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
        
    idea = data.get('idea')
    industry = data.get('industry')
    custom_api_key = data.get('custom_api_key') 
    extra_context = data.get('extra_context', '')
    
    print(f"\n=== Starting KPI Analysis for: {idea} ({industry}) ===")
    
    master_prompt = f"""
    Analyze the startup idea: '{idea}' in the '{industry}' industry. {extra_context}
    
    Perform a complete business deep-dive:
    1. Research 3 Competitors (Name, Market Share %, Audience, Strategy).
    2. Identify the Whitespace Opportunity.
    3. Calculate Viability Score (0-100).
    4. Define Risk, Roadmap, Business Models (3), Acquisition Channels (3), Target Persona, and SWOT.
    5. Financial Projections (Revenue per user, Min Investment, Break-even, Growth Rate).
    6. Market Trends (4 Key trends).
    7. Demographics Data (Age group distribution percentages).
    
    Output strictly VALID JSON with this structure:
    {{
      "research": {{
          "competitors": [ {{ "name": "...", "market_share": 30, "target_audience": "...", "marketing_strategy": "..." }}, ... ],
          "opportunity": "...",
          "market_trends": ["Trend 1...", "Trend 2...", "Trend 3...", "Trend 4..."],
          "market_share_insight": "Brief insight on competitor dominance..."
      }},
      "strategy": {{
          "viability_score": 85,
          "risk_analysis": "...",
          "roadmap": ["Step 1...", "Step 2...", "Step 3..."],
          "summary": "...",
          "business_models": ["Model: Why...", ...],
          "user_acquisition": ["Channel: How...", ...],
          "target_users": "...",
          "financials": {{
              "revenue_per_user": "$...",
              "min_investment": "$...",
              "break_even": "... months",
              "user_growth_rate": "...%"
          }},
          "demographics": {{
              "age_groups": {{ "18-24": 20, "25-34": 40, "35-44": 25, "45+": 15 }},
              "demographics_insight": "Brief insight on target age group..."
          }},
          "swot": {{ "strengths": [], "weaknesses": [], "opportunities": [], "threats": [] }}
      }}
    }}
    """
    
    json_response = None
    
    if custom_api_key:
        print(f"    [Debug] Received Custom Key: {custom_api_key[:4]}...{custom_api_key[-4:]}")

        original_env_key = os.environ.get("GOOGLE_API_KEY")
        os.environ["GOOGLE_API_KEY"] = custom_api_key

        print(f"--> Invoking Master Analyst Agent (Custom Key: {model_fallback_name})...")
        agent_custom = create_agent_graph(target_model_name=model_fallback_name, target_api_key=custom_api_key)
        
        try:
             json_response = run_agent(agent_custom, master_prompt)
             print("    -> Success with Custom API Key.")
        except Exception as e:
             error_msg = str(e)
             print(f"    -> Error with Custom Key: {error_msg}")
             if "API_QUOTA_EXHAUSTED" in error_msg or "429" in error_msg:
                 return jsonify({"error": "API_QUOTA_EXHAUSTED", "message": "The provided custom API key also failed (Quota/Limit)."}), 429
             else:
                 return jsonify({"error": "Agent Execution Failed with Custom Key", "details": error_msg}), 500
        finally:
             if original_env_key:
                 os.environ["GOOGLE_API_KEY"] = original_env_key
             else:
                 if "GOOGLE_API_KEY" in os.environ:
                     del os.environ["GOOGLE_API_KEY"]

    else:
        print(f"--> Invoking Master Analyst Agent (Primary: {model_primary_name})...")
        agent_primary = create_agent_graph(model_primary_name) 
        
        try:
            json_response = run_agent(agent_primary, master_prompt)
            print("    -> Success with Primary Model.")
        except Exception as e:
            error_msg = str(e)
            if "API_QUOTA_EXHAUSTED" in error_msg:
                print(f"    -> Quota Exceeded on {model_primary_name}. Switching to Fallback...")
                
                print(f"--> Invoking Master Analyst Agent (Fallback: {model_fallback_name})...")
                agent_fallback = create_agent_graph(model_fallback_name)
                try:
                    json_response = run_agent(agent_fallback, master_prompt)
                    print("    -> Success with Fallback Model.")
                except Exception as e2:
                    error_msg_2 = str(e2)
                    if "API_QUOTA_EXHAUSTED" in error_msg_2:
                        print(f"    -> Quota Exceeded on Fallback {model_fallback_name} as well.")
                        return jsonify({
                            "error": "API_QUOTA_EXHAUSTED", 
                            "message": "Daily API Quota Exceeded. Please try adding your own API key."
                        }), 429
                    else:
                        print(f"    -> Error on Fallback: {error_msg_2}")
                        return jsonify({"error": "Agent Execution Failed", "details": error_msg_2}), 500
            else:
                 print(f"    -> Error on Primary: {error_msg}")
                 return jsonify({"error": "Agent Execution Failed", "details": error_msg}), 500

    
    import json
    import re
    
    research_data = {}
    strategy_data = {}
    
    try:
        if not json_response:
             raise ValueError("Empty response from agent")

        match = re.search(r'\{.*\}', json_response, re.DOTALL)
        if match:
            full_data = json.loads(match.group(0))
            research_data = full_data.get('research', {})
            strategy_data = full_data.get('strategy', {})
        else:
            raise ValueError("No valid JSON found in response")
            
    except Exception as e:
        print(f"JSON Parsing Failed: {e}")
        research_data = {
            "competitors": [], 
            "opportunity": "Analysis generated invalid format.",
            "market_trends": [],
            "market_share_insight": "Data unavailable."
        }
        strategy_data = {
            "viability_score": 0, 
            "summary": "Error parsing results.",
            "financials": {},
            "demographics": {"age_groups": {}, "demographics_insight": "Data unavailable."}
        }

    print("\n=== KPI Analysis Complete ===")
    
    return jsonify({
        "idea": idea,
        "industry": industry,
        "research": research_data,
        "strategy": strategy_data
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True, use_reloader=False)