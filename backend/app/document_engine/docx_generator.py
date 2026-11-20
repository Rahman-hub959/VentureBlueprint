import os
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

# Corporate RGB Colors: Navy, Emerald, Blue, Muted
NAVY_RGB = RGBColor(15, 23, 42)
EMERALD_RGB = RGBColor(5, 150, 105)
BLUE_RGB = RGBColor(30, 64, 175)
TEXT_RGB = RGBColor(30, 41, 59)
MUTED_RGB = RGBColor(100, 116, 139)

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m_name, m_val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m_name}')
        node.set(qn('w:w'), str(m_val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def build_docx_document(output_path: Path, doc_data: Dict[str, Any]) -> str:
    """
    Generates an editable, professionally formatted Word (.docx) document
    embodying all 18 sections of the reference Company Startup Blueprint.
    Returns SHA-256 checksum of generated file.
    """
    doc = Document()

    # Page Margins (0.65 inch)
    for section in doc.sections:
        section.top_margin = Inches(0.65)
        section.bottom_margin = Inches(0.65)
        section.left_margin = Inches(0.65)
        section.right_margin = Inches(0.65)

    title = doc_data.get("title", "COMPANY STARTUP BLUEPRINT")
    company_name = doc_data.get("company_name", "Lumora Labs")
    ref_output_desc = doc_data.get("ref_output_desc", "single founder who prefers a Private Limited company (India)")
    metadata_table_data = doc_data.get("metadata_table", [])
    disclaimer_banner = doc_data.get("disclaimer_banner", "")
    status_labels_table = doc_data.get("status_labels_table", [])
    contents_list = doc_data.get("contents_list", [])
    sections = doc_data.get("sections", [])

    # Title
    p_title = doc.add_paragraph()
    r_title = p_title.add_run(title)
    r_title.font.name = "Arial"
    r_title.font.size = Pt(20)
    r_title.font.bold = True
    r_title.font.color.rgb = NAVY_RGB
    p_title.paragraph_format.space_after = Pt(2)

    # Company Entity
    p_comp = doc.add_paragraph()
    r_comp = p_comp.add_run(company_name)
    r_comp.font.name = "Arial"
    r_comp.font.size = Pt(15)
    r_comp.font.bold = True
    r_comp.font.color.rgb = EMERALD_RGB
    p_comp.paragraph_format.space_after = Pt(2)

    # Subtitle / Reference output
    p_sub = doc.add_paragraph()
    r_sub = p_sub.add_run(f"Reference output: {ref_output_desc}")
    r_sub.font.name = "Arial"
    r_sub.font.size = Pt(10)
    r_sub.font.italic = True
    r_sub.font.color.rgb = MUTED_RGB
    p_sub.paragraph_format.space_after = Pt(12)

    # Metadata Table
    if metadata_table_data:
        m_tbl = doc.add_table(rows=len(metadata_table_data), cols=2)
        m_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        for i, row in enumerate(metadata_table_data):
            c0, c1 = m_tbl.rows[i].cells[0], m_tbl.rows[i].cells[1]
            c0.text = str(row[0])
            c0.paragraphs[0].runs[0].font.name = "Arial"
            c0.paragraphs[0].runs[0].font.size = Pt(8.5)
            c0.paragraphs[0].runs[0].font.bold = True
            c0.paragraphs[0].runs[0].font.color.rgb = NAVY_RGB
            set_cell_background(c0, "F8FAFC")
            set_cell_margins(c0, 60, 60, 100, 100)

            c1.text = str(row[1])
            c1.paragraphs[0].runs[0].font.name = "Arial"
            c1.paragraphs[0].runs[0].font.size = Pt(8.5)
            c1.paragraphs[0].runs[0].font.color.rgb = TEXT_RGB
            set_cell_background(c1, "FFFFFF")
            set_cell_margins(c1, 60, 60, 100, 100)

        p_sp = doc.add_paragraph()
        p_sp.paragraph_format.space_after = Pt(8)

    # Disclaimer Callout Box
    if disclaimer_banner:
        d_tbl = doc.add_table(rows=1, cols=1)
        d_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        c = d_tbl.rows[0].cells[0]
        c.text = disclaimer_banner
        c.paragraphs[0].runs[0].font.name = "Arial"
        c.paragraphs[0].runs[0].font.size = Pt(8)
        c.paragraphs[0].runs[0].font.color.rgb = MUTED_RGB
        set_cell_background(c, "FEF3C7")
        set_cell_margins(c, 100, 100, 150, 150)

        p_sp = doc.add_paragraph()
        p_sp.paragraph_format.space_after = Pt(12)

    # Status labels table
    p_stat_head = doc.add_paragraph()
    r_stat_head = p_stat_head.add_run("How to read the status labels")
    r_stat_head.font.name = "Arial"
    r_stat_head.font.size = Pt(11)
    r_stat_head.font.bold = True
    r_stat_head.font.color.rgb = NAVY_RGB
    p_stat_head.paragraph_format.space_after = Pt(4)

    s_tbl = doc.add_table(rows=len(status_labels_table) + 1, cols=2)
    s_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    # Headers
    h0, h1 = s_tbl.rows[0].cells[0], s_tbl.rows[0].cells[1]
    h0.text = "Label"
    h0.paragraphs[0].runs[0].font.bold = True
    h0.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
    set_cell_background(h0, "0F172A")
    set_cell_margins(h0, 60, 60, 100, 100)

    h1.text = "Meaning"
    h1.paragraphs[0].runs[0].font.bold = True
    h1.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
    set_cell_background(h1, "0F172A")
    set_cell_margins(h1, 60, 60, 100, 100)

    for i, row in enumerate(status_labels_table):
        r_c0, r_c1 = s_tbl.rows[i + 1].cells[0], s_tbl.rows[i + 1].cells[1]
        r_c0.text = str(row[0])
        r_c0.paragraphs[0].runs[0].font.bold = True
        r_c0.paragraphs[0].runs[0].font.size = Pt(8)
        r_c0.paragraphs[0].runs[0].font.color.rgb = NAVY_RGB
        set_cell_background(r_c0, "F8FAFC" if i % 2 == 1 else "FFFFFF")
        set_cell_margins(r_c0, 50, 50, 80, 80)

        r_c1.text = str(row[1])
        r_c1.paragraphs[0].runs[0].font.size = Pt(8)
        r_c1.paragraphs[0].runs[0].font.color.rgb = TEXT_RGB
        set_cell_background(r_c1, "F8FAFC" if i % 2 == 1 else "FFFFFF")
        set_cell_margins(r_c1, 50, 50, 80, 80)

    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_after = Pt(12)

    # Contents summary line
    p_toc_head = doc.add_paragraph()
    r_toc_head = p_toc_head.add_run("Contents")
    r_toc_head.font.name = "Arial"
    r_toc_head.font.size = Pt(11)
    r_toc_head.font.bold = True
    r_toc_head.font.color.rgb = NAVY_RGB
    p_toc_head.paragraph_format.space_after = Pt(4)

    p_toc_line = doc.add_paragraph()
    r_toc_line = p_toc_line.add_run(" · ".join(contents_list))
    r_toc_line.font.name = "Arial"
    r_toc_line.font.size = Pt(8.5)
    r_toc_line.font.color.rgb = TEXT_RGB
    p_toc_line.paragraph_format.space_after = Pt(16)

    doc.add_page_break()

    # ─────────────────────────────────────────────────────────────────
    # SECTIONS 1 TO 18
    # ─────────────────────────────────────────────────────────────────
    for idx, sec in enumerate(sections, start=1):
        # Section Heading
        p_sec = doc.add_paragraph()
        r_sec = p_sec.add_run(sec["title"])
        r_sec.font.name = "Arial"
        r_sec.font.size = Pt(14)
        r_sec.font.bold = True
        r_sec.font.color.rgb = NAVY_RGB
        p_sec.paragraph_format.space_before = Pt(12)
        p_sec.paragraph_format.space_after = Pt(4)

        # Callout box if present
        if sec.get("box_title") or sec.get("box_content"):
            b_tbl = doc.add_table(rows=1, cols=1)
            b_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
            b_cell = b_tbl.rows[0].cells[0]
            b_para = b_cell.paragraphs[0]
            if sec.get("box_title"):
                r_bt = b_para.add_run(sec["box_title"] + "\n")
                r_bt.font.bold = True
                r_bt.font.color.rgb = EMERALD_RGB
                r_bt.font.size = Pt(8.5)
            if sec.get("box_content"):
                r_bc = b_para.add_run(sec["box_content"])
                r_bc.font.color.rgb = TEXT_RGB
                r_bc.font.size = Pt(8.5)
            set_cell_background(b_cell, "ECFDF5")
            set_cell_margins(b_cell, 80, 80, 120, 120)

            p_sp = doc.add_paragraph()
            p_sp.paragraph_format.space_after = Pt(6)

        # Section Intro
        if sec.get("intro"):
            p_in = doc.add_paragraph()
            r_in = p_in.add_run(sec["intro"])
            r_in.font.name = "Arial"
            r_in.font.size = Pt(9)
            r_in.font.color.rgb = TEXT_RGB
            p_in.paragraph_format.space_after = Pt(4)

        # Top level table if present
        if sec.get("table_headers") and sec.get("table_rows"):
            headers = sec["table_headers"]
            rows = sec["table_rows"]
            tbl = doc.add_table(rows=len(rows) + 1, cols=len(headers))
            tbl.alignment = WD_TABLE_ALIGNMENT.CENTER

            for c_idx, h in enumerate(headers):
                cell = tbl.rows[0].cells[c_idx]
                cell.text = str(h)
                cell.paragraphs[0].runs[0].font.bold = True
                cell.paragraphs[0].runs[0].font.size = Pt(8)
                cell.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
                set_cell_background(cell, "0F172A")
                set_cell_margins(cell, 50, 50, 80, 80)

            for r_idx, row in enumerate(rows):
                for c_idx, val in enumerate(row):
                    cell = tbl.rows[r_idx + 1].cells[c_idx]
                    cell.text = str(val)
                    cell.paragraphs[0].runs[0].font.size = Pt(8)
                    if c_idx == 0:
                        cell.paragraphs[0].runs[0].font.bold = True
                    cell.paragraphs[0].runs[0].font.color.rgb = TEXT_RGB
                    set_cell_background(cell, "F8FAFC" if r_idx % 2 == 1 else "FFFFFF")
                    set_cell_margins(cell, 40, 40, 60, 60)

            p_sp = doc.add_paragraph()
            p_sp.paragraph_format.space_after = Pt(8)

        # Subsections
        for sub in sec.get("subsections", []):
            if sub.get("side_heading"):
                p_sh = doc.add_paragraph()
                r_sh = p_sh.add_run(sub["side_heading"])
                r_sh.font.name = "Arial"
                r_sh.font.size = Pt(11)
                r_sh.font.bold = True
                r_sh.font.color.rgb = NAVY_RGB
                p_sh.paragraph_format.space_before = Pt(8)
                p_sh.paragraph_format.space_after = Pt(3)

            for p_text in sub.get("paragraphs", []):
                p_para = doc.add_paragraph()
                # Clean html tags for docx
                cleaned_text = p_text.replace("<b>", "").replace("</b>", "").replace("•", "•")
                r_p = p_para.add_run(cleaned_text)
                r_p.font.name = "Arial"
                r_p.font.size = Pt(9)
                r_p.font.color.rgb = TEXT_RGB
                p_para.paragraph_format.space_after = Pt(4)

            if sub.get("table_headers") and sub.get("table_rows"):
                s_headers = sub["table_headers"]
                s_rows = sub["table_rows"]
                s_tbl = doc.add_table(rows=len(s_rows) + 1, cols=len(s_headers))
                s_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER

                for c_idx, h in enumerate(s_headers):
                    cell = s_tbl.rows[0].cells[c_idx]
                    cell.text = str(h)
                    cell.paragraphs[0].runs[0].font.bold = True
                    cell.paragraphs[0].runs[0].font.size = Pt(8)
                    cell.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
                    set_cell_background(cell, "1E293B")
                    set_cell_margins(cell, 50, 50, 80, 80)

                for r_idx, row in enumerate(s_rows):
                    for c_idx, val in enumerate(row):
                        cell = s_tbl.rows[r_idx + 1].cells[c_idx]
                        cell.text = str(val)
                        cell.paragraphs[0].runs[0].font.size = Pt(8)
                        if c_idx == 0:
                            cell.paragraphs[0].runs[0].font.bold = True
                        cell.paragraphs[0].runs[0].font.color.rgb = TEXT_RGB
                        set_cell_background(cell, "F8FAFC" if r_idx % 2 == 1 else "FFFFFF")
                        set_cell_margins(cell, 40, 40, 60, 60)

                p_sp = doc.add_paragraph()
                p_sp.paragraph_format.space_after = Pt(8)

        # Footnote
        if sec.get("footnote"):
            p_fn = doc.add_paragraph()
            r_fn = p_fn.add_run(sec["footnote"])
            r_fn.font.name = "Arial"
            r_fn.font.size = Pt(8)
            r_fn.font.italic = True
            r_fn.font.color.rgb = MUTED_RGB
            p_fn.paragraph_format.space_after = Pt(6)

        # Strategic page breaks for Word export
        if sec.get("num", idx) in [1, 2, 4, 6, 8, 10, 12, 14, 17] and idx < len(sections):
            doc.add_page_break()

    # Final Disclaimer Block
    p_disc = doc.add_paragraph()
    r_disc = p_disc.add_run("Disclaimer: This platform provides planning assistance only. It does not register companies, certify documents, or replace advice from a qualified CA, CS or lawyer.")
    r_disc.font.name = "Arial"
    r_disc.font.size = Pt(8)
    r_disc.font.italic = True
    r_disc.font.color.rgb = MUTED_RGB
    p_disc.paragraph_format.space_before = Pt(14)

    # Save to disk
    doc.save(str(output_path))

    # Compute SHA-256 Checksum
    hasher = hashlib.sha256()
    with open(output_path, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()
