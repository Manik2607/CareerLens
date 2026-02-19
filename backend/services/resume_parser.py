import io
import PyPDF2
from docx import Document

class ResumeParser:
    @staticmethod
    def extract_text(file_content: bytes, filename: str) -> str:
        text = ""
        try:
            if filename.lower().endswith('.pdf'):
                reader = PyPDF2.PdfReader(io.BytesIO(file_content))
                for page in reader.pages:
                    text += page.extract_text() + "\n"
            elif filename.lower().endswith('.docx'):
                doc = Document(io.BytesIO(file_content))
                for para in doc.paragraphs:
                    text += para.text + "\n"
            elif filename.lower().endswith('.txt'):
                text = file_content.decode('utf-8')
            else:
                # Fallback or error, for safer handling allow pass but maybe log
                print(f"Unsupported format: {filename}")
                return ""
        except Exception as e:
            print(f"Error parsing resume: {e}")
            return ""
        
        return text.strip()

    @staticmethod
    def extract_skills(text: str) -> list[str]:
        # Simple keyword matching for now
        # In a real app, this would use a more sophisticated NLP approach or a large skill database
        common_skills = [
            "python", "java", "javascript", "react", "node.js", "sql", "aws", "docker", 
            "machine learning", "data analysis", "communication", "leadership", "html", "css",
            "git", "linux", "agile", "scrum", "c++", "c#", "typescript", "go", "ruby", "php"
        ]
        
        found_skills = []
        text_lower = text.lower()
        for skill in common_skills:
            # Check for word boundary logic if possible, but basic substring acceptable for MVP
            if skill in text_lower:
                found_skills.append(skill)
        
        # Remove duplicates
        return list(set(found_skills))
