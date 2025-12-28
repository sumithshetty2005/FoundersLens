from google.adk.agents import LlmAgent
from google.adk.models.google_llm import Gemini
from google.adk.tools.agent_tool import AgentTool
from google.adk.tools.google_search_tool import google_search
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
import os
import asyncio
import aiohttp
from dotenv import load_dotenv

# --- Monkey Patch for aiohttp compatibility ---
if not hasattr(aiohttp, 'ClientConnectorDNSError'):
    print("Applying monkey-patch for aiohttp.ClientConnectorDNSError")
    aiohttp.ClientConnectorDNSError = aiohttp.ClientConnectorError

# --- Configuration ---
# Reduced internal retries as we handle fallback logic manually in server.py
retry_config = types.HttpRetryOptions(
    attempts=1, 
    http_status_codes=[500, 503, 504], 
)

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    # Fallback to hard error if absolutely no key
    raise ValueError("GOOGLE_API_KEY is missing. Please check your .env file.")
else:
    print(f"API Key Loaded: ...{api_key[-5:]}")

# Define Models
# Primary: Lite (Cheaper/Faster, Strict Quota)
model_primary_name = "gemini-2.5-flash-lite"
model_primary = Gemini(model=model_primary_name, api_key=api_key, retry_options=retry_config)

# Fallback: Flash (Standard, Higher Quota)
model_fallback_name = "gemini-2.5-flash"
model_fallback = Gemini(model=model_fallback_name, api_key=api_key, retry_options=retry_config)

# --- Shared Services ---
session_service = InMemorySessionService()

# --- Helper Function (The "Cover Function") ---
def run_agent(agent_instance, prompt_text, max_retries=1): 
    # NOTE: max_retries essentially deprecated here in favor of manual fallback logic in server.py
    # But we keep the signature for compatibility if needed.
    
    async def _run():
        full_text = ""
        try:
            # 1. Create Session
            session = await session_service.create_session(app_name="FoundersLens", user_id="default_user")
            
            # 2. Initialize Runner
            runner = Runner(
                agent=agent_instance,
                app_name="FoundersLens",
                session_service=session_service
            )
            
            # 3. Create Input
            user_input = types.Content(role="user", parts=[types.Part(text=prompt_text)])
            
            # 4. Execute and Collect Output
            async for event in runner.run_async(
                user_id="default_user", 
                session_id=session.id, 
                new_message=user_input
            ):
                if hasattr(event, 'content') and event.content:
                    for part in event.content.parts:
                        if part.text:
                            full_text += part.text
            
            if not full_text:
                raise ValueError("Agent returned empty response")
            
            return full_text

        except Exception as e:
            error_str = str(e)
            print(f"    [Agent Error] {agent_instance.name}: {error_str}")
            
            # Re-raise 429/Quota errors so server can catch them and switch models
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                 raise RuntimeError("API_QUOTA_EXHAUSTED") from e
            
            # Aiohttp glitch
            if "ClientConnectorDNSError" in error_str:
                 print("    -> Intermittent aiohttp error. (Caller should retry)")
                 raise RuntimeError("CONNECTION_ERROR") from e

            raise e

    try:
        return asyncio.run(_run())
    except RuntimeError as re:
        # Pass specifically raised RuntimeErrors up
        raise re
    except Exception as e:
        # Catch-all for other async execution errors
        raise e

# --- Shared Tools ---
google_search_agent = LlmAgent(
    name="google_search_agent",
    model=model_primary,
    description="Searches for information using Google search",
    instruction="Use the google_search tool to find information.",
    tools=[google_search],
)

# --- Master Agent Factory ---
# We need a factory to create the agent with a specific model on the fly
def create_master_agent(model_to_use):
    return LlmAgent(
        name="master_analyst_agent",
        model=model_to_use,
        instruction="""
        Role: Senior Startup Analyst.
        
        You are an all-in-one branding, market research, and strategy expert.
        Your goal is to analyze a startup idea and output a comprehensive JSON report.
        
        Process:
        1. Understand the idea context.
        2. Use your knowledge (and Search if absolutely necessary) to identify Competitors and Opportunities.
        3. Formulate a Business Strategy (Model, Acquisition, Risks).
        4. Output EVERYTHING in a single valid JSON structure.
        
        Constraint: Output ONLY JSON. No preamble.
        """,
        tools=[AgentTool(agent=google_search_agent)],
    )

# Instantiate Default (Primary) for generic imports if needed
master_analyst_agent = create_master_agent(model_primary)
