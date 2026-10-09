import { useState } from 'react';
import { Briefcase, Building2, Code2, Edit3, GraduationCap, Mail, Save, UserRound, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Card } from '@/components/ui/Card';
import { Badge, Button } from '@/components/ui/Badge';
import { companies, roles } from '@/data/mockData';
import type { SkillEntry } from '@/types';

const allSkillNames = ['Java', 'Python', 'C/C++', 'JavaScript', 'HTML/CSS', 'Git/GitHub', 'APIs', 'Cloud Basics', 'OOP', 'DBMS', 'SQL', 'Operating Systems', 'Computer Networks', 'Software Engineering', 'Communication', 'Problem Solving', 'Critical Thinking', 'Teamwork', 'Leadership', 'Time Management'];
const levels = ['Beginner', 'Intermediate', 'Advanced'] as const;

export function ProfilePage() {
  const { user } = useAuth();
  const { profile, setProfile } = useData();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const currentSkills: SkillEntry[] = [
    ...(profile?.programmingSkills ?? []),
    ...(profile?.technicalSkills ?? []),
    ...(profile?.coreCSEntry ?? []),
    ...(profile?.otherSkills ?? []),
  ];

  const [form, setForm] = useState(() => ({
    name: profile?.name || user?.name || 'Student',
    college: profile?.college || '',
    degree: profile?.degree || '',
    graduationYear: profile?.graduationYear || '2027',
    preferredRole: profile?.preferredRole || roles[0],
    targetCompany: profile?.targetCompany || companies[0],
    experienceLevel: profile?.experienceLevel || 'Fresher (0-1 years)',
  }));
  const [skills, setSkills] = useState<SkillEntry[]>(currentSkills);

  const save = () => {
    const groups = (names: string[]) => skills.filter((s) => names.includes(s.name));
    setProfile({
      ...form,
      email: user?.email || profile?.email || '',
      programmingSkills: groups(['Java', 'Python', 'C/C++', 'JavaScript']),
      technicalSkills: groups(['HTML/CSS', 'Git/GitHub', 'APIs', 'Cloud Basics']),
      coreCSEntry: groups(['OOP', 'DBMS', 'SQL', 'Operating Systems', 'Computer Networks', 'Software Engineering']),
      otherSkills: groups(['Communication', 'Problem Solving', 'Critical Thinking', 'Teamwork', 'Leadership', 'Time Management']),
    });
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2200);
  };

  const toggleSkill = (name: string) => {
    const existing = skills.find((s) => s.name === name);
    if (!existing) setSkills((prev) => [...prev, { name, level: 'Intermediate' }]);
    else setSkills((prev) => prev.filter((s) => s.name !== name));
  };

  const setSkillLevel = (name: string, level: SkillEntry['level']) => {
    setSkills((prev) => prev.map((s) => s.name === name ? { ...s, level } : s));
  };

  const initials = (form.name || 'S').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">You / Profile</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-800">Your Profile</h2>
          <p className="mt-1 text-sm text-slate-500">Keep your details current so recommendations stay relevant.</p>
        </div>
        <Button onClick={() => setEditing((v) => !v)} variant={editing ? 'outline' : 'primary'}>
          {editing ? <><X size={16} /> Cancel</> : <><Edit3 size={16} /> Edit Profile</>}
        </Button>
      </div>

      <Card>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand-100 text-2xl font-extrabold text-brand-700">{initials}</div>
          <div className="min-w-0">
            <h3 className="text-2xl font-bold text-slate-800">{form.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{form.preferredRole}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="default"><Mail size={13} /> {user?.email || profile?.email || 'Add email'}</Badge>
              <Badge variant="brand"><Building2 size={13} /> {form.targetCompany}</Badge>
            </div>
          </div>
        </div>
      </Card>

      {!editing ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card><div className="flex items-start gap-3"><GraduationCap className="mt-0.5 text-brand-600" size={20}/><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Education</p><p className="mt-1 font-semibold text-slate-700">{form.degree || 'Add your degree'}</p><p className="text-sm text-slate-500">{form.college || 'Add your college'} · Class of {form.graduationYear}</p></div></div></Card>
            <Card><div className="flex items-start gap-3"><Briefcase className="mt-0.5 text-brand-600" size={20}/><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Career</p><p className="mt-1 font-semibold text-slate-700">{form.preferredRole}</p><p className="text-sm text-slate-500">Target: {form.targetCompany}</p></div></div></Card>
          </div>
          <Card>
            <div className="mb-4 flex items-center gap-2"><Code2 size={20} className="text-brand-600"/><div><h3 className="font-bold text-slate-800">Skills</h3><p className="text-xs text-slate-500">Your selected placement skills</p></div></div>
            <div className="flex flex-wrap gap-2">
              {skills.length ? skills.map((s) => <Badge key={s.name} variant="default">{s.name} · {s.level}</Badge>) : <p className="text-sm text-slate-400">No skills added yet.</p>}
            </div>
          </Card>
        </>
      ) : (
        <Card>
          <div className="mb-5 flex items-center gap-2"><UserRound size={20} className="text-brand-600"/><h3 className="font-bold text-slate-800">Edit Profile</h3></div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['name','Full Name'],['college','College'],['degree','Degree'],['graduationYear','Graduation Year']
            ].map(([key,label]) => <div key={key}><label className="mb-1.5 block text-sm font-medium text-slate-600">{label}</label><input value={form[key as keyof typeof form]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400" /></div>)}
            <div><label className="mb-1.5 block text-sm font-medium text-slate-600">Preferred Job Role</label><select value={form.preferredRole} onChange={(e) => setForm({ ...form, preferredRole:e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">{roles.map((r)=><option key={r}>{r}</option>)}</select></div>
            <div><label className="mb-1.5 block text-sm font-medium text-slate-600">Target Company</label><select value={form.targetCompany} onChange={(e) => setForm({ ...form, targetCompany:e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">{companies.map((c)=><option key={c}>{c}</option>)}</select></div>
          </div>

          <div className="mt-6"><p className="mb-3 text-sm font-bold text-slate-700">Skills</p><div className="space-y-2">{allSkillNames.map((name) => { const selected = skills.find((s) => s.name === name); return <div key={name} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 p-3"><button onClick={() => toggleSkill(name)} className={`text-sm font-semibold ${selected ? 'text-brand-700' : 'text-slate-500'}`}>{selected ? '✓ ' : '+ '}{name}</button>{selected && <div className="flex gap-1">{levels.map((level) => <button key={level} onClick={() => setSkillLevel(name, level)} className={`rounded-lg px-2.5 py-1 text-xs ${selected.level === level ? 'bg-brand-100 text-brand-700' : 'bg-slate-50 text-slate-400'}`}>{level}</button>)}</div>}</div>})}</div></div>
          <div className="mt-6 flex justify-end"><Button onClick={save}>{saved ? <><CheckCircle2 size={16}/> Saved</> : <><Save size={16}/> Save Profile</>}</Button></div>
        </Card>
      )}
    </div>
  );
}
