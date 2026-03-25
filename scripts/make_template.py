import os
from docx import Document
from docx.shared import Pt, RGBColor

def create():
    doc = Document()
    styles = doc.styles
    
    # Title - #FF6900 Orange
    s = styles['Title']
    s.font.name = 'Arial'
    s.font.size = Pt(24)
    s.font.color.rgb = RGBColor(0xFF, 0x69, 0x00)
    
    # Heading 1 - Slate Gray
    s = styles['Heading 1']
    s.font.name = 'Arial'
    s.font.size = Pt(18)
    s.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
    
    # Heading 2 - Slate Gray
    s = styles['Heading 2']
    s.font.name = 'Arial'
    s.font.size = Pt(14)
    s.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
    
    # Normal Text - Dark Gray
    s = styles['Normal']
    s.font.name = 'Arial'
    s.font.size = Pt(11)
    s.font.color.rgb = RGBColor(0x37, 0x41, 0x51)
    
    for p in doc.paragraphs:
        p._element.getparent().remove(p._element)
        
    os.makedirs('app/templates', exist_ok=True)
    doc.save('app/templates/template.docx')
    print("Template created at app/templates/template.docx")

if __name__ == '__main__':
    create()
