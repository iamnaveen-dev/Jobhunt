import pymupdf as fitz
import docx
import io


def extract_text_from_pdf(file):
    text = ''
    pdf_bytes = file.read()
    doc = fitz.open(stream=pdf_bytes, filetype='pdf')

    for page in doc:
        text += page.get_text()

    doc.close()
    return text.strip()


def extract_text_from_docx(file):
    doc = docx.Document(io.BytesIO(file.read()))
    text = ''
    for paragraph in doc.paragraphs:
        text += paragraph.text + '\n'
    return text.strip()


def extract_resume_text(file, filename):
    filename_lower = filename.lower()

    if filename_lower.endswith('.pdf'):
        return extract_text_from_pdf(file)
    elif filename_lower.endswith('.docx'):
        return extract_text_from_docx(file)
    else:
        raise ValueError(
            'Unsupported file format. Please upload PDF or DOCX.'
        )