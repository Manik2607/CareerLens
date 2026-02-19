from typing import List

class ATSScorer:
    @staticmethod
    def calculate_score(resume_text: str, resume_skills: List[str], job_description: str = "") -> int:
        score = 0
        
        # 1. Base score for having text content (20 points)
        if len(resume_text.strip()) > 100:
            score += 20
        elif len(resume_text.strip()) > 0:
            score += 10
            
        # 2. Score for skills (40 points)
        # If no specific job description, just score based on number of skills found
        skill_count = len(resume_skills)
        score += min(skill_count * 5, 40)

        # 3. Simple heuristic for sections (20 points)
        keywords = ["education", "experience", "projects", "skills", "summary", "objective"]
        text_lower = resume_text.lower()
        found_keywords = 0
        for keyword in keywords:
            if keyword in text_lower:
                found_keywords +=1
        
        score += min(found_keywords * 5, 20)
                
        # 4. Length check (20 points)
        word_count = len(resume_text.split())
        if 200 <= word_count <= 1000:
            score += 20
        elif word_count > 0:
            score += 10
            
        return min(score, 100)
