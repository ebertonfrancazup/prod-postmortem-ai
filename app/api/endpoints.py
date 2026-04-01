import logging
from fastapi import APIRouter, HTTPException, Response
from app.schemas import AnalyzeRequest, IncidentReport
from app.services import process_incident_data, ReportGenerator

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/analyze", response_model=IncidentReport)
async def analyze_endpoint(request: AnalyzeRequest):
    """
    POST /analyze
    Receives logs and chat transcription, calls the LLM, 
    and returns the structured JSON report.
    """
    report = await process_incident_data(request)
    return report

@router.post("/export-pdf")
async def export_pdf_endpoint(request_data: dict):
    # We must rebuild the generator passing the original request (SLA, Customers) and the generated Report
    original_req = AnalyzeRequest(**request_data['request'])
    report = IncidentReport(**request_data['report'])
    
    generator = ReportGenerator(original_req)
    try:
        pdf_bytes = generator.generate_pdf(report)
        ticket = original_req.ticket_number or ''
        safe_title = report.metrics.incident_title.replace(' ', '_').replace('/', '')
        prefix = f"Post-Mortem_{ticket}_" if ticket else "Post-Mortem_"
        return Response(content=pdf_bytes, media_type="application/pdf", headers={
            "Content-Disposition": f"attachment; filename={prefix}{safe_title}.pdf"
        })
    except Exception as e:
        logger.error(f"Error generating PDF: {e}")
        raise HTTPException(status_code=500, detail="Error generating PDF report")

@router.post("/export-docx")
async def export_docx_endpoint(request_data: dict):
    from app.services import DocxGenerator
    original_req = AnalyzeRequest(**request_data['request'])
    report = IncidentReport(**request_data['report'])
    
    generator = DocxGenerator(original_req)
    try:
        docx_bytes = generator.generate_docx(report)
        ticket = original_req.ticket_number or ''
        safe_title = report.metrics.incident_title.replace(' ', '_').replace('/', '')
        prefix = f"Post-Mortem_{ticket}_" if ticket else "Post-Mortem_"
        return Response(content=docx_bytes, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", headers={
            "Content-Disposition": f"attachment; filename={prefix}{safe_title}.docx"
        })
    except Exception as e:
        logger.error(f"Error generating DOCX: {e}")
        raise HTTPException(status_code=500, detail="Error generating DOCX document")
