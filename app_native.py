#!/usr/bin/env python3
"""
ForensicReview — Standalone Native Windows Medicolegal Workstation
Board-Certified Neurosurgical Causation Engine (WPI 30.17)
Zero local server daemon | Standalone Windows Application
"""

import os
import sys
import time
import glob
import re
import io
import ctypes
import pymupdf
import google.genai as genai
from docx import Document
from pptx import Presentation

# Set Windows AppUserModelID so Windows taskbar displays the custom icon
try:
    ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID("mohit.forensicreview.workstation.1.0")
except Exception:
    pass

from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLabel, QFileDialog, QRadioButton, QButtonGroup,
    QTabWidget, QTextEdit, QProgressBar, QSplitter, QListWidget,
    QLineEdit, QMessageBox, QGroupBox, QFrame
)
from PyQt6.QtCore import Qt, QThread, pyqtSignal
from PyQt6.QtGui import QFont, QIcon, QColor, QPalette

# Load local API key if present
def get_default_api_key():
    env_local = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env.local")
    if os.path.exists(env_local):
        try:
            with open(env_local, "r") as f:
                for line in f:
                    if line.startswith("GEMINI_API_KEY="):
                        return line.strip().split("=", 1)[1]
        except Exception:
            pass
    return os.environ.get("GEMINI_API_KEY", "")

# Sequential Memory-Safe Clinical Extractor
def extract_consolidated_dossier(file_paths, max_total_pages=150, progress_callback=None):
    all_pages = []
    grand_total_pages = 0
    total_files = len(file_paths)
    
    keywords = [
        'MRI', 'CT', 'IMPRESSION', 'DISC', 'HERNIATION', 'SURGERY', 'COLLISION', 
        'ACCIDENT', 'MOTOR DEFICIT', 'RADICULOPATHY', 'OPERATIVE', 'DISCHARGE', 
        'EMERGENCY', 'SPINE', 'PHYSICAL THERAPY', 'ELECTROMYOGRAPHY', 'EMG', 
        'NUMBNESS', 'WEAKNESS', 'LUMBAR', 'CERVICAL', 'S1', 'L5', 'C5', 'C6', 
        'EXAM', 'MYELOPATHY', 'FUSION', 'NEUROSURGERY', 'ANESTHESIA', 'ARTHRODESIS'
    ]
    
    for idx, fp in enumerate(file_paths):
        fname = os.path.basename(fp)
        if progress_callback:
            progress_callback(int((idx / total_files) * 40), f"Scanning {fname}...")
        
        doc = pymupdf.open(fp)
        doc_pages = len(doc)
        grand_total_pages += doc_pages
        for i in range(doc_pages):
            txt = doc[i].get_text()
            if len(txt.strip()) > 30:
                up = txt.upper()
                sc = sum(1 for kw in keywords if kw in up)
                all_pages.append({
                    'file': fname,
                    'page': i + 1,
                    'score': sc,
                    'text': txt.strip()
                })
        doc.close()
        
    all_pages.sort(key=lambda x: x['score'], reverse=True)
    selected_pages = all_pages[:max_total_pages]
    
    dossier = "=== CONSOLIDATED CLINICAL RECORD DOSSIER ===\n"
    dossier += f"Total Documents: {total_files} | Aggregate Pages: {grand_total_pages:,} | High-Yield Forensic Pages: {len(selected_pages)}\n\n"
    for p in selected_pages:
        dossier += f"[SOURCE DOCUMENT: {p['file']} | PAGE {p['page']}]\n{p['text']}\n\n"
        
    return dossier, grand_total_pages, len(selected_pages)

# Background Analysis Worker Thread
class AnalysisWorker(QThread):
    progress = pyqtSignal(int, str)
    finished = pyqtSignal(dict, str)
    error = pyqtSignal(str)

    def __init__(self, file_paths, is_plaintiff, api_key):
        super().__init__()
        self.file_paths = file_paths
        self.is_plaintiff = is_plaintiff
        self.api_key = api_key

    def run(self):
        try:
            self.progress.emit(5, "Reading case files from local hard drive...")
            dossier, total_p, sel_p = extract_consolidated_dossier(
                self.file_paths,
                progress_callback=lambda pct, msg: self.progress.emit(pct, msg)
            )
            
            self.progress.emit(45, f"Scored {total_p:,} pages. Synthesized {sel_p} clinical pages. Contacting Gemini 3.8 Flash...")
            
            client = genai.Client(api_key=self.api_key)
            stance_text = "PLAINTIFF EXPERT (Injured Party)" if self.is_plaintiff else "DEFENSE EXPERT (Retaining Insurer/Counsel)"
            stance_focus = (
                "Focus on proving collision proximate causation, traumatic aggravation of pre-existing degenerative conditions under Washington Pattern Jury Instruction WPI 30.17 Eggshell Skull doctrine, objective MRI/EMG correlates, and countering defense degenerative assertions."
                if self.is_plaintiff else
                "Focus on proving pre-existing chronic natural degenerative spondylosis, minor delta-V mechanics, intervening domestic falls, treatment gaps, lack of acute traumatic spinal disruption, and countering plaintiff claims."
            )
            
            system_prompt = f"""
You are a Board-Certified Neurosurgeon and premier Forensic Medicolegal Causation Expert in Washington State.
You are retained as the: {stance_text}.
{stance_focus}

Analyze the provided clinical records from all ingested source documents and return your complete findings structured with these EXACT 6 section delimiter tags:

<<<SECTION:SUMMARY>>>
[Complete Clinical Summary: Patient Full Name, DOB, Age, Gender, Date of Injury/Incident, Comprehensive History of Present Illness (HPI) & Initial Trauma Mechanism, Chronological Diagnostic Imaging Review with exact dates and impressions across all documents, Physical Examination Highlights Across Time, and Full Treatment Course/Interventions]

<<<SECTION:CAUSATION>>>
[Formal Causation Opinion & Standard of Care: Definitive causation opinion stated "Within a reasonable degree of medical probability", Biomechanical causation & vector analysis, Detailed Washington State Pattern Jury Instruction 30.17 (WPI 30.17 Eggshell Skull / Traumatic Aggravation) Analysis, Distinction between compensable conditions vs non-compensable/intervening conditions, and Prognosis/MMI/Future care]

<<<SECTION:TIMELINE>>>
[Detailed Chronological Timeline: Unified Markdown table of distinct encounters across all ingested files with columns: Date (YYYY-MM-DD) | Source File & Page | Facility & Provider | Clinical Event Summary | Exact Verbatim Record Excerpt | Significance (CRITICAL vs ROUTINE)]

<<<SECTION:SLIDES>>>
[PowerPoint Courtroom Presentation Slides: 8-10 high-impact slides. For each slide include Slide Title, Medical Date, Source Document, Clinic/Doctor, Exact Verbatim Chart Quote, and Why this note is crucial evidence in court]

<<<SECTION:LITERATURE>>>
[Top 5 Peer-Reviewed Literature Articles: Exactly 5 high-impact medical journal citations (Spine, JNS, NEJM, Lancet) with Authors, Title, Journal, Year, and Forensic Relevance supporting your causation conclusions]

<<<SECTION:DEPOSITION>>>
[Deposition Preparation & Cross-Examination Attacks: Retained Role Strategy Roadmap ({stance_text}), 5 Golden Rules for the Witness Stand, and 4-6 Specific Cross-Examination Trap Questions Opposing Counsel Will Ask with: Opposing Counsel Attack Angle, Likely Trap Questions, Scripted High-Level Neurosurgical Response for Dr. Mohit, The Trap to Avoid, and Specific Record Citations from the source files]
"""
            self.progress.emit(60, "Gemini 3.8 Flash synthesizing 6 courtroom deliverables...")
            resp = client.models.generate_content(
                model='gemini-3.8-flash',
                contents=dossier + "\n\n" + system_prompt
            )
            
            text = resp.text
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
                    sections[key] = text
                    
            self.progress.emit(100, "Analysis complete!")
            self.finished.emit(sections, dossier)
        except Exception as e:
            self.error.emit(str(e))

# Document Exporters
def create_docx_report(sections, file_name, role_name, save_path):
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
    doc.save(save_path)

def create_pptx_deck(sections, file_name, save_path):
    prs = Presentation()
    slide = prs.slides.add_slide(prs.slide_layouts[0])
    slide.shapes.title.text = f"Courtroom Exhibits: {file_name}"
    slide.placeholders[1].text = f"Forensic Neurosurgical Evidence Deck\nWashington State Superior Court\n{time.strftime('%B %Y')}"
    
    slides_text = sections.get("slides", "")
    slide_blocks = re.split(r"(?:Slide\s*\d+:|###\s*Slide\s*\d+:)", slides_text, flags=re.IGNORECASE)
    
    for block in slide_blocks:
        block_clean = block.strip()
        if not block_clean:
            continue
        lines = [line.strip() for line in block_clean.split("\n") if line.strip()]
        if not lines:
            continue
        slide_title = lines[0].replace("**", "").replace("#", "").strip()[:60]
        content_lines = lines[1:] if len(lines) > 1 else [lines[0]]
        
        slide = prs.slides.add_slide(prs.slide_layouts[1])
        slide.shapes.title.text = slide_title
        tf = slide.placeholders[1].text_frame
        tf.word_wrap = True
        tf.text = content_lines[0].replace("**", "")
        for line in content_lines[1:7]:
            p = tf.add_paragraph()
            p.text = line.replace("**", "")
    prs.save(save_path)

# Main Native Desktop Application Window
class ForensicWorkstationApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("ForensicReview — Native Medicolegal Workstation")
        self.resize(1300, 850)
        
        icon_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app_icon.ico")
        if os.path.exists(icon_path):
            self.setWindowIcon(QIcon(icon_path))
            
        self.selected_files = []
        self.analysis_sections = None
        self.current_dossier = None
        self.api_key = get_default_api_key()
        
        self.init_ui()

    def init_ui(self):
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        main_layout = QHBoxLayout(main_widget)
        main_layout.setContentsMargins(12, 12, 12, 12)
        main_layout.setSpacing(12)
        
        # LEFT SIDEBAR
        sidebar = QWidget()
        sidebar.setFixedWidth(320)
        sidebar_layout = QVBoxLayout(sidebar)
        sidebar_layout.setContentsMargins(8, 8, 8, 8)
        sidebar_layout.setSpacing(10)
        
        title_lbl = QLabel("⚖️ ForensicReview")
        title_lbl.setFont(QFont("Segoe UI", 16, QFont.Weight.Bold))
        title_lbl.setStyleSheet("color: #0f172a;")
        sidebar_layout.addWidget(title_lbl)
        
        sub_lbl = QLabel("Native Neurosurgical Causation Engine")
        sub_lbl.setFont(QFont("Segoe UI", 9))
        sub_lbl.setStyleSheet("color: #64748b; margin-bottom: 8px;")
        sidebar_layout.addWidget(sub_lbl)
        
        # Retained Role Box
        role_group = QGroupBox("1. Retained Role")
        role_group.setFont(QFont("Segoe UI", 9, QFont.Weight.Bold))
        role_layout = QVBoxLayout(role_group)
        self.radio_plaintiff = QRadioButton("PLAINTIFF EXPERT")
        self.radio_defense = QRadioButton("DEFENSE EXPERT")
        self.radio_plaintiff.setChecked(True)
        role_layout.addWidget(self.radio_plaintiff)
        role_layout.addWidget(self.radio_defense)
        sidebar_layout.addWidget(role_group)
        
        # File/Folder Selection Box
        files_group = QGroupBox("2. Select Records")
        files_group.setFont(QFont("Segoe UI", 9, QFont.Weight.Bold))
        files_layout = QVBoxLayout(files_group)
        
        self.btn_select_files = QPushButton("📄 Select PDF File(s)...")
        self.btn_select_files.clicked.connect(self.select_files_dialog)
        files_layout.addWidget(self.btn_select_files)
        
        self.btn_select_folder = QPushButton("📂 Select Entire Case Folder...")
        self.btn_select_folder.clicked.connect(self.select_folder_dialog)
        files_layout.addWidget(self.btn_select_folder)
        
        sidebar_layout.addWidget(files_group)
        
        # API Key Box
        api_group = QGroupBox("3. Google Gemini API Key")
        api_group.setFont(QFont("Segoe UI", 9, QFont.Weight.Bold))
        api_layout = QVBoxLayout(api_group)
        self.api_input = QLineEdit(self.api_key)
        self.api_input.setEchoMode(QLineEdit.EchoMode.Password)
        api_layout.addWidget(self.api_input)
        sidebar_layout.addWidget(api_group)
        
        # Action Buttons
        self.btn_analyze = QPushButton("🚀 Run Forensic Analysis")
        self.btn_analyze.setFont(QFont("Segoe UI", 11, QFont.Weight.Bold))
        self.btn_analyze.setStyleSheet(
            "background-color: #1e3a8a; color: white; padding: 12px; border-radius: 6px;"
        )
        self.btn_analyze.clicked.connect(self.start_analysis)
        sidebar_layout.addWidget(self.btn_analyze)
        
        # Export Buttons
        self.btn_export_word = QPushButton("📥 Export Word (.docx)")
        self.btn_export_word.setEnabled(False)
        self.btn_export_word.clicked.connect(self.export_word)
        sidebar_layout.addWidget(self.btn_export_word)
        
        self.btn_export_pptx = QPushButton("📊 Export Slides (.pptx)")
        self.btn_export_pptx.setEnabled(False)
        self.btn_export_pptx.clicked.connect(self.export_pptx)
        sidebar_layout.addWidget(self.btn_export_pptx)
        
        sidebar_layout.addStretch()
        main_layout.addWidget(sidebar)
        
        # RIGHT MAIN PANEL
        right_panel = QWidget()
        right_layout = QVBoxLayout(right_panel)
        right_layout.setContentsMargins(4, 4, 4, 4)
        
        # File Queue Info Bar
        self.status_lbl = QLabel("No patient records loaded. Use buttons on left to load files or folder.")
        self.status_lbl.setFont(QFont("Segoe UI", 10))
        self.status_lbl.setStyleSheet("color: #334155; padding: 4px;")
        right_layout.addWidget(self.status_lbl)
        
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        self.progress_bar.setStyleSheet("QProgressBar::chunk { background-color: #2563eb; }")
        right_layout.addWidget(self.progress_bar)
        
        # Tab Widget for 7 Deliverables
        self.tabs = QTabWidget()
        self.tabs.setFont(QFont("Segoe UI", 10))
        
        self.tab_summary = QTextEdit()
        self.tab_causation = QTextEdit()
        self.tab_timeline = QTextEdit()
        self.tab_slides = QTextEdit()
        self.tab_literature = QTextEdit()
        self.tab_deposition = QTextEdit()
        
        for te in [self.tab_summary, self.tab_causation, self.tab_timeline, 
                   self.tab_slides, self.tab_literature, self.tab_deposition]:
            te.setReadOnly(True)
            te.setFont(QFont("Consolas", 10))
            
        self.tabs.addTab(self.tab_summary, "1. Summary")
        self.tabs.addTab(self.tab_causation, "2. Causation & WPI 30.17")
        self.tabs.addTab(self.tab_timeline, "3. Timeline")
        self.tabs.addTab(self.tab_slides, "4. Slides")
        self.tabs.addTab(self.tab_literature, "5. Literature")
        self.tabs.addTab(self.tab_deposition, "6. Deposition Prep")
        
        # Tab 7: Interactive Copilot Q&A
        tab7_widget = QWidget()
        tab7_layout = QVBoxLayout(tab7_widget)
        self.chat_display = QTextEdit()
        self.chat_display.setReadOnly(True)
        self.chat_display.setFont(QFont("Segoe UI", 10))
        tab7_layout.addWidget(self.chat_display)
        
        qa_input_box = QHBoxLayout()
        self.qa_input = QLineEdit()
        self.qa_input.setPlaceholderText("Ask any forensic question across this patient's records (e.g. 'Are the surgeries related?')...")
        self.qa_input.returnPressed.connect(self.ask_copilot)
        qa_input_box.addWidget(self.qa_input)
        
        self.btn_ask = QPushButton("Ask Copilot")
        self.btn_ask.clicked.connect(self.ask_copilot)
        qa_input_box.addWidget(self.btn_ask)
        tab7_layout.addLayout(qa_input_box)
        
        self.tabs.addTab(tab7_widget, "💬 Copilot Q&A")
        right_layout.addWidget(self.tabs)
        
        main_layout.addWidget(right_panel)

    def select_files_dialog(self):
        files, _ = QFileDialog.getOpenFileNames(self, "Select Medical PDF Records", "", "PDF Files (*.pdf)")
        if files:
            self.selected_files = files
            self.status_lbl.setText(f"✓ Selected {len(files)} document(s): {', '.join(os.path.basename(f) for f in files[:3])}...")

    def select_folder_dialog(self):
        folder = QFileDialog.getExistingDirectory(self, "Select Case Folder")
        if folder:
            pdfs = sorted(glob.glob(os.path.join(folder, "*.pdf")))
            if pdfs:
                self.selected_files = pdfs
                self.status_lbl.setText(f"✓ Loaded entire folder: {len(pdfs)} PDF files found in {os.path.basename(folder)}.")
            else:
                QMessageBox.warning(self, "No PDFs", f"No PDF files were found in {folder}.")

    def start_analysis(self):
        if not self.selected_files:
            QMessageBox.warning(self, "No Files", "Please select one or more PDF files or a case folder first.")
            return
            
        key = self.api_input.text().strip()
        if not key:
            QMessageBox.warning(self, "Missing Key", "Please enter a valid Google Gemini API Key.")
            return
            
        self.btn_analyze.setEnabled(False)
        self.progress_bar.setVisible(True)
        self.progress_bar.setValue(0)
        self.status_lbl.setText("Analyzing records locally with native engine...")
        
        is_plaintiff = self.radio_plaintiff.isChecked()
        self.worker = AnalysisWorker(self.selected_files, is_plaintiff, key)
        self.worker.progress.connect(self.update_progress)
        self.worker.finished.connect(self.analysis_complete)
        self.worker.error.connect(self.analysis_failed)
        self.worker.start()

    def update_progress(self, val, msg):
        self.progress_bar.setValue(val)
        self.status_lbl.setText(msg)

    def analysis_complete(self, sections, dossier):
        self.analysis_sections = sections
        self.current_dossier = dossier
        self.btn_analyze.setEnabled(True)
        self.btn_export_word.setEnabled(True)
        self.btn_export_pptx.setEnabled(True)
        self.progress_bar.setVisible(False)
        self.status_lbl.setText("✓ Forensic Analysis Complete! Review deliverables across the tabs below.")
        
        self.tab_summary.setMarkdown(sections.get('summary', ''))
        self.tab_causation.setMarkdown(sections.get('causation', ''))
        self.tab_timeline.setMarkdown(sections.get('timeline', ''))
        self.tab_slides.setMarkdown(sections.get('slides', ''))
        self.tab_literature.setMarkdown(sections.get('literature', ''))
        self.tab_deposition.setMarkdown(sections.get('deposition', ''))
        
        self.chat_display.append("<b>Workstation:</b> Case dossier loaded. You may now ask specific questions about surgery compensability, cross-examination attacks, or chart citations.<br>")

    def analysis_failed(self, err_msg):
        self.btn_analyze.setEnabled(True)
        self.progress_bar.setVisible(False)
        self.status_lbl.setText("❌ Analysis Failed.")
        QMessageBox.critical(self, "Analysis Error", f"Failed to complete review:\n{err_msg}")

    def export_word(self):
        if not self.analysis_sections:
            return
        save_path, _ = QFileDialog.getSaveFileName(self, "Save Word Report", "Medicolegal_Causation_Report.docx", "Word Documents (*.docx)")
        if save_path:
            case_name = os.path.basename(self.selected_files[0]) if len(self.selected_files) == 1 else "Batch Case"
            role = "PLAINTIFF EXPERT" if self.radio_plaintiff.isChecked() else "DEFENSE EXPERT"
            create_docx_report(self.analysis_sections, case_name, role, save_path)
            QMessageBox.information(self, "Saved", f"Report saved successfully to:\n{save_path}")

    def export_pptx(self):
        if not self.analysis_sections:
            return
        save_path, _ = QFileDialog.getSaveFileName(self, "Save PowerPoint Presentation", "Courtroom_Exhibits.pptx", "PowerPoint Files (*.pptx)")
        if save_path:
            case_name = os.path.basename(self.selected_files[0]) if len(self.selected_files) == 1 else "Batch Case"
            create_pptx_deck(self.analysis_sections, case_name, save_path)
            QMessageBox.information(self, "Saved", f"Slide deck saved successfully to:\n{save_path}")

    def ask_copilot(self):
        question = self.qa_input.text().strip()
        if not question:
            return
        if not self.analysis_sections:
            QMessageBox.warning(self, "No Case", "Please analyze a patient case first before asking Copilot.")
            return
            
        self.qa_input.clear()
        self.chat_display.append(f"<br><b>Dr. Mohit:</b> {question}")
        self.chat_display.append("<i>Consulting case dossier with Gemini 3.8 Flash...</i>")
        QApplication.processEvents()
        
        try:
            client = genai.Client(api_key=self.api_input.text().strip())
            role = "PLAINTIFF EXPERT" if self.radio_plaintiff.isChecked() else "DEFENSE EXPERT"
            q_prompt = f"""
You are a Board-Certified Neurosurgeon and Washington Medicolegal Expert.
Retained Role: {role}

Case Summary:
{self.analysis_sections.get('summary', '')[:2500]}

Causation Analysis:
{self.analysis_sections.get('causation', '')[:2500]}

Question:
"{question}"

Provide a direct, authoritative, legally precise neurosurgical answer with specific record citations, WPI 30.17 analysis, and witness stand recommendations.
"""
            resp = client.models.generate_content(
                model='gemini-3.8-flash',
                contents=q_prompt
            )
            ans = resp.text
            self.chat_display.append(f"<b>Copilot:</b><br>{ans}<br>")
        except Exception as e:
            self.chat_display.append(f"<font color='red'><b>Error:</b> {str(e)}</font><br>")

def main():
    app = QApplication(sys.argv)
    app.setStyle("Fusion")
    
    icon_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app_icon.ico")
    if os.path.exists(icon_path):
        app.setWindowIcon(QIcon(icon_path))
        
    window = ForensicWorkstationApp()
    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()
