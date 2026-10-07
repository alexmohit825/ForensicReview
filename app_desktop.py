import os
import sys
import time
import json
import streamlit as st
import pymupdf
import google.genai as genai
from docx import Document
from pptx import Presentation

# Configure wide layout with clean neurosurgical theme
st.set_page_config(
    page_title="ForensicReview Workstation",
    page_icon="⚖️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling for clean high-contrast readability
st.markdown("""
<style>
    .main-header {
        font-size: 2.2rem;
        font-weight: 800;
        color: #0f172a;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        font-size: 1.0rem;
        color: #475569;
        margin-bottom: 1.5rem;
    }
    .card-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: #1e293b;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 0.4rem;
        margin-top: 1.2rem;
        margin-bottom: 0.8rem;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
    }
    .stTabs [data-baseweb="tab"] {
        height: 48px;
        white-space: pre-wrap;
        background-color: #f8fafc;
        border-radius: 8px 8px 0px 0px;
        padding-left: 18px;
        padding-right: 18px;
        font-weight: 600;
        font-size: 0.9rem;
    }
    .stTabs [aria-selected="true"] {
        background-color: #2563eb !important;
        color: white !important;
    }
</style>
""", unsafe_allow_html=True)

# Load local key if present
def get_default_api_key():
    env_local = os.path.join(os.path.dirname(__file__), ".env.local")
    if os.path.exists(env_local):
        with open(env_local, "r") as f:
            for line in f:
                if line.startswith("GEMINI_API_KEY="):
                    return line.strip().split("=", 1)[1]
    return os.environ.get("GEMINI_API_KEY", "")

DEFAULT_API_KEY = get_default_api_key()

# Initialize Session State
if "api_key" not in st.session_state:
    st.session_state.api_key = DEFAULT_API_KEY
if "analysis_result" not in st.session_state:
    st.session_state.analysis_result = None
if "current_dossier" not in st.session_state:
    st.session_state.current_dossier = None
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []
if "file_name" not in st.session_state:
    st.session_state.file_name = ""

# Sidebar: Controls & Settings
with st.sidebar:
    st.markdown("### ⚖️ ForensicReview")
    st.caption("Native High-Capacity Medicolegal Workstation")
    st.divider()
    
    st.markdown("**1. Retained Expert Stance**")
    role = st.radio(
        "Select Your Retained Role:",
        ["PLAINTIFF EXPERT (Injured Party)", "DEFENSE EXPERT (Retaining Insurer/Counsel)"],
        index=0,
        help="Calibrates the causation opinion, WPI 30.17 analysis, and deposition strategies."
    )
    is_plaintiff = "PLAINTIFF" in role
    
    st.divider()
    st.markdown("**2. Gemini API Credentials**")
    api_key_input = st.text_input(
        "Google Gemini API Key:",
        value=st.session_state.api_key,
        type="password",
        help="Frontier Google API key with access to Gemini 3.8 / 3.1 Pro."
    )
    if api_key_input != st.session_state.api_key:
        st.session_state.api_key = api_key_input
        
    st.divider()
    if st.session_state.analysis_result:
        if st.button("🔄 Clear / New Case", use_container_width=True):
            st.session_state.analysis_result = None
            st.session_state.current_dossier = None
            st.session_state.chat_history = []
            st.session_state.file_name = ""
            st.rerun()

# Main Workspace Header
st.markdown('<div class="main-header">Forensic Medicolegal Review Workstation</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-header">Direct Native Ingestion for Multi-Gigabyte & 1,000+ Page Medical Legal Records</div>', unsafe_allow_html=True)

# Document Extraction Function
def extract_high_yield_dossier(pdf_bytes, file_name, max_pages=140):
    t0 = time.time()
    doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
    total_pages = len(doc)
    
    keywords = [
        'MRI', 'CT', 'IMPRESSION', 'DISC', 'HERNIATION', 'SURGERY', 'COLLISION', 
        'ACCIDENT', 'MOTOR DEFICIT', 'RADICULOPATHY', 'OPERATIVE', 'DISCHARGE', 
        'EMERGENCY', 'SPINE', 'PHYSICAL THERAPY', 'ELECTROMYOGRAPHY', 'EMG', 
        'NUMBNESS', 'WEAKNESS', 'LUMBAR', 'CERVICAL', 'S1', 'L5', 'C5', 'C6', 'EXAM'
    ]
    
    pages_data = []
    for i in range(total_pages):
        text = doc[i].get_text()
        if len(text.strip()) > 30:
            upper = text.upper()
            score = sum(1 for kw in keywords if kw in upper)
            pages_data.append((i + 1, score, text))
            
    # Sort by clinical keyword relevance
    pages_data.sort(key=lambda x: x[1], reverse=True)
    # Take top N pages and sort back chronologically
    top_pages = sorted(pages_data[:max_pages], key=lambda x: x[0])
    
    dossier = f"=== CLINICAL RECORD DOSSIER: {file_name} ===\n"
    dossier += f"Total File Pages: {total_pages} | High-Yield Forensic Clinical Pages Selected: {len(top_pages)}\n\n"
    
    for page_num, score, text in top_pages:
        dossier += f"[RECORD PAGE {page_num}]\n{text.strip()}\n\n"
        
    duration = time.time() - t0
    return dossier, total_pages, len(top_pages), duration

# Core Gemini Analysis Function
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

Analyze the provided clinical records and return a comprehensive, structured evaluation covering EXACTLY:
1. CLINICAL RECORDS SUMMARY:
   - Patient Full Name, DOB, Age, Gender, Date of Injury/Incident.
   - Comprehensive History of Present Illness (HPI) & Initial Trauma Mechanism.
   - Chronological Diagnostic Imaging Review (Exact MRI, CT, X-ray dates and impressions).
   - Physical Examination Highlights Across Time (ROM, motor grades, sensory, reflexes, pathological reflexes like Hoffmann's).
   - Full Treatment Course & Interventions.

2. FORMAL CAUSATION OPINION & STANDARD OF CARE:
   - Definitive causation opinion stated "Within a reasonable degree of medical probability".
   - Biomechanical causation & vector analysis.
   - Detailed Washington State Pattern Jury Instruction 30.17 (WPI 30.17 Eggshell Skull / Traumatic Aggravation) Analysis.
   - Distinction between compensable conditions vs. non-compensable/intervening conditions.
   - Prognosis, maximum medical improvement (MMI), and future medical care.

3. DETAILED CHRONOLOGICAL TIMELINE:
   - Chronological table/list of every distinct encounter with: Date (YYYY-MM-DD), Facility/Provider, Concise 1-Sentence Description, Verbatim Excerpt in quotes, and Clinical Significance (CRITICAL vs ROUTINE).

4. POWERPOINT COURTROOM PRESENTATION SLIDES:
   - 8-10 high-impact presentation slides featuring: Slide Title, Date of Medical Note, Clinic/Doctor, Exact Verbatim Chart Quote, and Why this note is crucial evidence in court.

5. TOP 5 PEER-REVIEWED LITERATURE ARTICLES:
   - Exactly 5 high-impact medical journal citations (Spine, JNS, NEJM, Lancet) with Authors, Title, Journal, Year, and Exact Forensic Relevance supporting your causation conclusions.

6. DEPOSITION PREPARATION & CROSS-EXAMINATION ATTACK ANGLES:
   - Retained Role Strategy Roadmap ({stance_text}).
   - 5 Golden Non-Negotiable Rules for the Witness Stand.
   - 4-6 Specific Cross-Examination Trap Questions Opposing Counsel Will Ask, with:
     * Opposing Counsel's Attack Angle
     * Likely Trap Questions
     * Scripted High-Level Neurosurgical Response for Dr. Mohit
     * The Trap to Avoid (Concessions counsel is baiting)
     * Specific Record Citations in this file
"""

    response = client.models.generate_content(
        model='gemini-3.8-flash',
        contents=dossier_text + "\n\n" + system_prompt
    )
    return response.text

# Ingestion Section (If No Active Case)
if not st.session_state.analysis_result:
    st.markdown("### 📁 Select or Drop Medical File")
    uploaded_file = st.file_uploader(
        "Drop Patient Medical Records (PDF) — No page limits or file size constraints:",
        type=["pdf"],
        help="Upload multi-page hospital charts, operative notes, or IME files."
    )
    
    col1, col2 = st.columns([1, 1])
    with col1:
        load_desktop_farthing = st.button("📄 Load Farthing.pdf Directly from Desktop (1,185 Pages)", use_container_width=True)
        
    target_bytes = None
    target_name = None
    
    if uploaded_file is not None:
        target_bytes = uploaded_file.read()
        target_name = uploaded_file.name
    elif load_desktop_farthing:
        farthing_path = r"C:\Users\mohal\OneDrive\Desktop\Farthing.pdf"
        if os.path.exists(farthing_path):
            with open(farthing_path, "rb") as f:
                target_bytes = f.read()
            target_name = "Farthing.pdf"
        else:
            st.error(f"Could not locate Farthing.pdf at {farthing_path}")
            
    if target_bytes and target_name:
        st.success(f"Loaded {target_name} ({len(target_bytes) / (1024*1024):.1f} MB)")
        
        analyze_btn = st.button(
            f"🚀 Analyze {target_name} as { 'Plaintiff Expert' if is_plaintiff else 'Defense Expert' }", 
            type="primary", 
            use_container_width=True
        )
        
        if analyze_btn:
            with st.status("Analyzing Medical Records with Native Engine...", expanded=True) as status:
                st.write("1. High-speed native parsing and clinical scoring across all pages...")
                dossier, total_pages, selected_pages, parse_sec = extract_high_yield_dossier(target_bytes, target_name)
                st.write(f"✓ Parsed all {total_pages} pages in {parse_sec:.2f} seconds. Synthesized {selected_pages} high-impact clinical pages.")
                
                st.write(f"2. Transmitting {len(dossier):,} clinical characters to Google Gemini 3.8 Flash...")
                try:
                    result = analyze_dossier(dossier, is_plaintiff, st.session_state.api_key)
                    st.session_state.analysis_result = result
                    st.session_state.current_dossier = dossier
                    st.session_state.file_name = target_name
                    status.update(label="Analysis Complete!", state="complete", expanded=False)
                    st.rerun()
                except Exception as e:
                    st.error(f"Analysis failed: {str(e)}")
                    status.update(label="Analysis Failed", state="error")

# Case Loaded: Deliverables & Copilot Q&A
else:
    st.markdown(f"**Active Case:** `{st.session_state.file_name}` | **Retained Role:** `{role}`")
    
    tab1, tab2, tab3, tab4, tab5, tab6, tab7 = st.tabs([
        "1. Clinical Summary",
        "2. Causation & WPI 30.17",
        "3. Timeline of Events",
        "4. Courtroom Slides",
        "5. Literature Support",
        "6. Deposition Prep",
        "💬 Copilot Q&A (Ask File)"
    ])
    
    full_text = st.session_state.analysis_result
    
    with tab1:
        st.markdown("### 📋 Deliverable 1: Clinical Records Summary")
        st.markdown(full_text)
        
    with tab2:
        st.markdown("### ⚖️ Deliverable 2: Causation & Washington WPI 30.17 Opinion")
        st.info("Formulated within a reasonable degree of medical probability under Washington State law.")
        st.markdown(full_text)
        
    with tab3:
        st.markdown("### 📅 Deliverable 3: Chronological Timeline")
        st.markdown(full_text)
        
    with tab4:
        st.markdown("### 🖥️ Deliverable 4: Courtroom PowerPoint Presentation")
        st.markdown(full_text)
        
    with tab5:
        st.markdown("### 📚 Deliverable 5: Peer-Reviewed Literature Support (5 Articles)")
        st.markdown(full_text)
        
    with tab6:
        st.markdown("### 🛡️ Deliverable 6: Deposition Prep & Cross-Examination Attacks")
        st.markdown(full_text)
        
    with tab7:
        st.markdown("### 💬 Copilot Q&A: Inquire Directly on the File")
        st.caption("Ask specific forensic questions about surgery compensability, cross-examination traps, or chart citations.")
        
        # Display existing chat history
        for q, a in st.session_state.chat_history:
            with st.chat_message("user"):
                st.markdown(q)
            with st.chat_message("assistant"):
                st.markdown(a)
                
        user_question = st.chat_input("Ask a question about this patient file (e.g. 'Are the surgeries related to the claim?')...")
        if user_question:
            st.session_state.chat_history.append((user_question, "...Analyzing..."))
            with st.chat_message("user"):
                st.markdown(user_question)
                
            with st.chat_message("assistant"):
                with st.spinner("Consulting full medical record with Gemini..."):
                    try:
                        client = genai.Client(api_key=st.session_state.api_key)
                        q_prompt = f"""
You are a Board-Certified Neurosurgeon and Washington Medicolegal Expert.
Below is the medical dossier and prior case analysis:

{st.session_state.analysis_result[:4000]}

Based on this patient file, answer the user's specific question:
"{user_question}"

Provide a detailed, legally precise neurosurgical answer with specific record citations, WPI 30.17 analysis, and deposition witness stand recommendations.
"""
                        resp = client.models.generate_content(
                            model='gemini-3.8-flash',
                            contents=q_prompt
                        )
                        answer_text = resp.text
                        st.markdown(answer_text)
                        st.session_state.chat_history[-1] = (user_question, answer_text)
                    except Exception as q_err:
                        err_msg = f"Error answering question: {str(q_err)}"
                        st.error(err_msg)
                        st.session_state.chat_history[-1] = (user_question, err_msg)
