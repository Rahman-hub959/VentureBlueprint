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
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable, Flowable, Image as RLImage
)
from reportlab.pdfgen import canvas

# CorpSetu Corporate Color Palette
CORPSETU_NAVY = colors.HexColor("#0B2559")
CORPSETU_GOLD = colors.HexColor("#C59B27")
NAVY_PRIMARY = colors.HexColor("#0B2559")
NAVY_SECONDARY = colors.HexColor("#1E293B")
BLUE_ACCENT = colors.HexColor("#1E40AF")
BLUE_LIGHT = colors.HexColor("#EFF6FF")
BLUE_BORDER = colors.HexColor("#BFDBFE")
EMERALD_ACCENT = colors.HexColor("#10B981")
EMERALD_DARK = colors.HexColor("#059669")
EMERALD_LIGHT = colors.HexColor("#ECFDF5")
EMERALD_BORDER = colors.HexColor("#A7F3D0")
GOLD_ACCENT = colors.HexColor("#C59B27")
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
    Two-pass canvas to dynamically compute total pages and render corporate headers/footers,
    including CorpSetu branding and a subtle, low-opacity document watermark.
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
            self.draw_watermark()
            self.draw_header_footer(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_watermark(self):
        """
        Draws a subtle, low-opacity watermark across the document.
        Calibrated with alpha=0.038 to be visually elegant while strictly
        ensuring 100% legibility of all body text, tables, and codes.
        """
        self.saveState()
        try:
            # Diagonal center watermark with subtle CorpSetu Navy tint
            self.setFont("Helvetica-Bold", 38)
            # Low opacity (0.038) ensures zero disturbance to content
            self.setFillColor(colors.Color(0.043, 0.145, 0.349, alpha=0.038))
            self.translate(4.25 * inch, 5.5 * inch)
            self.rotate(45)
            self.drawCentredString(0, 30, "CORPSETU")
            self.setFont("Helvetica", 13)
            self.drawCentredString(0, -2, "LAW • CS • CA  —  ONE BRIDGE")
            self.setFont("Helvetica-Bold", 9.5)
            self.drawCentredString(0, -24, "STATUTORY PLANNING DOSSIER  •  VERIFIED RECORD")
        finally:
            self.restoreState()

        # Subtle top and bottom security micro-watermark
        self.saveState()
        try:
            self.setFont("Helvetica", 6.5)
            self.setFillColor(colors.Color(0.25, 0.3, 0.45, alpha=0.22))
            self.drawCentredString(4.25 * inch, 11 * inch - 18, "••• CORPSETU VERIFIED STATUTORY DOCUMENT • OFFICIAL COMPLIANCE BLUEPRINT •••")
            self.drawCentredString(4.25 * inch, 14, "••• LAW • CS • CA ONE BRIDGE • ALL RIGHTS RESERVED • STRICTLY CONFIDENTIAL •••")
        finally:
            self.restoreState()

    def draw_header_footer(self, page_count):
        if self._pageNumber == 1:
            return  # Suppress running header/footer on cover page

        self.saveState()
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(TEXT_MUTED)

        # Running Header
        self.drawString(48, 11 * inch - 32, "CORPSETU | LAW • CS • CA ONE BRIDGE")
        self.setFont("Helvetica", 7.5)
        self.drawRightString(8.5 * inch - 48, 11 * inch - 32, "STATUTORY PLANNING DOSSIER")
        self.setStrokeColor(BORDER_COLOR)
        self.setLineWidth(0.6)
        self.line(48, 11 * inch - 36, 8.5 * inch - 48, 11 * inch - 36)

        # Running Footer
        self.line(48, 40, 8.5 * inch - 48, 40)
        self.setFont("Helvetica", 7.5)
        self.setFillColor(TEXT_MUTED)
        self.drawString(48, 28, "CORPSETU · CONFIDENTIAL & PROPRIETARY — STATUTORY PLANNING ASSISTANCE ONLY")
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
    toc_th_left = ParagraphStyle(
        "TOCTHLeft",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )
    toc_th_right = ParagraphStyle(
        "TOCTHRight",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
        alignment=2
    )
    toc_td_left = ParagraphStyle(
        "TOCTDLeft",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=11,
        textColor=NAVY_PRIMARY
    )
    toc_td_right = ParagraphStyle(
        "TOCTDRight",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=11,
        textColor=EMERALD_DARK,
        alignment=2
    )

    corpsetu_brand_style = ParagraphStyle(
        "CorpSetuBrand",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=14,
        textColor=CORPSETU_NAVY
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
        "footnote": footnote_style,
        "toc_th_left": toc_th_left,
        "toc_th_right": toc_th_right,
        "toc_td_left": toc_td_left,
        "toc_td_right": toc_td_right,
        "corpsetu_brand": corpsetu_brand_style
    }

def _build_story(doc_data: Dict[str, Any], page_tracker: Dict[str, int], is_draft: bool = False) -> List[Any]:
    st = _create_styles()
    story = []

    title = doc_data.get("title", "COMPANY SETUP BLUEPRINT")
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
        ('BACKGROUND', (0, 0), (0, 0), CORPSETU_NAVY),
        ('BACKGROUND', (1, 0), (1, 0), CORPSETU_GOLD),
        ('BACKGROUND', (2, 0), (2, 0), BLUE_ACCENT),
    ]))
    story.append(top_bar)
    story.append(Spacer(1, 8))

    # CorpSetu Brand Header
    logo_path = Path(__file__).resolve().parent.parent / "static" / "corpsetu-logo.png"
    if logo_path.exists():
        try:
            # Full brand lockup (830x293 aspect ratio)
            logo_img = RLImage(str(logo_path), width=1.85 * inch, height=0.65 * inch)
            header_table = Table([[logo_img]], colWidths=[7.15 * inch])
            header_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('LEFTPADDING', (0, 0), (-1, -1), 0),
                ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                ('TOPPADDING', (0, 0), (-1, -1), 0),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(header_table)
            story.append(Spacer(1, 4))
        except Exception:
            pass

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

    story.append(Spacer(1, 10))
    story.append(PageBreak())

    # ─────────────────────────────────────────────────────────────────
    # TABLE OF CONTENTS (TABULAR FORMAT: LEFT CONTENT, RIGHT PAGE NUMBER)
    # ─────────────────────────────────────────────────────────────────
    story.append(Paragraph("<b>Table of Contents</b>", st["sec_title"]))
    story.append(Paragraph("Structured corporate formation dossier sections and verified page references:", st["body"]))
    story.append(HRFlowable(width="100%", thickness=1.5, color=EMERALD_DARK, spaceBefore=2, spaceAfter=8))

    toc_rows = [
        [
            Paragraph("<b>Content</b>", st["toc_th_left"]),
            Paragraph("<b>Page Number</b>", st["toc_th_right"])
        ]
    ]
    for i, item in enumerate(contents_list, start=1):
        sec_key = f"sec_{i}"
        pg = page_tracker.get(sec_key, i + 2)
        toc_rows.append([
            Paragraph(item, st["toc_td_left"]),
            Paragraph(f"Page {pg}", st["toc_td_right"])
        ])

    toc_tbl = Table(toc_rows, colWidths=[5.5 * inch, 1.65 * inch])
    toc_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY_PRIMARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(toc_tbl)
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
                if sec_num == 11 or "Cost Estimate" in sec.get("title", ""):
                    col_w = [1.55 * inch, 2.1 * inch, 2.3 * inch, 1.2 * inch]
                else:
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
                    if "Founder" in sub.get("side_heading", "") or "Promoter" in sub.get("side_heading", ""):
                        col_w = [1.6 * inch, 1.45 * inch, 1.1 * inch, 1.35 * inch, 1.65 * inch]
                    else:
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
        # Section breaks: Sec 2, Sec 4, Sec 5, Sec 6, Sec 8, Sec 9, Sec 10, Sec 11, Sec 13, Sec 14, Sec 17, Sec 18
        if sec_num in [2, 4, 5, 6, 8, 9, 10, 11, 13, 14, 17, 18] and idx < len(sections):
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


def build_consultation_summary_pdf(output_path: Path, data: Dict[str, Any]) -> str:
    """
    Builds an official publication-grade structured PDF table summarizing a client's
    consultation and service registration intake (CS, CA, or LAW).
    Branded with CorpSetu spatial themes, high-contrast tables, and statutory disclaimers.
    Returns the SHA-256 checksum of the generated PDF file.
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    styles = _create_styles()
    story = []

    cid = data.get("id", "CONS-2026-0000")
    pillar = (data.get("pillar") or "GENERAL").upper()
    full_name = data.get("full_name") or "Prospective Client"
    email = data.get("email") or "client@example.com"
    phone = data.get("phone_number") or "Not provided"
    alt_phone = data.get("alternate_phone") or "Not provided"
    company = data.get("company_name") or "Proposed New Venture / Enterprise"
    service_cat = data.get("service_category") or data.get("topic") or "Statutory Corporate Advisory"
    entity_type = data.get("preferred_entity_type") or "Private Limited Company (Pvt Ltd)"
    topic = data.get("topic") or f"{pillar} Professional Advisory"
    notes = data.get("notes") or "Standard corporate consultation requested via CorpSetu web portal."
    expert = data.get("assigned_expert") or "CorpSetu Senior Advisory Partner"
    expert_role = data.get("expert_role") or "Empanelled Practitioner Desk"
    slot = data.get("preferred_time_slot") or "Within 24 to 48 Hours"
    now_str = datetime.now(timezone.utc).strftime("%d %B %Y, %I:%M %p UTC")

    pillar_color = EMERALD_DARK if pillar == "CS" else (GOLD_ACCENT if pillar == "CA" else BLUE_ACCENT)
    pillar_title = "Company Secretarial (CS) Desk" if pillar == "CS" else (
        "Chartered Accountant & Tax (CA) Desk" if pillar == "CA" else (
            "Corporate Counsel & Legal (LAW) Desk" if pillar == "LAW" else "Unified Multi-Disciplinary Advisory"
        )
    )

    # 1. Header Banner Box
    header_table = Table([
        [
            Paragraph("<b>CORPSETU</b><br/><font size='8' color='#C59B27'>LAW • CS • CA  — ONE BRIDGE</font>", ParagraphStyle("H1", fontName="Helvetica-Bold", fontSize=16, leading=19, textColor=colors.white)),
            Paragraph(f"<font size='8' color='#C59B27'><b>CONSULTATION & REGISTRATION INTAKE DOSSIER</b></font><br/><font size='9' color='white'><b>Ref: {cid}</b></font><br/><font size='7' color='#CBD5E1'>Date: {now_str}</font>", ParagraphStyle("H2", fontName="Helvetica", fontSize=8, leading=11, textColor=colors.white, alignment=2))
        ]
    ], colWidths=[3.25 * inch, 4.0 * inch])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), CORPSETU_NAVY),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 14))

    # 2. Status Callout Box
    status_table = Table([
        [
            Paragraph(f"<b>STATUS:</b> <font color='#059669'><b>SUBMITTED & ASSIGNED</b></font> &nbsp;|&nbsp; <b>DESK:</b> {pillar_title} &nbsp;|&nbsp; <b>SLA:</b> Official contact within 24 to 48 hours",
                      ParagraphStyle("StatusP", fontName="Helvetica", fontSize=8.5, leading=11, textColor=CORPSETU_NAVY))
        ]
    ], colWidths=[7.25 * inch])
    status_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#ECFDF5")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#6EE7B7")),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(status_table)
    story.append(Spacer(1, 14))

    # 3. Section 1: Client & Contact Profile Table
    story.append(Paragraph("1. Client Contact &amp; Venture Profile", styles["sec_title"]))
    story.append(Paragraph("Official details captured for statutory compliance records and verified advisor contact:", styles["body"]))
    story.append(Spacer(1, 4))

    client_table_data = [
        [Paragraph("<b>Parameter</b>", styles["th"]), Paragraph("<b>Client Submission Record</b>", styles["th"])],
        [Paragraph("<b>Tracking Reference ID</b>", styles["td"]), Paragraph(f"<b>{cid}</b>", styles["td"])],
        [Paragraph("<b>Full Name</b>", styles["td"]), Paragraph(full_name, styles["td"])],
        [Paragraph("<b>Registered Email Address</b>", styles["td"]), Paragraph(email, styles["td"])],
        [Paragraph("<b>Primary Phone Number</b>", styles["td"]), Paragraph(f"<b>{phone}</b>", styles["td"])],
        [Paragraph("<b>Alternate / Optional Phone</b>", styles["td"]), Paragraph(alt_phone, styles["td"])],
        [Paragraph("<b>Company / Proposed Entity</b>", styles["td"]), Paragraph(company, styles["td"])],
        [Paragraph("<b>Preferred Structure</b>", styles["td"]), Paragraph(entity_type, styles["td"])],
    ]
    t1 = Table(client_table_data, colWidths=[2.5 * inch, 4.75 * inch])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), CORPSETU_NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t1)
    story.append(Spacer(1, 14))

    # 4. Section 2: Service & Requirement Specifications Table
    story.append(Paragraph("2. Advisory Scope &amp; Statutory Service Selection", styles["sec_title"]))
    story.append(Paragraph("Scope of corporate advisory, statutory filings, and problem description registered:", styles["body"]))
    story.append(Spacer(1, 4))

    service_table_data = [
        [Paragraph("<b>Statutory Dimension</b>", styles["th"]), Paragraph("<b>Intake Specifications</b>", styles["th"])],
        [Paragraph("<b>Professional Pillar</b>", styles["td"]), Paragraph(f"<b>{pillar}</b> — {pillar_title}", styles["td"])],
        [Paragraph("<b>Specific Service Category</b>", styles["td"]), Paragraph(f"<b>{service_cat}</b>", styles["td"])],
        [Paragraph("<b>Subject / Problem Statement</b>", styles["td"]), Paragraph(f"<b>{topic}</b>", styles["td"])],
        [Paragraph("<b>Detailed Description / Notes</b>", styles["td"]), Paragraph(notes, styles["td"])],
        [Paragraph("<b>Assigned Lead Specialist</b>", styles["td"]), Paragraph(f"<b>{expert}</b> ({expert_role})", styles["td"])],
        [Paragraph("<b>Preferred Consultation Window</b>", styles["td"]), Paragraph(f"<b>{slot}</b>", styles["td"])],
    ]
    t2 = Table(service_table_data, colWidths=[2.5 * inch, 4.75 * inch])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), CORPSETU_NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t2)
    story.append(Spacer(1, 14))

    # 5. Section 3: CorpSetu 24-48 Hour SLA Protocol
    story.append(Paragraph("3. Engagement &amp; Advisory Protocol (Mandatory Notice)", styles["sec_title"]))
    sla_data = [
        [Paragraph("<b>Step</b>", styles["th"]), Paragraph("<b>Protocol Milestone</b>", styles["th"]), Paragraph("<b>Timeframe</b>", styles["th"])],
        [
            Paragraph("<b>Stage 1</b>", styles["td"]),
            Paragraph("<b>Telephonic Discovery Outreach</b><br/>Our Senior Desk calls the primary contact to confirm requirements, corporate structure, and compliance deliverables.", styles["td"]),
            Paragraph("<b>Within 24 to 48 Hours</b>", styles["td"])
        ],
        [
            Paragraph("<b>Stage 2</b>", styles["td"]),
            Paragraph("<b>Fee Confirmation &amp; Questionnaire Link</b><br/>Once engagement parameters are agreed, admin dispatches the statutory questionnaire directly to the client's registered email.", styles["td"]),
            Paragraph("Post-Discovery", styles["td"])
        ],
        [
            Paragraph("<b>Stage 3</b>", styles["td"]),
            Paragraph("<b>Statutory Document Generation (Admin Controlled)</b><br/>Empanelled CA / CS / High Court Legal practitioners draft the formal incorporation dossier, tax audit filings, or legal agreements.", styles["td"]),
            Paragraph("Statutory Filing SLA", styles["td"])
        ],
        [
            Paragraph("<b>Stage 4</b>", styles["td"]),
            Paragraph("<b>Official Dispatch to Registered Email</b><br/>Final MCA SPICe+ forms, COI, tax certifications, or executed contracts are emailed directly to the client's registered email.", styles["td"]),
            Paragraph("Execution SLA", styles["td"])
        ],
    ]
    t3 = Table(sla_data, colWidths=[1.0 * inch, 4.5 * inch, 1.75 * inch])
    t3.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), CORPSETU_NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t3)
    story.append(Spacer(1, 16))

    # 6. Statutory Authentication Footer
    footer_table = Table([
        [
            Paragraph("<b>CorpSetu Statutory Certification &amp; Authentication</b><br/><font size='7' color='#475569'>This document is generated digitally by the CorpSetu Corporate Advisory Engine upon submission of a formal consultation and service request. In accordance with the Information Technology Act, 2000 and applicable statutory frameworks, this electronic dossier is securely stored and verifiable under Reference ID " + cid + ".</font>",
                      ParagraphStyle("FootP", fontName="Helvetica", fontSize=7.5, leading=10.5, textColor=TEXT_MUTED)),
            Paragraph("<font size='7.5'><b>CorpSetu Advisory Desk</b><br/>Law • CS • CA One Bridge<br/>Bengaluru · Mumbai · Delhi<br/><i>support@ventureblueprint.in</i></font>",
                      ParagraphStyle("FootDesk", fontName="Helvetica", fontSize=7.5, leading=10, textColor=CORPSETU_NAVY, alignment=2))
        ]
    ], colWidths=[5.0 * inch, 2.25 * inch])
    footer_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(footer_table)

    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=letter,
        leftMargin=45,
        rightMargin=45,
        topMargin=45,
        bottomMargin=45
    )
    doc.build(story)

    # Compute SHA-256 Checksum
    hasher = hashlib.sha256()
    with open(output_path, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()
