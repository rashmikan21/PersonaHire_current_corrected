import { Brain } from 'lucide-react';
import { MCQModulePage } from '@/pages/modules/MCQModulePage';
import { aptitudeQuestions } from '@/data/mockData';
import { useData } from '@/context/DataContext';

export function AptitudePage() {
  const { setScores, scores } = useData();
  const updateScore = (key: 'aptitude', value: number) => {
    setScores({ ...scores, [key]: Math.round((scores[key] + value) / 2) });
  };

  return (
    <MCQModulePage
      title="Aptitude"
      description="Practice quantitative, logical, verbal & data interpretation"
      icon={<Brain size={24} />}
      topics={Object.keys(aptitudeQuestions)}
      questionsByTopic={aptitudeQuestions}
      category="Aptitude"
      scoreKey="aptitude"
      updateScore={updateScore}
    />
  );
}
