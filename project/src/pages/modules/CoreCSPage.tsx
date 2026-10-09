import { Cpu } from 'lucide-react';
import { MCQModulePage } from '@/pages/modules/MCQModulePage';
import { coreCSQuestions } from '@/data/mockData';
import { useData } from '@/context/DataContext';

export function CoreCSPage() {
  const { setScores, scores } = useData();
  const updateScore = (key: 'coreCS', value: number) => {
    setScores({ ...scores, [key]: Math.round((scores[key] + value) / 2) });
  };

  return (
    <MCQModulePage
      title="Core Computer Science"
      description="Master the fundamentals of CS theory"
      icon={<Cpu size={24} />}
      topics={Object.keys(coreCSQuestions)}
      questionsByTopic={coreCSQuestions}
      category="Core CS"
      scoreKey="coreCS"
      updateScore={updateScore}
    />
  );
}
