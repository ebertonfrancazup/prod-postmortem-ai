document.addEventListener('DOMContentLoaded', () => {
    // State
    let selectedImpact = null;
    let selectedLanguage = "pt-br";
    let proactiveIncident = false;
    let attachedFilesText = "";
    let attachedImagesBase64 = []; // Stores DataURL strings for Gemini Vision

    // DOM Elements
    const impactPills = document.querySelectorAll('.impact-pill');
    const dropZone = document.getElementById('dropZone');
    const fileUpload = document.getElementById('fileUpload');
    const fileList = document.getElementById('fileList');
    const logsInput = document.getElementById('logsInput');

    const timeRange = document.getElementById('timeRange');
    const affectedServices = document.getElementById('affectedServices');
    const keyStakeholders = document.getElementById('keyStakeholders');

    const generateBtn = document.getElementById('generateBtn');
    const btnText = document.getElementById('btnText');
    const errorBox = document.getElementById('errorBox');
    const previewBox = document.getElementById('previewBox');

    // Impact selection
    impactPills.forEach(pill => {
        pill.addEventListener('click', () => {
            impactPills.forEach(p => p.classList.remove('selected'));
            pill.classList.add('selected');
            selectedImpact = pill.dataset.impact;
        });
    });

    // Language toggle
    document.querySelectorAll('.toggle-pill[data-lang]').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.toggle-pill[data-lang]').forEach(p => p.classList.remove('selected'));
            pill.classList.add('selected');
            selectedLanguage = pill.dataset.lang;
        });
    });

    // Proactive toggle
    document.querySelectorAll('.toggle-pill[data-proactive]').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.toggle-pill[data-proactive]').forEach(p => p.classList.remove('selected'));
            pill.classList.add('selected');
            proactiveIncident = pill.dataset.proactive === 'true';
        });
    });

    // File Drag & Drop
    dropZone.addEventListener('click', () => fileUpload.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFiles(e.dataTransfer.files);
        }
    });

    fileUpload.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFiles(e.target.files);
        }
    });

    function handleFiles(files) {
        Array.from(files).forEach(file => {
            const ext = file.name.split('.').pop().toLowerCase();

            // Add pill to UI
            const pill = document.createElement('div');
            pill.className = 'file-item';
            pill.textContent = file.name;
            fileList.appendChild(pill);

            if (file.type.startsWith('image/')) {
                // Handle Images (Base64)
                pill.textContent = file.name + " (Reading Image...)";
                const reader = new FileReader();
                reader.onload = (e) => {
                    attachedImagesBase64.push(e.target.result);
                    pill.textContent = file.name + " (Vision Ready)";
                    pill.style.background = "rgba(16, 185, 129, 0.2)";
                };
                reader.readAsDataURL(file);
            } else if (['txt', 'log', 'json', 'csv'].includes(ext)) {
                // Read text files
                pill.textContent = file.name + " (Reading Text...)";
                const reader = new FileReader();
                reader.onload = (e) => {
                    attachedFilesText += `\n\n--- FILE: ${file.name} ---\n${e.target.result}`;
                    pill.textContent = file.name + " (Text Ready)";
                    pill.style.background = "rgba(16, 185, 129, 0.2)";
                };
                reader.readAsText(file);
            } else {
                // Unsupported / Fallback
                setTimeout(() => {
                    pill.textContent += " (Unsupported Type)";
                    pill.style.background = "rgba(239, 68, 68, 0.2)"; // red error tint
                }, 500);
            }
        });
    }

    // Clipboard paste support — Ctrl+V images directly into the textarea
    logsInput.addEventListener('paste', (e) => {
        const items = e.clipboardData && e.clipboardData.items;
        if (!items) return;

        for (const item of items) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                if (!file) continue;

                const name = `clipboard_${Date.now()}.png`;
                const pill = document.createElement('div');
                pill.className = 'file-item';
                pill.textContent = name + " (Reading Image...)";
                fileList.appendChild(pill);

                const reader = new FileReader();
                reader.onload = (ev) => {
                    attachedImagesBase64.push(ev.target.result);
                    pill.textContent = name + " (Vision Ready)";
                    pill.style.background = "rgba(16, 185, 129, 0.2)";
                };
                reader.readAsDataURL(file);
            }
        }
    });

    const slaHours = document.getElementById('slaHours');
    const customersInput = document.getElementById('customers');

    // API Call
    generateBtn.addEventListener('click', async () => {
        const logs = logsInput.value.trim() + attachedFilesText;
        if (!logs) {
            showError("Please provide some logs or attach a file.");
            return;
        }

        const payload = {
            ticket_number: document.getElementById('ticketNumber').value.trim() || null,
            logs: logs,
            transcription: "",
            time_range: timeRange.value.trim() || null,
            affected_services: affectedServices.value.trim() || null,
            impact: selectedImpact,
            key_stakeholders: keyStakeholders.value.trim() || null,
            sla_hours: parseInt(slaHours.value, 10),
            customers: customersInput.value.trim() || null,
            slo: document.getElementById('sloInput').value.trim() || null,
            affected_requests_pct: document.getElementById('affectedRequestsPct').value.trim() || null,
            impacted_journeys: document.getElementById('impactedJourneys').value.trim() || null,
            estimated_loss: document.getElementById('estimatedLoss').value.trim() || null,
            language: selectedLanguage,
            proactive_incident: proactiveIncident,
            images: attachedImagesBase64
        };

        try {
            setLoading(true);
            errorBox.style.display = "none";
            previewBox.style.display = "none";

            // Step 1: Analyze
            const analyzeRes = await fetch('/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!analyzeRes.ok) {
                const errData = await analyzeRes.json();
                throw new Error(errData.detail || 'Failed to analyze logs.');
            }

            const reportJson = await analyzeRes.json();

            // Store globally so buttons can access them
            window.lastPayload = payload;
            window.lastReport = reportJson;

            // Populate preview fields with LLM data
            document.getElementById('prev_title').value = reportJson.metrics.incident_title || '';
            document.getElementById('prev_impact').value = reportJson.metrics.impact || '';
            document.getElementById('prev_downtime').value = reportJson.metrics.total_downtime || '';
            document.getElementById('prev_status').value = reportJson.metrics.service_status || '';
            document.getElementById('prev_customers').value = payload.customers || reportJson.metrics.affected_customers || '';
            document.getElementById('prev_slo').value = payload.slo || '';
            document.getElementById('prev_affected_pct').value = payload.affected_requests_pct || '';
            document.getElementById('prev_journeys').value = payload.impacted_journeys || '';
            document.getElementById('prev_loss').value = payload.estimated_loss || '';
            document.getElementById('prev_language').value = payload.language || 'pt-br';
            document.getElementById('prev_proactive').value = payload.proactive_incident ? 'true' : 'false';
            document.getElementById('prev_exec_impact').value = reportJson.executive_summary.impact || '';
            document.getElementById('prev_root_cause').value = reportJson.executive_summary.root_cause || '';
            document.getElementById('prev_resolution').value = reportJson.executive_summary.resolution || '';
            document.getElementById('prev_next_steps').value = (reportJson.next_steps || []).join('\n');
            document.getElementById('prev_timeline').value = (reportJson.timeline || [])
                .map(e => {
                    let line = `${e.timestamp} - ${e.event}`;
                    if (e.detail) line += `\n  ${e.detail}`;
                    return line;
                }).join('\n');

            // Show telemetry
            if (reportJson.token_usage) {
                let tElem = document.getElementById('telemetryInfo');
                if (!tElem) {
                    tElem = document.createElement('p');
                    tElem.id = 'telemetryInfo';
                    tElem.style.fontSize = '12px';
                    tElem.style.color = '#9ca3af';
                    tElem.style.textAlign = 'center';
                    tElem.style.marginTop = '10px';
                    previewBox.appendChild(tElem);
                }
                tElem.innerHTML = `Gemini Telemetry: <b>${reportJson.token_usage.total_tokens.toLocaleString()}</b> tokens total (${reportJson.token_usage.prompt_tokens.toLocaleString()} prompt / ${reportJson.token_usage.candidates_tokens.toLocaleString()} output)`;
            }

            previewBox.style.display = "block";
            previewBox.scrollIntoView({ behavior: 'smooth' });

        } catch (err) {
            showError(err.message);
        } finally {
            setLoading(false);
        }
    });

    const exampleBtn = document.getElementById('exampleBtn');
    if (exampleBtn) {
        exampleBtn.addEventListener('click', async () => {
            try {
                const res = await fetch('/static/example_logs.txt');
                if (!res.ok) throw new Error("Could not load example logs.");
                const text = await res.text();

                // Populate forms according to the example spec
                logsInput.value = text;
                slaHours.value = "2";
                customersInput.value = "Hawk Bank";

                // Select High Impact visually and functionally
                impactPills.forEach(p => p.classList.remove('selected'));
                const highPill = Array.from(impactPills).find(p => p.dataset.impact === "High");
                if (highPill) {
                    highPill.classList.add('selected');
                    selectedImpact = "High";
                }
            } catch (err) {
                showError("Erro: " + err.message);
            }
        });
    }

    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const downloadDocxBtn = document.getElementById('downloadDocxBtn');

    function getEditedReport() {
        // Build report from the preview fields (user may have edited them)
        const rawTimeline = document.getElementById('prev_timeline').value.trim();
        const timeline = [];
        const entries = rawTimeline.split(/\n(?=\S)/); // split on lines that start with non-space (new event)
        for (const entry of entries) {
            if (!entry.trim()) continue;
            const lines = entry.split('\n');
            const mainLine = lines[0];
            const detailLines = lines.slice(1).map(l => l.trim()).filter(l => l);
            const sep = mainLine.indexOf(' - ');
            const ts = sep > -1 ? mainLine.substring(0, sep).trim() : '';
            const ev = sep > -1 ? mainLine.substring(sep + 3).trim() : mainLine.trim();
            const detail = detailLines.length > 0 ? detailLines.join(' ') : null;
            timeline.push({ timestamp: ts, event: ev, detail });
        }

        const report = JSON.parse(JSON.stringify(window.lastReport));
        report.metrics.incident_title = document.getElementById('prev_title').value;
        report.metrics.impact = document.getElementById('prev_impact').value;
        report.metrics.total_downtime = document.getElementById('prev_downtime').value;
        report.metrics.service_status = document.getElementById('prev_status').value;
        report.metrics.affected_customers = document.getElementById('prev_customers').value;
        report.executive_summary.impact = document.getElementById('prev_exec_impact').value;
        report.executive_summary.root_cause = document.getElementById('prev_root_cause').value;
        report.executive_summary.resolution = document.getElementById('prev_resolution').value;
        report.next_steps = document.getElementById('prev_next_steps').value.trim().split('\n').filter(l => l.trim());
        report.timeline = timeline;

        // Also update customers in the payload to match preview edits
        const payload = JSON.parse(JSON.stringify(window.lastPayload));
        payload.customers = document.getElementById('prev_customers').value || null;
        payload.slo = document.getElementById('prev_slo').value || null;
        payload.affected_requests_pct = document.getElementById('prev_affected_pct').value || null;
        payload.impacted_journeys = document.getElementById('prev_journeys').value || null;
        payload.estimated_loss = document.getElementById('prev_loss').value || null;
        payload.language = document.getElementById('prev_language').value;
        payload.proactive_incident = document.getElementById('prev_proactive').value === 'true';
        return { request: payload, report };
    }

    async function handleDownload(endpoint, ext, btn) {
        if (!window.lastPayload || !window.lastReport) return;

        btn.disabled = true;
        const originalText = btn.textContent;
        btn.textContent = "Downloading...";

        try {
            const edited = getEditedReport();
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(edited)
            });
            if (!res.ok) throw new Error(`Failed to generate ${ext.toUpperCase()}.`);
            
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            const ticket = edited.request.ticket_number || '';
            const safeTitle = edited.report.metrics && edited.report.metrics.incident_title
                ? edited.report.metrics.incident_title.replace(/\s+/g, '_')
                : 'post_mortem';
            const prefix = ticket ? `Post-Mortem_${ticket}_` : 'Post-Mortem_';
            a.download = `${prefix}${safeTitle}.${ext}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            showError(err.message);
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    }

    if (downloadPdfBtn) downloadPdfBtn.addEventListener('click', () => handleDownload('/export-pdf', 'pdf', downloadPdfBtn));
    if (downloadDocxBtn) downloadDocxBtn.addEventListener('click', () => handleDownload('/export-docx', 'docx', downloadDocxBtn));

    function setLoading(isLoading) {
        generateBtn.disabled = isLoading;
        btnText.textContent = isLoading ? "Generating Report... (This may take a minute)" : "Generate Professional Incident Report";
    }

    function showError(msg) {
        errorBox.textContent = msg;
        errorBox.style.display = "block";
    }
});
