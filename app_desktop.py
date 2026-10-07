import os
import sys
import time
import re
import json
import io
import streamlit as st
import pymupdf
import google.genai as genai
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from pptx import Presentation
from pptx.util import Inches as PptxInches, Pt as PptxPt
from pptx.dml.color import RGBColor as PptxRGBColor

# Page Configuration
st.set_page_config(
    page_title="ForensicReview Workstation",
    page_icon="⚖️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom High-End Styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.2rem;
        font-weight: 800;
        color: #0f172a;
        margin-bottom: 0.1rem;
        letter-spacing: -0.02em;
    }
    .sub-header {
        font-size: 1.05rem;
        color: #475569;
        margin-bottom: 1.2rem;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 6px;
    }
    .stTabs [data-baseweb="tab"] {
        height: 46px;
        white-space: pre-wrap;
        background-color: #f1f5f9;
        border-radius: 8px 8px 0px 0px;
        padding-left: 16px;
        padding-right: 16px;
        font-weight: 600;
        font-size: 0.88rem;
        color: #334155;
    }
    .stTabs [aria-selected="true"] {
        background-color: #1e3a8a !important;
        color: #ffffff !important;
    }
    .metric-card {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 12px;
    }
</style>
""", unsafe_allow_html=True)

# Load local API key if present
def get_default_api_key():
    env_local = os.path.join(os.path.dirname(__file__), ".env.local")
    if os.path.exists(env_local):
        with open(env_local, "r") as f:
            for line in f:
                if line.startswith("GEMINI_API_KEY="):
                    return line.strip().split("=", 1)[1]
    return os.environ.get("GEMINI_API_KEY", "")

DEFAULT_API_KEY = get_default_api_key()

# Session State Initialization
if "api_key" not in st.session_state:
    st.session_state.api_key = DEFAULT_API_KEY
if "analysis_sections" not in st.session_state:
    st.session_state.analysis_sections = None
if "current_dossier" not in st.session_state:
    st.session_state.current_dossier = None
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []
if "file_name" not in st.session_state:
    st.session_state.file_name = ""
if "pending_bytes" not in st.session_state:
    st.session_state.pending_bytes = None
if "pending_name" not in st.session_state:
    st.session_state.pending_name = None

# Sidebar Controls
with st.sidebar:
    st.markdown("### ⚖️ ForensicReview")
    st.caption("Native High-Capacity Medicolegal Workstation")
    st.divider()
    
    st.markdown("**1. Retained Expert Stance**")
    role = st.radio(
        "Select Your Retained Role:",
        ["PLAINTIFF EXPERT (Injured Party)", "DEFENSE EXPERT (Retaining Insurer/Counsel)"],
        index=0,
        help="Calibrates the causation opinion, WPI 30.17 analysis, and deposition cross-examination strategy."
    )
    is_plaintiff = "PLAINTIFF" in role
    
    st.divider()
    st.markdown("**2. Gemini API Key**")
    api_key_input = st.text_input(
        "API Key:",
        value=st.session_state.api_key,
        type="password",
        help="Google Gemini API key."
    )
    if api_key_input != st.session_state.api_key:
        st.session_state.api_key = api_key_input
        
    st.divider()
    if st.session_state.analysis_sections:
        if st.button("🔄 Clear Active Case / New File", use_container_width=True):
            st.session_state.analysis_sections = None
            st.session_state.current_dossier = None
            st.session_state.chat_history = []
            st.session_state.file_name = ""
            st.session_state.pending_bytes = None
            st.session_state.pending_name = None
            st.rerun()

# Workspace Header
st.markdown('<div class="main-header">Forensic Medicolegal Review Workstation</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-header">Direct Native Ingestion for 1,000+ Page Medical Legal Records & Multi-Gigabyte Hospital Files</div>', unsafe_allow_html=True)

# Native High-Speed PDF Text Extractor
def extract_high_yield_dossier(pdf_bytes, file_name, max_pages=140):
    t0 = time.time()
    doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
    total_pages = len(doc)
    
    keywords = [
        'MRI', 'CT', 'IMPRESSION', 'DISC', 'HERNIATION', 'SURGERY', 'COLLISION', 
        'ACCIDENT', 'MOTOR DEFICIT', 'RADICULOPATHY', 'OPERATIVE', 'DISCHARGE', 
        'EMERGENCY', 'SPINE', 'PHYSICAL THERAPY', 'ELECTROMYOGRAPHY', 'EMG', 
        'NUMBNESS', 'WEAKNESS', 'LUMBAR', 'CERVICAL', 'S1', 'L5', 'C5', 'C6', 
        'EXAM', 'MYELOPATHY', 'FUSION', 'NEUROSURGERY', 'ANESTHESIA', 'ARTHRODESIS'
    ]
    
    pages_data = []
    for i in range(total_pages):
        text = doc[i].get_text()
        if len(text.strip()) > 30:
            upper = text.upper()
            score = sum(1 for kw in keywords if kw in upper)
            pages_data.append((i + 1, score, text))
            
    # Sort by clinical relevance score
    pages_data.sort(key=lambda x: x[1], reverse=True)
    # Take top N pages and restore chronological ordering
    top_pages = sorted(pages_data[:max_pages], key=lambda x: x[0])
    
    dossier = f"=== CLINICAL RECORD DOSSIER: {file_name} ===\n"
    dossier += f"Total File Pages: {total_pages} | High-Yield Forensic Clinical Pages Selected: {len(top_pages)}\n\n"
    
    for page_num, score, text in top_pages:
        dossier += f"[RECORD PAGE {page_num}]\n{text.strip()}\n\n"
        
    duration = time.time() - t0
    return dossier, total_pages, len(top_pages), duration

# Structure Extraction Prompt
def analyze_dossier(dossier_text, is_plaintiff, api_key):
    client = genai.Client(api_key=api_key)
    stance_text = "PLAINTIFF EXPERT (Injured Party)" if is_plaintiff else "DEFENSE EXPERT (Retaining Insurer/Counsel)"
    stance_focus = (
        "Focus on proving collision proximate causation, traumatic aggravation of pre-existing degenerative conditions under Washington Pattern Jury Instruction WPI 30.17 Eggshell Skull doctrine, objective MRI/EMG correlates, and countering defense degenerative assertions."
        if is_plaintiff else
        "Focus on proving pre-existing chronic natural degenerative spondylosis, minor delta-V mechanics, intervening domestic falls, treatment gaps, lack of acute traumatic spinal disruption, and countering plaintiff claims."
    )
    
    system_prompt = f"""
You are a Board-Certified Neurosurgeon and premier Forensic Medicolegal Causation Expert in Washington State.
You are retained as the: {stance_text}.
{stance_focus}

Analyze the provided clinical records and return your complete findings structured with these EXACT 6 section delimiter tags:

<<<SECTION:SUMMARY>>>
[Complete Clinical Summary: Patient Full Name, DOB, Age, Gender, Date of Injury/Incident, Comprehensive History of Present Illness (HPI) & Initial Trauma Mechanism, Chronological Diagnostic Imaging Review with exact dates and impressions, Physical Examination Highlights Across Time, and Full Treatment Course/Interventions]

<<<SECTION:CAUSATION>>>
[Formal Causation Opinion & Standard of Care: Definitive causation opinion stated "Within a reasonable degree of medical probability", Biomechanical causation & vector analysis, Detailed Washington State Pattern Jury Instruction 30.17 (WPI 30.17 Eggshell Skull / Traumatic Aggravation) Analysis, Distinction between compensable conditions vs non-compensable/intervening conditions, and Prognosis/MMI/Future care]

<<<SECTION:TIMELINE>>>
[Detailed Chronological Timeline: Markdown table of distinct encounters with columns: Date (YYYY-MM-DD) | Facility & Provider | Clinical Event Summary | Exact Verbatim Record Excerpt | Significance (CRITICAL vs ROUTINE)]

<<<SECTION:SLIDES>>>
[PowerPoint Courtroom Presentation Slides: 8-10 high-impact slides. For each slide include Slide Title, Medical Date, Clinic/Doctor, Exact Verbatim Chart Quote, and Why this note is crucial evidence in court]

<<<SECTION:LITERATURE>>>
[Top 5 Peer-Reviewed Literature Articles: Exactly 5 high-impact medical journal citations (Spine, JNS, NEJM, Lancet) with Authors, Title, Journal, Year, and Forensic Relevance supporting your causation conclusions]

<<<SECTION:DEPOSITION>>>
[Deposition Preparation & Cross-Examination Attacks: Retained Role Strategy Roadmap ({stance_text}), 5 Golden Rules for the Witness Stand, and 4-6 Specific Cross-Examination Trap Questions Opposing Counsel Will Ask with: Opposing Counsel Attack Angle, Likely Trap Questions, Scripted High-Level Neurosurgical Response for Dr. Mohit, The Trap to Avoid, and Specific Record Citations in this file]
"""

    response = client.models.generate_content(
        model='gemini-3.8-flash',
        contents=dossier_text + "\n\n" + system_prompt
    )
    
    text = response.text
    
    # Parse sections
    sections = {
        "summary": "No summary generated.",
        "causation": "No causation opinion generated.",
        "timeline": "No timeline generated.",
        "slides": "No slides generated.",
        "literature": "No literature generated.",
        "deposition": "No deposition prep generated.",
        "full_text": text
    }
    
    tags = [
        ("summary", "<<<SECTION:SUMMARY>>>"),
        ("causation", "<<<SECTION:CAUSATION>>>"),
        ("timeline", "<<<SECTION:TIMELINE>>>"),
        ("slides", "<<<SECTION:SLIDES>>>"),
        ("literature", "<<<SECTION:LITERATURE>>>"),
        ("deposition", "<<<SECTION:DEPOSITION>>>")
    ]
    
    for i, (key, tag) in enumerate(tags):
        if tag in text:
            start = text.find(tag) + len(tag)
            end = len(text)
            for _, next_tag in tags[i+1:]:
                if next_tag in text:
                    end = text.find(next_tag)
                    break
            sections[key] = text[start:end].strip()
        else:
            # Fallback if model didn't use tags exactly
            sections[key] = text
            
    return sections

# Word Document Generator
def create_docx_report(sections, file_name, role_name):
    doc = Document()
    title = doc.add_heading("FORENSIC MEDICHOLEGAL CAUSATION REPORT", 0)
    title.alignment = 1
    
    doc.add_paragraph(f"Matter: {file_name}")
    doc.add_paragraph(f"Retained Expert Role: {role_name}")
    doc.add_paragraph(f"Jurisdiction: Washington State (WPI 30.17 Standard)")
    doc.add_paragraph(f"Date of Report: {time.strftime('%B %d, %Y')}")
    doc.add_paragraph("=" * 60)
    
    headings = [
        ("1. CLINICAL RECORDS SUMMARY", sections["summary"]),
        ("2. CAUSATION OPINION & WASHINGTON WPI 30.17 ANALYSIS", sections["causation"]),
        ("3. CHRONOLOGICAL MEDICAL TIMELINE", sections["timeline"]),
        ("4. COURTROOM PRESENTATION SLIDES OUTLINE", sections["slides"]),
        ("5. PEER-REVIEWED LITERATURE SUPPORT", sections["literature"]),
        ("6. DEPOSITION PREPARATION & CROSS-EXAMINATION STRATEGY", sections["deposition"])
    ]
    
    for h_title, content in headings:
        doc.add_heading(h_title, level=1)
        doc.add_paragraph(content)
        doc.add_page_break()
        
    bio = io.BytesIO()
    doc.save(bio)
    bio.seek(0)
    return bio.getvalue()

# PowerPoint Slide Deck Generator
def create_pptx_deck(sections, file_name):
    prs = Presentation()
    # Title Slide
    title_slide_layout = prs.slide_layouts[0]
    slide = prs.slides.add_slide(title_slide_layout)
    slide.shapes.title.text = f"Courtroom Exhibits: {file_name}"
    slide.placeholders[1].text = f"Forensic Neurosurgical Evidence Deck\nWashington State Superior Court\n{time.strftime('%B %Y')}"
    
    # Slides parsing
    slides_text = sections.get("slides", "")
    slide_blocks = re.split(r"(?:Slide\s*\d+:|###\s*Slide\s*\d+:)", slides_text, flags=re.IGNORECASE)
    
    bullet_slide_layout = prs.slide_layouts[1]
    for block in slide_blocks:
        block_clean = block.strip()
        if not block_clean:
            continue
        lines = [line.strip() for line in block_clean.split("\n") if line.strip()]
        if not lines:
            continue
        
        slide_title = lines[0].replace("**", "").replace("#", "").strip()[:60]
        content_lines = lines[1:] if len(lines) > 1 else [lines[0]]
        
        slide = prs.slides.add_slide(bullet_slide_layout)
        slide.shapes.title.text = slide_title
        
        tf = slide.placeholders[1].text_frame
        tf.word_wrap = True
        tf.text = content_lines[0].replace("**", "")
        for line in content_lines[1:7]:
            p = tf.add_paragraph()
            p.text = line.replace("**", "")
            
    bio = io.BytesIO()
    prs.save(bio)
    bio.seek(0)
    return bio.getvalue()

# UI Workflow: File Ingestion vs Dossier Review
if not st.session_state.analysis_sections:
    st.markdown("### 📁 Select or Drop Patient Medical Records")
    
    col_a, col_b = st.columns([1, 1])
    with col_a:
        st.markdown("**Option A: Instant Desktop Benchmark Test**")
        if st.button("📄 Load Farthing.pdf from Desktop (1,185 Pages / 83.6 MB)", use_container_width=True, type="secondary"):
            farthing_path = r"C:\Users\mohal\OneDrive\Desktop\Farthing.pdf"
            if os.path.exists(farthing_path):
                with open(farthing_path, "rb") as f:
                    st.session_state.pending_bytes = f.read()
                st.session_state.pending_name = "Farthing.pdf"
                st.rerun()
            else:
                st.error(f"File not found at {farthing_path}")
                
    with col_b:
        st.markdown("**Option B: Drag & Drop Any Case PDF**")
        uploaded_file = st.file_uploader(
            "Upload any medical chart (no page or size limits):",
            type=["pdf"],
            help="High-capacity native ingestion handles 2,000+ page records."
        )
        if uploaded_file is not None:
            st.session_state.pending_bytes = uploaded_file.read()
            st.session_state.pending_name = uploaded_file.name
            st.rerun()

    if st.session_state.pending_bytes and st.session_state.pending_name:
        target_name = st.session_state.pending_name
        target_bytes = st.session_state.pending_bytes
        mb_size = len(target_bytes) / (1024 * 1024)
        
        st.success(f"✓ Ready for Analysis: **{target_name}** ({mb_size:.1f} MB)")
        
        analyze_btn = st.button(
            f"🚀 Execute Forensic Analysis as { 'PLAINTIFF EXPERT' if is_plaintiff else 'DEFENSE EXPERT' }", 
            type="primary", 
            use_container_width=True
        )
        
        if analyze_btn:
            if not st.session_state.api_key:
                st.error("Please enter a valid Google Gemini API Key in the sidebar.")
            else:
                with st.status("Analyzing Medical Records with Native Engine...", expanded=True) as status:
                    st.write("1. High-speed native parsing and clinical scoring across all pages...")
                    dossier, total_pages, selected_pages, parse_sec = extract_high_yield_dossier(target_bytes, target_name)
                    st.write(f"✓ Scored all {total_pages:,} pages in {parse_sec:.2f} seconds. Synthesized {selected_pages} high-impact clinical pages.")
                    
                    st.write(f"2. Synthesizing full courtroom dossier with Gemini 3.8 Flash...")
                    try:
                        sections = analyze_dossier(dossier, is_plaintiff, st.session_state.api_key)
                        st.session_state.analysis_sections = sections
                        st.session_state.current_dossier = dossier
                        st.session_state.file_name = target_name
                        st.session_state.pending_bytes = None
                        st.session_state.pending_name = None
                        status.update(label="Forensic Analysis Complete!", state="complete", expanded=False)
                        st.rerun()
                    except Exception as e:
                        st.error(f"Analysis failed: {str(e)}")
                        status.update(label="Analysis Failed", state="error")

else:
    # ACTIVE CASE WORKSTATION
    sections = st.session_state.analysis_sections
    file_name = st.session_state.file_name
    
    # Header Bar with Export Buttons
    col_info, col_word, col_ppt = st.columns([3, 1, 1])
    with col_info:
        st.markdown(f"**Case:** `{file_name}` | **Retained Role:** `{role}`")
    with col_word:
        docx_bytes = create_docx_report(sections, file_name, role)
        st.download_button(
            label="📥 Export Word (.docx)",
            data=docx_bytes,
            file_name=f"{file_name.replace('.pdf', '')}_Forensic_Report.docx",
            mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            use_container_width=True
        )
    with col_ppt:
        pptx_bytes = create_pptx_deck(sections, file_name)
        st.download_button(
            label="📊 Export Slides (.pptx)",
            data=pptx_bytes,
            file_name=f"{file_name.replace('.pdf', '')}_Courtroom_Slides.pptx",
            mime="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            use_container_width=True
        )
        
    st.divider()
    
    # 7 Workstation Tabs
    tab1, tab2, tab3, tab4, tab5, tab6, tab7 = st.tabs([
        "1. Clinical Summary",
        "2. Causation & WPI 30.17",
        "3. Timeline of Events",
        "4. Courtroom Slides",
        "5. Literature Support",
        "6. Deposition Prep",
        "💬 Copilot Q&A (Ask File)"
    ])
    
    with tab1:
        st.markdown("### 📋 Deliverable 1: Comprehensive Clinical Records Summary")
        st.markdown(sections.get("summary", sections.get("full_text", "")))
        
    with tab2:
        st.markdown("### ⚖️ Deliverable 2: Causation Opinion & Washington WPI 30.17 Analysis")
        st.info("Formulated within a reasonable degree of medical probability under Washington State law.")
        st.markdown(sections.get("causation", sections.get("full_text", "")))
        
    with tab3:
        st.markdown("### 📅 Deliverable 3: Detailed Chronological Medical Timeline")
        st.markdown(sections.get("timeline", sections.get("full_text", "")))
        
    with tab4:
        st.markdown("### 🖥️ Deliverable 4: Courtroom PowerPoint Presentation Exhibits")
        st.markdown(sections.get("slides", sections.get("full_text", "")))
        
    with tab5:
        st.markdown("### 📚 Deliverable 5: Peer-Reviewed Medical Literature Support")
        st.markdown(sections.get("literature", sections.get("full_text", "")))
        
    with tab6:
        st.markdown("### 🛡️ Deliverable 6: Deposition Preparation & Cross-Examination Attacks")
        st.markdown(sections.get("deposition", sections.get("full_text", "")))
        
    with tab7:
        st.markdown("### 💬 Copilot Q&A: Inquire Directly on the File")
        st.caption("Ask specific forensic questions about surgery compensability, cross-examination traps, or chart citations.")
        
        for q, a in st.session_state.chat_history:
            with st.chat_message("user"):
                st.markdown(q)
            with st.chat_message("assistant"):
                st.markdown(a)
                
        user_question = st.chat_input("Ask any question about this patient file (e.g. 'Are the surgeries related to the claim?')...")
        if user_question:
            st.session_state.chat_history.append((user_question, "...Consulting file..."))
            with st.chat_message("user"):
                st.markdown(user_question)
                
            with st.chat_message("assistant"):
                with st.spinner("Analyzing file and prior findings with Gemini 3.8 Flash..."):
                    try:
                        client = genai.Client(api_key=st.session_state.api_key)
                        q_prompt = f"""
You are a Board-Certified Neurosurgeon and Washington Medicolegal Expert.
Case Name: {st.session_state.file_name}
Retained Expert Role: {role}

Below is the Clinical Summary & Causation Opinion from the case dossier:
{sections.get('summary', '')[:3000]}

{sections.get('causation', '')[:3000]}

User Question:
"{user_question}"

Provide a direct, authoritative, legally precise neurosurgical answer with specific record citations, WPI 30.17 analysis, compensability determination, and witness stand recommendations.
"""
                        resp = client.models.generate_content(
                            model='gemini-3.8-flash',
                            contents=q_prompt
                        )
                        ans = resp.text
                        st.markdown(ans)
                        st.session_state.chat_history[-1] = (user_question, ans)
                    except Exception as q_err:
                        err_str = f"Error: {str(q_err)}"
                        st.error(err_str)
                        st.session_state.chat_history[-1] = (user_question, err_str)
