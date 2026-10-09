import { Wrench } from 'lucide-react';
import { MCQModulePage } from '@/pages/modules/MCQModulePage';
import { technicalSkillQuestions } from '@/data/mockData';
import { useData } from '@/context/DataContext';

export function TechnicalSkillsPage() {
  const { setScores, scores } = useData();
  const updateScore = (key: 'technical', value: number) => {
    setScores({ ...scores, [key]: Math.round((scores[key] + value) / 2) });
  };

  return (
    <MCQModulePage
      title="Technical Skills"
      description="Programming languages, tools, and technologies"
      icon={<Wrench size={24} />}
      topics={Object.keys(technicalSkillQuestions)}
      questionsByTopic={technicalSkillQuestions}
      category="Technical"
      scoreKey="technical"
      updateScore={updateScore}
    />
  );
}
