import re
from typing import List, Dict
from services.resume_parser import ResumeParser


# Extended skill/keyword database for better detection
SKILL_DATABASE = [
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust", "ruby",
    "php", "swift", "kotlin", "scala", "r", "matlab", "perl", "dart", "lua",

    # Frontend
    "react", "angular", "vue", "vue.js", "next.js", "nuxt.js", "svelte", "html", "css",
    "sass", "scss", "tailwind", "tailwind css", "bootstrap", "material ui", "jquery",
    "redux", "webpack", "vite", "figma", "responsive design",

    # Backend
    "node.js", "express", "express.js", "django", "flask", "fastapi", "spring boot",
    "spring", "rails", "ruby on rails", "asp.net", "laravel", "nestjs", "graphql",
    "rest api", "restful", "microservices",

    # Databases
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "sqlite",
    "oracle", "cassandra", "dynamodb", "firebase", "supabase",

    # Cloud & DevOps
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "terraform",
    "jenkins", "ci/cd", "github actions", "gitlab ci", "ansible", "nginx",
    "linux", "bash", "shell scripting",

    # Data & AI/ML
    "machine learning", "deep learning", "data analysis", "data science",
    "artificial intelligence", "nlp", "natural language processing",
    "computer vision", "tensorflow", "pytorch", "keras", "scikit-learn",
    "pandas", "numpy", "matplotlib", "tableau", "power bi", "spark",
    "hadoop", "big data", "data visualization", "statistics",

    # Mobile
    "react native", "flutter", "android", "ios", "swiftui", "jetpack compose",

    # Tools & Practices
    "git", "github", "gitlab", "jira", "agile", "scrum", "kanban",
    "unit testing", "tdd", "test driven development", "selenium", "cypress",
    "postman", "swagger",

    # Soft Skills
    "communication", "leadership", "teamwork", "problem solving",
    "project management", "time management", "critical thinking",
    "presentation", "collaboration",
]


class SkillGapAnalyzer:
    @staticmethod
    def extract_skills_from_text(text: str) -> List[str]:
        """Extract skills from any text (job description or resume)."""
        if not text or not text.strip():
            return []

        found_skills = []
        text_lower = text.lower()

        for skill in SKILL_DATABASE:
            # Use word boundary-like check for short skills to avoid false positives
            if len(skill) <= 2:
                # For very short skills like "r", "go" — require word boundaries
                pattern = r'\b' + re.escape(skill) + r'\b'
                if re.search(pattern, text_lower):
                    found_skills.append(skill)
            else:
                if skill in text_lower:
                    found_skills.append(skill)

        return list(set(found_skills))

    @staticmethod
    def analyze(job_description: str, resume_text: str) -> Dict:
        """
        Compare job description against resume and return skill gap analysis.
        """
        # Extract skills from both
        jd_skills = SkillGapAnalyzer.extract_skills_from_text(job_description)
        resume_skills = SkillGapAnalyzer.extract_skills_from_text(resume_text)

        # Find matches and gaps
        matched_skills = [s for s in jd_skills if s in resume_skills]
        missing_skills = [s for s in jd_skills if s not in resume_skills]
        extra_skills = [s for s in resume_skills if s not in jd_skills]

        # Calculate match score
        if len(jd_skills) > 0:
            match_score = round((len(matched_skills) / len(jd_skills)) * 100)
        else:
            match_score = 0

        # Generate recommendations
        recommendations = SkillGapAnalyzer._generate_recommendations(
            missing_skills, matched_skills, match_score
        )

        return {
            "match_score": match_score,
            "jd_skills": sorted(jd_skills),
            "resume_skills": sorted(resume_skills),
            "matched_skills": sorted(matched_skills),
            "missing_skills": sorted(missing_skills),
            "extra_skills": sorted(extra_skills),
            "total_jd_skills": len(jd_skills),
            "total_resume_skills": len(resume_skills),
            "total_matched": len(matched_skills),
            "total_missing": len(missing_skills),
            "recommendations": recommendations,
        }

    @staticmethod
    def _generate_recommendations(
        missing_skills: List[str],
        matched_skills: List[str],
        match_score: int
    ) -> List[str]:
        """Generate actionable recommendations based on the gap analysis."""
        recs = []

        if match_score >= 80:
            recs.append("Your resume is a strong match for this role. Focus on tailoring experience descriptions to the job.")
        elif match_score >= 50:
            recs.append("Decent match. Adding the missing skills would significantly boost your chances.")
        else:
            recs.append("Significant skill gap detected. Consider upskilling in the missing areas before applying.")

        if missing_skills:
            top_missing = missing_skills[:5]
            recs.append(f"Add these skills to your resume: {', '.join(top_missing)}")

            # Categorized suggestions
            tech_missing = [s for s in missing_skills if s in [
                sk for sk in SKILL_DATABASE
                if sk not in ["communication", "leadership", "teamwork",
                              "problem solving", "project management",
                              "time management", "critical thinking",
                              "presentation", "collaboration"]
            ]]
            soft_missing = [s for s in missing_skills if s not in tech_missing]

            if tech_missing:
                recs.append(f"Consider learning: {', '.join(tech_missing[:5])} through online courses or projects.")
            if soft_missing:
                recs.append(f"Highlight these soft skills with examples: {', '.join(soft_missing)}")

        if len(matched_skills) > 0:
            recs.append(f"Strengthen your resume by providing quantifiable achievements for: {', '.join(matched_skills[:4])}")

        return recs
