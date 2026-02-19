from typing import List, Dict

class Matcher:
    @staticmethod
    def calculate_match(resume_skills: List[str], internship_skills: List[str], internship_text: str = "") -> int:
        # Normalize inputs
        resume_skills_set = set(k.lower() for k in resume_skills)
        
        # If we have explicit internship skills, use them
        internship_skills_set = set(k.lower() for k in internship_skills)
        
        # Fallback: check if resume skills appear in internship text (title, desc)
        if internship_text:
             text_lower = internship_text.lower()
             for skill in resume_skills_set:
                 if skill in text_lower:
                     internship_skills_set.add(skill)
                     
        if not internship_skills_set:
             # If we still know nothing about what the internship needs, return neutral
             return 40 

        intersection = resume_skills_set.intersection(internship_skills_set)
        
        match_count = len(intersection)
        total_needed = len(internship_skills_set)
        
        if total_needed == 0:
            return 50 # Neutral if no requirements known
            
        score = (match_count / total_needed) * 100
        return int(min(score, 100))
