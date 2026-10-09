import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Building2, Code2, Cpu, Users, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Card } from '@/components/ui/Card';
import { Button, Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { companies, roles } from '@/data/mockData';
import { cn } from '@/utils/cn';
import type { SkillEntry, SkillLevel } from '@/types';

const skillLevels: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

const programmingSkillsList = ['Java', 'Python', 'C/C++', 'JavaScript'];
const technicalSkillsList = ['HTML/CSS', 'Git/GitHub', 'APIs', 'Cloud Basics'];
const coreCSList = ['OOP', 'DBMS', 'SQL', 'Operating Systems', 'Computer Networks', 'Software Engineering'];
const otherSkillsList = ['Communication', 'Problem Solving', 'Critical Thinking', 'Teamwork', 'Leadership', 'Time Management'];

const experienceLevels = ['Fresher (0-1 years)', 'Junior (1-3 years)', 'Mid-level (3-5 years)'];

function SkillSelector({
  skills,
  selected,
  onChange,
}: {
  skills: string[];
  selected: SkillEntry[];
  onChange: (entries: SkillEntry[]) => void;
}) {
  const toggle = (name: string, level: SkillLevel) => {
    const existing = selected.find((s) => s.name === name);
    if (existing && existing.level === level) {
      onChange(selected.filter((s) => s.name !== name));
    } else if (existing) {
      onChange(selected.map((s) => (s.name === name ? { name, level } : s)));
    } else {
      onChange([...selected, { name, level }]);
    }
  };

  return (
    <div className="space-y-2.5">
      {skills.map((skill) => {
        const entry = selected.find((s) => s.name === skill);
        return (
          <div key={skill} className="flex flex-col gap-2 rounded-xl border border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-medium text-slate-700">{skill}</span>
            <div className="flex gap-1.5">
              {skillLevels.map((level) => {
                const isActive = entry?.level === level;
                return (
                  <button
                    key={level}
                    onClick={() => toggle(skill, level)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                      isActive
                        ? level === 'Beginner'
                          ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300'
                          : level === 'Intermediate'
                            ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                            : 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300'
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    )}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ProfilePage() {
  const { user } = useAuth();
  const { profile, setProfile } = useData();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: profile?.name || user?.name || '',
    college: profile?.college || '',
    degree: profile?.degree || '',
    graduationYear: profile?.graduationYear || '2027',
    preferredRole: profile?.preferredRole || roles[0],
    targetCompany: profile?.targetCompany || companies[0],
    experienceLevel: profile?.experienceLevel || experienceLevels[0],
  });

  const [programming, setProgramming] = useState<SkillEntry[]>(profile?.programmingSkills || []);
  const [technical, setTechnical] = useState<SkillEntry[]>(profile?.technicalSkills || []);
  const [coreCS, setCoreCS] = useState<SkillEntry[]>(profile?.coreCSEntry || []);
  const [other, setOther] = useState<SkillEntry[]>(profile?.otherSkills || []);

  const handleSave = () => {
    setProfile({
      ...form,
      email: user?.email || '',
      programmingSkills: programming,
      technicalSkills: technical,
      coreCSEntry: coreCS,
      otherSkills: other,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const totalSkills = programming.length + technical.length + coreCS.length + other.length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Student Profile</h2>
          <p className="text-sm text-slate-500">Build your profile to get personalized recommendations</p>
        </div>
        <Button onClick={handleSave}>
          {saved ? <><CheckCircle2 size={16} /> Saved!</> : <><Save size={16} /> Save Profile</>}
        </Button>
      </div>

      {totalSkills > 0 && (
        <Card className="bg-gradient-to-r from-brand-50 to-blue-50 border-brand-100">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-extrabold text-brand-600">{totalSkills}</div>
            <div>
              <p className="font-semibold text-slate-700">Skills Added</p>
              <p className="text-xs text-slate-500">Select skill levels for all your skills to get accurate readiness scores</p>
            </div>
            <div className="ml-auto">
              <ProgressBar value={totalSkills} max={20} color="brand" showValue />
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Users size={20} className="text-brand-600" />
          <h3 className="font-bold text-slate-800">Personal Information</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Full Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">College</label>
            <input
              value={form.college}
              onChange={(e) => setForm({ ...form, college: e.target.value })}
              placeholder="e.g. IIT Delhi"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Degree</label>
            <input
              value={form.degree}
              onChange={(e) => setForm({ ...form, degree: e.target.value })}
              placeholder="e.g. B.Tech Computer Science"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Graduation Year</label>
            <select
              value={form.graduationYear}
              onChange={(e) => setForm({ ...form, graduationYear: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Briefcase size={20} className="text-brand-600" />
          <h3 className="font-bold text-slate-800">Career Preferences</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Preferred Job Role</label>
            <select
              value={form.preferredRole}
              onChange={(e) => setForm({ ...form, preferredRole: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            >
              {roles.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Target Company</label>
            <select
              value={form.targetCompany}
              onChange={(e) => setForm({ ...form, targetCompany: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            >
              {companies.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Experience Level</label>
            <select
              value={form.experienceLevel}
              onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            >
              {experienceLevels.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Code2 size={20} className="text-brand-600" />
          <h3 className="font-bold text-slate-800">Programming Skills</h3>
          <Badge variant="brand">{programming.length} selected</Badge>
        </div>
        <SkillSelector skills={programmingSkillsList} selected={programming} onChange={setProgramming} />
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Building2 size={20} className="text-brand-600" />
          <h3 className="font-bold text-slate-800">Technical Skills</h3>
          <Badge variant="brand">{technical.length} selected</Badge>
        </div>
        <SkillSelector skills={technicalSkillsList} selected={technical} onChange={setTechnical} />
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Cpu size={20} className="text-brand-600" />
          <h3 className="font-bold text-slate-800">Core Computer Science</h3>
          <Badge variant="brand">{coreCS.length} selected</Badge>
        </div>
        <SkillSelector skills={coreCSList} selected={coreCS} onChange={setCoreCS} />
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Users size={20} className="text-brand-600" />
          <h3 className="font-bold text-slate-800">Other Skills</h3>
          <Badge variant="brand">{other.length} selected</Badge>
        </div>
        <SkillSelector skills={otherSkillsList} selected={other} onChange={setOther} />
      </Card>

      <div className="flex justify-end gap-3 pb-4">
        <Button variant="outline" onClick={() => navigate('/dashboard')}>Cancel</Button>
        <Button onClick={handleSave}>
          {saved ? <><CheckCircle2 size={16} /> Saved!</> : <><Save size={16} /> Save Profile</>}
        </Button>
      </div>
    </div>
  );
}
