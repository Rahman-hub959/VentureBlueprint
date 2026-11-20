import os
import io
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable, Flowable
)
from reportlab.pdfgen import canvas

# Corporate Color Palette: Green, Blue, White Foundation
NAVY_PRIMARY = colors.HexColor("#0F172A")
NAVY_SECONDARY = colors.HexColor("#1E293B")
BLUE_ACCENT = colors.HexColor("#1E40AF")
BLUE_LIGHT = colors.HexColor("#EFF6FF")
BLUE_BORDER = colors.HexColor("#BFDBFE")
EMERALD_ACCENT = colors.HexColor("#10B981")
EMERALD_DARK = colors.HexColor("#059669")
EMERALD_LIGHT = colors.HexColor("#ECFDF5")
EMERALD_BORDER = colors.HexColor("#A7F3D0")
GOLD_ACCENT = colors.HexColor("#D97706")
GOLD_LIGHT = colors.HexColor("#FEF3C7")
GOLD_BORDER = colors.HexColor("#FDE68A")
TEXT_DARK = colors.HexColor("#0F172A")
TEXT_BODY = colors.HexColor("#1E293B")
TEXT_MUTED = colors.HexColor("#475569")
BG_LIGHT = colors.HexColor("#F8FAFC")
BORDER_COLOR = colors.HexColor("#CBD5E1")

class SectionMarker(Flowable):
    """
    Zero-height flowable that records the canvas page number when drawn.
    Enables dynamic, exact Table of Contents page numbering across passes.
    """
    def __init__(self, key: str, tracker: Dict[str, int]):
        super().__init__()
        self.key = key
        self.tracker = tracker
        self.width = 0
        self.height = 0

    def draw(self):
        if self.canv:
            self.tracker[self.key] = self.canv._pageNumber

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute total pages and render corporate headers/footers.
    """
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_header_footer(self, page_count):
        if self._pageNumber == 1:
            return  # Suppress running header/footer on cover page

        self.saveState()
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(TEXT_MUTED)

        # Running Header
        self.drawString(48, 11 * inch - 32, "VENTUREBLUEPRINT | COMPANY STARTUP BLUEPRINT")
        self.setFont("Helvetica", 7.5)
        self.drawRightString(8.5 * inch - 48, 11 * inch - 32, "SRS v0.1 • STATUTORY PLANNING DOSSIER")
        self.setStrokeColor(BORDER_COLOR)
        self.setLineWidth(0.6)
        self.line(48, 11 * inch - 36, 8.5 * inch - 48, 11 * inch - 36)

        # Running Footer
        self.line(48, 40, 8.5 * inch - 48, 40)
        self.setFont("Helvetica", 7.5)
        self.setFillColor(TEXT_MUTED)
        self.drawString(48, 28, "CONFIDENTIAL & PROPRIETARY — STATUTORY PLANNING ASSISTANCE ONLY")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(NAVY_PRIMARY)
        self.drawRightString(8.5 * inch - 48, 28, page_str)
        self.restoreState()

def _create_styles():
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=NAVY_PRIMARY,
        spaceAfter=4
    )
    entity_style = ParagraphStyle(
        "DocEntity",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=15,
        leading=19,
        textColor=EMERALD_DARK,
        spaceAfter=3
    )
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=13.5,
        textColor=TEXT_MUTED,
        spaceAfter=12
    )
    sec_title_style = ParagraphStyle(
        "SectionTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=12.5,
        leading=16,
        textColor=NAVY_PRIMARY,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )
    side_heading_style = ParagraphStyle(
        "SideHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13.5,
        textColor=NAVY_PRIMARY,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=12.5,
        textColor=TEXT_BODY,
        spaceAfter=5
    )
    body_bold = ParagraphStyle(
        "BodyBold",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=12.5,
        textColor=NAVY_PRIMARY
    )
    th_style = ParagraphStyle(
        "TH",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=11,
        textColor=colors.white
    )
    td_style = ParagraphStyle(
        "TD",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.5,
        leading=10.5,
        textColor=TEXT_DARK
    )
    td_bold = ParagraphStyle(
        "TDBold",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=7.5,
        leading=10.5,
        textColor=NAVY_PRIMARY
    )
    box_title_style = ParagraphStyle(
        "BoxTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11.5,
        textColor=EMERALD_DARK
    )
    box_body_style = ParagraphStyle(
        "BoxBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=11.5,
        textColor=TEXT_BODY
    )
    disclaimer_style = ParagraphStyle(
        "Disclaimer",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.5,
        leading=10.5,
        textColor=TEXT_MUTED
    )
    footnote_style = ParagraphStyle(
        "Footnote",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=7.5,
        leading=10.5,
        textColor=TEXT_MUTED,
        spaceBefore=4,
        spaceAfter=6
    )

    return {
        "title": title_style,
        "entity": entity_style,
        "subtitle": subtitle_style,
        "sec_title": sec_title_style,
        "side_heading": side_heading_style,
        "body": body_style,
        "body_bold": body_bold,
        "th": th_style,
        "td": td_style,
        "td_bold": td_bold,
        "box_title": box_title_style,
        "box_body": box_body_style,
        "disclaimer": disclaimer_style,
        "footnote": footnote_style
    }

def _build_story(doc_data: Dict[str, Any], page_tracker: Dict[str, int], is_draft: bool = False) -> List[Any]:
    st = _create_styles()
    story = []

    title = doc_data.get("title", "COMPANY STARTUP BLUEPRINT")
    company_name = doc_data.get("company_name", "Lumora Labs")
    ref_output_desc = doc_data.get("ref_output_desc", "single founder who prefers a Private Limited company (India)")
    metadata_table_data = doc_data.get("metadata_table", [])
    disclaimer_banner = doc_data.get("disclaimer_banner", "")
    status_labels_table = doc_data.get("status_labels_table", [])
    contents_list = doc_data.get("contents_list", [])
    sections = doc_data.get("sections", [])

    content_w = 7.15 * inch

    # ─────────────────────────────────────────────────────────────────
    # COVER / HEADER SECTION
    # ─────────────────────────────────────────────────────────────────
    top_bar = Table([["", "", ""]], colWidths=[2.5 * inch, 2.5 * inch, 2.15 * inch], rowHeights=[4])
    top_bar.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), NAVY_PRIMARY),
        ('BACKGROUND', (1, 0), (1, 0), EMERALD_DARK),
        ('BACKGROUND', (2, 0), (2, 0), BLUE_ACCENT),
    ]))
    story.append(top_bar)
    story.append(Spacer(1, 10))

    story.append(Paragraph(title, st["title"]))
    story.append(Paragraph(company_name, st["entity"]))
    story.append(Paragraph(f"Reference output: {ref_output_desc}", st["subtitle"]))

    # Metadata Table
    meta_rows = []
    for row in metadata_table_data:
        meta_rows.append([
            Paragraph(f"<b>{row[0]}</b>", st["td_bold"]),
            Paragraph(row[1], st["td"])
        ])

    meta_tbl = Table(meta_rows, colWidths=[1.8 * inch, 5.35 * inch])
    meta_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), BG_LIGHT),
        ('BACKGROUND', (1, 0), (1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(meta_tbl)
    story.append(Spacer(1, 8))

    # Disclaimer Callout Box
    if disclaimer_banner:
        disc_table = Table([[Paragraph(disclaimer_banner, st["disclaimer"])]], colWidths=[content_w])
        disc_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), GOLD_LIGHT),
            ('BOX', (0, 0), (-1, -1), 1, GOLD_BORDER),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(disc_table)
        story.append(Spacer(1, 12))

    # ─────────────────────────────────────────────────────────────────
    # HOW TO READ THE STATUS LABELS
    # ─────────────────────────────────────────────────────────────────
    story.append(Paragraph("<b>How to read the status labels</b>", st["side_heading"]))
    status_rows = [[Paragraph("<b>Label</b>", st["th"]), Paragraph("<b>Meaning</b>", st["th"])]]
    for row in status_labels_table:
        status_rows.append([
            Paragraph(f"<b>{row[0]}</b>", st["td_bold"]),
            Paragraph(row[1], st["td"])
        ])
    status_tbl = Table(status_rows, colWidths=[2.2 * inch, 4.95 * inch])
    status_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY_PRIMARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(status_tbl)
    story.append(Spacer(1, 12))

    # ─────────────────────────────────────────────────────────────────
    # CONTENTS SUMMARY (WITH DYNAMIC PAGE NUMBERS)
    # ─────────────────────────────────────────────────────────────────
    story.append(Paragraph("<b>Contents</b>", st["side_heading"]))
    toc_tokens = []
    for i, item in enumerate(contents_list, start=1):
        sec_key = f"sec_{i}"
        pg = page_tracker.get(sec_key, i + 1)
        toc_tokens.append(f"{item} (p. {pg})")
    toc_line = " &nbsp;·&nbsp; ".join(toc_tokens)
    
    toc_box = Table([[Paragraph(toc_line, st["td"])]], colWidths=[content_w])
    toc_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(toc_box)
    story.append(Spacer(1, 14))
    story.append(PageBreak())

    # ─────────────────────────────────────────────────────────────────
    # SECTIONS 1 TO 18
    # ─────────────────────────────────────────────────────────────────
    for idx, sec in enumerate(sections, start=1):
        sec_num = sec.get("num", idx)
        marker_key = f"sec_{sec_num}"

        # Place SectionMarker for exact page tracking
        story.append(SectionMarker(marker_key, page_tracker))

        # Section Heading
        story.append(Paragraph(sec["title"], st["sec_title"]))
        story.append(HRFlowable(width="100%", thickness=1.5, color=EMERALD_DARK, spaceBefore=0, spaceAfter=8))

        # Optional Outcome / Callout Box
        if sec.get("box_title") or sec.get("box_content"):
            b_title = sec.get("box_title", "")
            b_content = sec.get("box_content", "")
            box_flowables = []
            if b_title:
                box_flowables.append(Paragraph(f"<b>{b_title}</b>", st["box_title"]))
            if b_content:
                box_flowables.append(Paragraph(b_content, st["box_body"]))
            box_tbl = Table([[box_flowables]], colWidths=[content_w])
            box_tbl.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), EMERALD_LIGHT),
                ('BOX', (0, 0), (-1, -1), 1, EMERALD_BORDER),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('LEFTPADDING', (0, 0), (-1, -1), 8),
                ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ]))
            story.append(box_tbl)
            story.append(Spacer(1, 6))

        # Optional Section Intro
        if sec.get("intro"):
            story.append(Paragraph(sec["intro"], st["body"]))
            story.append(Spacer(1, 4))

        # Primary Section Table (if at top level)
        if sec.get("table_headers") and sec.get("table_rows"):
            t_head = [Paragraph(f"<b>{h}</b>", st["th"]) for h in sec["table_headers"]]
            t_rows = []
            for r in sec["table_rows"]:
                t_rows.append([Paragraph(str(c), st["td_bold"] if i == 0 else st["td"]) for i, c in enumerate(r)])
            full_table_data = [t_head] + t_rows

            n_cols = len(t_head)
            col_w = [content_w / n_cols] * n_cols
            if n_cols == 2:
                col_w = [2.2 * inch, 4.95 * inch]
            elif n_cols == 3:
                col_w = [1.8 * inch, 3.2 * inch, 2.15 * inch]
            elif n_cols == 4:
                col_w = [1.5 * inch, 2.2 * inch, 1.45 * inch, 2.0 * inch]
            elif n_cols == 5:
                col_w = [0.4 * inch, 2.8 * inch, 1.1 * inch, 1.45 * inch, 1.4 * inch]
            elif n_cols == 6:
                col_w = [1.3 * inch, 1.3 * inch, 1.3 * inch, 1.0 * inch, 1.15 * inch, 1.1 * inch]
            elif n_cols == 7:
                col_w = [1.5 * inch, 1.2 * inch, 0.9 * inch, 0.9 * inch, 0.9 * inch, 0.9 * inch, 0.85 * inch]

            tbl = Table(full_table_data, colWidths=col_w, repeatRows=1)
            tbl.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), NAVY_PRIMARY),
                ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
                ('TOPPADDING', (0, 0), (-1, -1), 3.5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
                ('LEFTPADDING', (0, 0), (-1, -1), 5),
                ('RIGHTPADDING', (0, 0), (-1, -1), 5),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            story.append(tbl)
            story.append(Spacer(1, 6))

        # Render Subsections
        subsections = sec.get("subsections", [])
        for sub in subsections:
            if sub.get("side_heading"):
                story.append(Paragraph(f"<b>{sub['side_heading']}</b>", st["side_heading"]))

            for p_text in sub.get("paragraphs", []):
                story.append(Paragraph(p_text, st["body"]))

            if sub.get("table_headers") and sub.get("table_rows"):
                s_head = [Paragraph(f"<b>{h}</b>", st["th"]) for h in sub["table_headers"]]
                s_rows = []
                for r in sub["table_rows"]:
                    s_rows.append([Paragraph(str(c), st["td_bold"] if i == 0 else st["td"]) for i, c in enumerate(r)])
                s_full = [s_head] + s_rows

                n_cols = len(s_head)
                col_w = [content_w / n_cols] * n_cols
                if n_cols == 2:
                    col_w = [2.2 * inch, 4.95 * inch]
                elif n_cols == 3:
                    col_w = [1.8 * inch, 3.2 * inch, 2.15 * inch]
                elif n_cols == 4:
                    col_w = [1.5 * inch, 2.2 * inch, 1.45 * inch, 2.0 * inch]
                elif n_cols == 5:
                    col_w = [1.3 * inch, 1.8 * inch, 1.0 * inch, 0.85 * inch, 2.2 * inch]
                elif n_cols == 6:
                    col_w = [1.3 * inch, 1.3 * inch, 1.3 * inch, 1.0 * inch, 1.15 * inch, 1.1 * inch]

                s_tbl = Table(s_full, colWidths=col_w, repeatRows=1)
                s_tbl.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), NAVY_SECONDARY),
                    ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
                    ('TOPPADDING', (0, 0), (-1, -1), 3.5),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
                    ('LEFTPADDING', (0, 0), (-1, -1), 5),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 5),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ]))
                story.append(s_tbl)
                story.append(Spacer(1, 6))

        # Optional Footnote
        if sec.get("footnote"):
            story.append(Paragraph(sec["footnote"], st["footnote"]))

        # Intelligent Page Breaks: group sections naturally across 10-15 pages
        # Page breaks after: Sec 1, Sec 2, Sec 4, Sec 6, Sec 8, Sec 10, Sec 12, Sec 14, Sec 17
        if sec_num in [1, 2, 4, 6, 8, 10, 12, 14, 17] and idx < len(sections):
            story.append(PageBreak())
        else:
            story.append(Spacer(1, 10))

    # Final Disclaimer Block at document end
    story.append(Spacer(1, 10))
    story.append(KeepTogether([
        Table([
            [Paragraph("<b>Disclaimer:</b> This platform provides planning assistance only. It does not register companies, certify documents, or replace advice from a qualified CA, CS or lawyer.", st["disclaimer"])]
        ], colWidths=[content_w], style=[
            ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
            ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ])
    ]))

    return story

def build_pdf_document(output_path: Path, doc_data: Dict[str, Any]) -> str:
    """
    Builds a professional corporate PDF report.
    Executes a two-pass build to guarantee exact Table of Contents
    page numbering matching the generated 18-section PDF.
    Returns SHA-256 checksum of the generated file.
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    page_tracker: Dict[str, int] = {}

    # ─────────────────────────────────────────────────────────────────
    # PASS 1: In-Memory Draft Pass to capture exact Section Page Numbers
    # ─────────────────────────────────────────────────────────────────
    draft_buffer = io.BytesIO()
    draft_doc = SimpleDocTemplate(
        draft_buffer,
        pagesize=letter,
        leftMargin=48,
        rightMargin=48,
        topMargin=48,
        bottomMargin=48
    )
    draft_story = _build_story(doc_data, page_tracker, is_draft=True)
    draft_doc.build(draft_story, canvasmaker=NumberedCanvas)
    draft_buffer.close()

    # ─────────────────────────────────────────────────────────────────
    # PASS 2: Final Target Pass with Accurate Table of Contents Numbers
    # ─────────────────────────────────────────────────────────────────
    final_doc = SimpleDocTemplate(
        str(output_path),
        pagesize=letter,
        leftMargin=48,
        rightMargin=48,
        topMargin=48,
        bottomMargin=48
    )
    final_story = _build_story(doc_data, page_tracker, is_draft=False)
    final_doc.build(final_story, canvasmaker=NumberedCanvas)

    # Compute SHA-256 Checksum
    hasher = hashlib.sha256()
    with open(output_path, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()
