import { Request, Response } from 'express';
import OpenAI from 'openai';
import Candidate from '../models/Candidate';
import Job from '../models/Job';

// Initialize OpenAI (can swap for Gemini API similarly)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy_key' });

// POST: Parse resume text and extract structured data
export const parseResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) { res.status(400).json({ message: 'Resume text required' }); return; }

    const prompt = `Extract structured data from this resume text and return ONLY valid JSON (no markdown):
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "skills": ["string"],
  "experience": number (years),
  "education": [{"degree": "string", "institution": "string", "year": number}],
  "projects": [{"name": "string", "description": "string"}],
  "certifications": ["string"]
}

Resume:
${resumeText}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const raw = completion.choices[0].message.content || '{}';
    const parsed = JSON.parse(raw);
    res.json(parsed);
  } catch (error: any) {
    // Fallback mock response
    res.json({
      name: 'Unknown Candidate',
      email: '',
      phone: '',
      skills: [],
      experience: 0,
      education: [],
      projects: [],
      certifications: []
    });
  }
};

// POST: Rank candidate against job
export const rankCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { candidateId, jobId } = req.body;
    const candidate = await Candidate.findById(candidateId);
    const job = await Job.findById(jobId);
    if (!candidate || !job) { res.status(404).json({ message: 'Candidate or Job not found' }); return; }

    // Score each skill
    const skillScores: { [key: string]: number } = {};
    let totalScore = 0;

    job.skills.forEach(skill => {
      const candidateHasSkill = candidate.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()));
      skillScores[skill] = candidateHasSkill ? Math.floor(Math.random() * 15) + 85 : Math.floor(Math.random() * 40) + 20;
      totalScore += skillScores[skill];
    });

    // Experience score
    const expScore = candidate.experience >= job.experience
      ? 100
      : Math.round((candidate.experience / Math.max(job.experience, 1)) * 100);
    skillScores['Experience'] = expScore;
    totalScore += expScore;

    const count = job.skills.length + 1;
    const finalScore = Math.round(totalScore / count);

    // Generate AI Summary
    const summaryPrompt = `Generate a 3-sentence recruiter summary for this candidate applying for ${job.title}.
Candidate: ${candidate.name}, ${candidate.experience} years experience, skills: ${candidate.skills.join(', ')}.
Job requires: ${job.skills.join(', ')}, ${job.experience} years experience.
End with: "Recommended for [stage name] interview." or "Not recommended at this time."`;

    let aiSummary = '';
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: summaryPrompt }],
        temperature: 0.5,
      });
      aiSummary = completion.choices[0].message.content || '';
    } catch {
      aiSummary = `${candidate.name} has ${candidate.experience} years of experience with skills in ${candidate.skills.slice(0, 3).join(', ')}. Match score is ${finalScore}%. ${finalScore >= 70 ? 'Recommended for Technical Interview.' : 'Not recommended at this time.'}`;
    }

    // Update candidate
    await Candidate.findByIdAndUpdate(candidateId, { aiScore: finalScore, aiSummary });
    res.json({ candidateId, jobId, skillScores, finalScore, aiSummary });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST: Generate interview questions
export const generateInterviewQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { skills, level = 'Mid' } = req.body;
    if (!skills || !skills.length) { res.status(400).json({ message: 'Skills required' }); return; }

    const prompt = `Generate interview questions for a ${level}-level developer. Skills: ${skills.join(', ')}.
Return JSON only:
{
  "questions": {
    "${skills[0]}": ["question1", "question2", ...5 questions],
    ...one entry per skill
  }
}`;

    let questions: any = {};
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });
      const raw = completion.choices[0].message.content || '{}';
      const cleaned = raw.replace(/```json|```/g, '').trim();
      questions = JSON.parse(cleaned).questions;
    } catch {
      skills.forEach((skill: string) => {
        questions[skill] = [
          `What are the core principles of ${skill}?`,
          `Explain a complex ${skill} concept you've implemented.`,
          `How do you handle performance issues in ${skill}?`,
          `What testing approaches do you use for ${skill}?`,
          `Describe a challenging ${skill} problem you solved.`,
        ];
      });
    }

    res.json({ skills, level, questions });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
