import { Users } from 'lucide-react';
import { MCQModulePage } from '@/pages/modules/MCQModulePage';
import { professionalSkillQuestions } from '@/data/mockData';
import { useData } from '@/context/DataContext';

export function ProfessionalSkillsPage() {
  const { setScores, scores } = useData();
  const updateScore = (key: 'professional', value: number) => {
    setScores({ ...scores, [key]: Math.round((scores[key] + value) / 2) });
  };

  return (
    <MCQModulePage
      title="Professional Skills"
      description="Soft skills that make a difference in interviews"
      icon={<Users size={24} />}
      topics={Object.keys(professionalSkillQuestions)}
      questionsByTopic={professionalSkillQuestions}
      category="Professional"
      scoreKey="professional"
      updateScore={updateScore}
    />
  );
}
