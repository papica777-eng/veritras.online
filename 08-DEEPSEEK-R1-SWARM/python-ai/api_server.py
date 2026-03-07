"""
═══════════════════════════════════════════════════════════════════════════════
🤖 DEEPSEEK-R1-SWARM - FastAPI Server v2.0
═══════════════════════════════════════════════════════════════════════════════

Production-grade API server with:
- DeepSeek R1 test generation
- Stripe subscription management
- Swarm health monitoring
- Proper error handling and validation

@author Dimitar Prodromov / QAntum Empire
"""

import os
import time
import uuid
from typing import List, Optional
from enum import Enum

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import stripe
from openai import OpenAI

# ═══════════════════════════════════════════════════════════════
# Configuration (from .env)
# ═══════════════════════════════════════════════════════════════

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8002"))

if not DEEPSEEK_API_KEY:
    print("⚠️  [CONFIG] DEEPSEEK_API_KEY not set. DeepSeek features will fail.")

stripe.api_key = STRIPE_SECRET_KEY

deepseek = OpenAI(
    api_key=DEEPSEEK_API_KEY,
    base_url="https://api.deepseek.com/v1"
)

# ═══════════════════════════════════════════════════════════════
# FastAPI App
# ═══════════════════════════════════════════════════════════════

app = FastAPI(
    title="🤖 DEEPSEEK-R1-SWARM API v2.0",
    description="AI Agent Swarm for Autonomous Testing — Deca-Guard System",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ═══════════════════════════════════════════════════════════════
# Stripe Plans (cents, not dollars)
# ═══════════════════════════════════════════════════════════════

class PlanTier(str, Enum):
    TEAM = "team"
    PRO = "pro"
    ENTERPRISE = "enterprise"

PLANS = {
    PlanTier.TEAM: {
        "price_id": "price_swarm_team",
        "name": "Team",
        "price_cents": 9900,
        "limits": {"agents": 3, "tests_per_day": 1000},
    },
    PlanTier.PRO: {
        "price_id": "price_swarm_pro",
        "name": "Professional",
        "price_cents": 29900,
        "limits": {"agents": 6, "tests_per_day": 10000},
    },
    PlanTier.ENTERPRISE: {
        "price_id": "price_swarm_enterprise",
        "name": "Enterprise (Deca-Guard)",
        "price_cents": 149900,
        "limits": {"agents": 10, "tests_per_day": -1},
    },
}

# ═══════════════════════════════════════════════════════════════
# Request/Response Models (Pydantic — zero bare dicts)
# ═══════════════════════════════════════════════════════════════

class GenerateTestsRequest(BaseModel):
    target: str = Field(..., min_length=1, description="Testing target (e.g., 'auth-api')")
    context: str = Field(default="", description="Additional context for test generation")
    test_types: List[str] = Field(default_factory=list, description="Types: security, e2e, unit, performance")
    reasoning_depth: str = Field(default="deep", description="deep | medium | shallow")

class GenerateTestsResponse(BaseModel):
    request_id: str
    tests: str
    reasoning_depth: str
    model: str
    duration_ms: int
    tokens_used: Optional[int] = None

class SwarmDeployRequest(BaseModel):
    plan: PlanTier
    agents: List[str] = Field(default_factory=list)

class SubscribeRequest(BaseModel):
    email: str = Field(..., min_length=5)
    plan: PlanTier
    payment_method_id: str = Field(..., min_length=1)

class PlanResponse(BaseModel):
    id: str
    name: str
    price_dollars: float
    limits: dict

class HealthResponse(BaseModel):
    service: str
    status: str
    version: str
    uptime_seconds: float
    deepseek_configured: bool

# ═══════════════════════════════════════════════════════════════
# Startup tracking
# ═══════════════════════════════════════════════════════════════

START_TIME = time.time()

# ═══════════════════════════════════════════════════════════════
# Routes
# ═══════════════════════════════════════════════════════════════

# Complexity: O(1)
@app.get("/", response_model=HealthResponse)
async def root():
    """Service health check."""
    return HealthResponse(
        service="🤖 DEEPSEEK-R1-SWARM",
        status="operational",
        version="2.0.0",
        uptime_seconds=round(time.time() - START_TIME, 2),
        deepseek_configured=bool(DEEPSEEK_API_KEY),
    )


# Complexity: O(1) — single DeepSeek API call
@app.post("/deepseek/generate-tests", response_model=GenerateTestsResponse)
async def generate_tests(request: GenerateTestsRequest):
    """Generate tests using DeepSeek R1 reasoning engine."""
    if not DEEPSEEK_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="DEEPSEEK_API_KEY not configured. Set it in .env"
        )

    start = time.time()
    request_id = str(uuid.uuid4())

    try:
        response = deepseek.chat.completions.create(
            model="deepseek-reasoner",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert QA engineer in the Deca-Guard system. "
                        "Generate comprehensive, runnable test suites. "
                        "Include: reasoning chain, test cases with setup/execution/assertions, "
                        "edge cases, and performance considerations."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"Generate tests for: {request.target}\n"
                        f"Context: {request.context}\n"
                        f"Test Types: {', '.join(request.test_types) if request.test_types else 'comprehensive'}\n"
                        f"Reasoning Depth: {request.reasoning_depth}"
                    ),
                },
            ],
            max_tokens=4096,
        )

        duration_ms = int((time.time() - start) * 1000)
        content = response.choices[0].message.content or "No tests generated"
        tokens = response.usage.total_tokens if response.usage else None

        return GenerateTestsResponse(
            request_id=request_id,
            tests=content,
            reasoning_depth=request.reasoning_depth,
            model="deepseek-reasoner",
            duration_ms=duration_ms,
            tokens_used=tokens,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DeepSeek API error: {str(e)}")


# Complexity: O(1) — validation + response
@app.post("/swarm/deploy")
async def deploy_swarm(request: SwarmDeployRequest):
    """Deploy agent swarm with plan-based limits."""
    plan = PLANS.get(request.plan)
    if not plan:
        raise HTTPException(status_code=400, detail=f"Invalid plan: {request.plan}")

    max_agents = plan["limits"]["agents"]
    requested_agents = request.agents or [
        "SENTINEL", "REAPER", "ORACLE", "GENESIS", "WATCHER",
        "ENGINEER", "COMMS", "TACTICIAN", "EXECUTIONER", "VORTEX"
    ][:max_agents]

    if len(requested_agents) > max_agents:
        raise HTTPException(
            status_code=400,
            detail=f"Plan '{request.plan.value}' allows max {max_agents} agents, requested {len(requested_agents)}"
        )

    return {
        "swarm_id": str(uuid.uuid4()),
        "plan": request.plan.value,
        "agents": requested_agents,
        "limits": plan["limits"],
        "status": "deployed",
    }


# Complexity: O(1)
@app.post("/stripe/subscribe")
async def create_subscription(request: SubscribeRequest):
    """Create Stripe subscription for a plan."""
    if not STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=503,
            detail="STRIPE_SECRET_KEY not configured. Set it in .env"
        )

    plan = PLANS.get(request.plan)
    if not plan:
        raise HTTPException(status_code=400, detail=f"Invalid plan: {request.plan}")

    try:
        customer = stripe.Customer.create(
            email=request.email,
            payment_method=request.payment_method_id,
            invoice_settings={"default_payment_method": request.payment_method_id},
        )

        subscription = stripe.Subscription.create(
            customer=customer.id,
            items=[{"price": plan["price_id"]}],
            expand=["latest_invoice.payment_intent"],
        )

        return {
            "subscription_id": subscription.id,
            "customer_id": customer.id,
            "plan": request.plan.value,
            "status": subscription.status,
        }

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


# Complexity: O(1)
@app.get("/plans")
async def get_plans():
    """List available subscription plans."""
    return {
        "plans": [
            PlanResponse(
                id=plan_id.value,
                name=plan["name"],
                price_dollars=plan["price_cents"] / 100,
                limits=plan["limits"],
            )
            for plan_id, plan in PLANS.items()
        ]
    }


# Complexity: O(1)
@app.get("/swarm/agents")
async def list_agents():
    """List all available agents and their specializations."""
    return {
        "agents": [
            {"name": "SENTINEL", "role": "Perimeter Defense", "speciality": "Auth, input validation, RBAC"},
            {"name": "WATCHER", "role": "Surveillance", "speciality": "Anomaly detection, monitoring"},
            {"name": "REAPER", "role": "Threat Elimination", "speciality": "Penetration testing, OWASP"},
            {"name": "ORACLE", "role": "Predictive Intelligence", "speciality": "Failure forecasting, regression"},
            {"name": "GENESIS", "role": "Code Generation", "speciality": "Test suite creation from source"},
            {"name": "ENGINEER", "role": "Infrastructure", "speciality": "Docker, CI/CD, deployment testing"},
            {"name": "COMMS", "role": "Communication Hub", "speciality": "Message bus, WebSocket, gRPC"},
            {"name": "TACTICIAN", "role": "Strategic Command", "speciality": "Test prioritization, risk analysis"},
            {"name": "EXECUTIONER", "role": "Critical Path", "speciality": "E2E, smoke tests, happy path"},
            {"name": "VORTEX", "role": "Chaos Engineering", "speciality": "Fault injection, resilience"},
        ]
    }


# ═══════════════════════════════════════════════════════════════
# Error Handlers
# ═══════════════════════════════════════════════════════════════

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all error handler — never expose stack traces."""
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)},
    )


# ═══════════════════════════════════════════════════════════════
# Main
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn

    print("╔════════════════════════════════════════════════════════════╗")
    print("║  🤖 DEEPSEEK-R1-SWARM API v2.0                            ║")
    print("║  Deca-Guard System — 10 AI Agents                         ║")
    print(f"║  Port: {API_PORT}                                              ║")
    print("╚════════════════════════════════════════════════════════════╝")
    uvicorn.run(app, host=API_HOST, port=API_PORT)
