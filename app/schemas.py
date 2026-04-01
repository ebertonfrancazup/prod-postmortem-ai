from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class AnalyzeRequest(BaseModel):
    ticket_number: Optional[str] = Field(None, description="Incident ticket number, e.g. CS0005577")
    logs: str = Field(..., description="System logs during the incident")
    transcription: Optional[str] = Field("", description="Chat/Voice transcription of the team during the incident")
    time_range: Optional[str] = Field(None, description="Optional time window of the incident")
    affected_services: Optional[str] = Field(None, description="Optional blast radius / affected services")
    impact: Optional[str] = Field(None, description="Low, Medium, or High impact classification")
    key_stakeholders: Optional[str] = Field(None, description="Optional key stakeholders involved")
    sla_hours: int = Field(2, description="Selected SLA boundary in hours")
    customers: Optional[str] = Field(None, description="Affected customers to highlight")
    slo: Optional[str] = Field(None, description="SLO value, e.g. 99.9%")
    affected_requests_pct: Optional[str] = Field(None, description="Percentage of affected requests, e.g. 98%")
    impacted_journeys: Optional[str] = Field(None, description="Impacted user journeys, e.g. Checkout, Login")
    estimated_loss: Optional[str] = Field(None, description="Estimated revenue or productivity loss, e.g. R$ 50.000")
    language: str = Field("pt-br", description="Report language: 'pt-br' or 'en'")
    proactive_incident: Optional[bool] = Field(None, description="Whether the incident was proactively detected")
    images: List[str] = Field(default=[], description="Base64 encoded images (e.g. Datadog screenshots)")

class ExecutiveSummary(BaseModel):
    impact: str = Field(..., description="Impact of the incident")
    root_cause: str = Field(..., description="Root cause of the incident")
    resolution: str = Field(..., description="How it was resolved")

class Metrics(BaseModel):
    incident_title: str = Field(..., description="Short title, e.g. Checkout Service Outage")
    impact: str = Field(..., description="Event Impact, e.g. P1 - Crítico, P2 - Alto, or P3 - Médio")
    total_downtime: str = Field(..., description="User friendly string, e.g., 59 minutes")
    downtime_minutes: int = Field(..., description="Total downtime purely in minutes as integer")
    service_status: str = Field(..., description="Current status, e.g. Resolved")
    affected_customers: str = Field(default="N/A", description="Customers affected (or 'Internal')")
    
    affected_users: Optional[str] = Field(None, description="E.g. 4,892 (or null if not found)")
    error_count: Optional[str] = Field(None, description="Amount of errors, e.g. 15,312 (or null)")
    main_service: Optional[str] = Field(None, description="Main service affected e.g. checkout-api (or null)")
    infra_slo: Optional[str] = Field(None, description="Infra SLO e.g. 99.9% (or null)")

class CriticalEvent(BaseModel):
    timestamp: str = Field(..., description="Time of the event, e.g., 09:00:00")
    event: str = Field(..., description="Short title of the event")
    detail: Optional[str] = Field(None, description="Longer description with technical context, commands, evidence, or links")

class IncidentReport(BaseModel):
    executive_summary: ExecutiveSummary
    metrics: Metrics
    timeline: List[CriticalEvent]
    next_steps: List[str] = Field(..., description="Bullet points of suggested next steps")
    token_usage: Optional[Dict[str, int]] = Field(None, description="Token usage stats")
