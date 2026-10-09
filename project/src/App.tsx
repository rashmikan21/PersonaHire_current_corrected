import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth, AuthProvider } from '@/context/AuthContext';
import { DataProvider, useData } from '@/context/DataContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge, Button } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Building2, CheckCircle2, Rocket, Settings, Target, TrendingUp } from 'lucide-react';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AptitudePage } from '@/pages/modules/AptitudePage';
import { CodingPage } from '@/pages/modules/CodingPage';
import { CoreCSPage } from '@/pages/modules/CoreCSPage';
import { TechnicalSkillsPage } from '@/pages/modules/TechnicalSkillsPage';
import { ProfessionalSkillsPage } from '@/pages/modules/ProfessionalSkillsPage';
import { AIInterviewPage } from '@/pages/AIInterviewPage';
import { RecoveryPlanPage } from '@/pages/RecoveryPlanPage';
import { ReAssessmentPage } from '@/pages/ReAssessmentPage';
import { ReadinessPage } from '@/pages/ReadinessPage';
import { WeaknessPage } from '@/pages/WeaknessPage';
import { companies, companyData } from '@/data/mockData';
import { ProgressPage } from '@/pages/ProgressPage';

function ProtectedRoute() {
  const { user } = useAuth();
  return user ? <DashboardLayout /> : <Navigate to="/login" replace />;
}

function SimulationPage() {
  const navigate = useNavigate();
  const { scores } = useData();
  const rounds = [
    ['Aptitude', scores.aptitude, '/aptitude'],
    ['Coding & DSA', scores.coding, '/coding'],
    ['Core CS', scores.coreCS, '/core-cs'],
    ['AI Technical Interview', scores.aiInterview, '/interview'],
    ['Professional / HR', scores.professional, '/professional'],
  ] as const;
  const overall = Math.round(rounds.reduce((s, r) => s + r[1], 0) / rounds.length);
  return <div className="mx-auto max-w-5xl space-y-6">
    <Card className="bg-gradient-to-r from-brand-600 to-brand-700 text-white"><div className="flex items-start gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20"><Rocket size={25}/></div><div><h2 className="text-xl font-bold">Full Placement Simulation</h2><p className="mt-1 text-sm text-brand-50">Complete all placement rounds and get a final readiness report.</p></div></div></Card>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{rounds.map(([name, score, path], i) => <Card key={name} hover onClick={() => navigate(path)} className="cursor-pointer"><div className="text-xs font-semibold text-slate-400">ROUND {i + 1}</div><h3 className="mt-2 text-sm font-bold text-slate-700">{name}</h3><p className="mt-3 text-2xl font-extrabold text-brand-600">{score}%</p></Card>)}</div>
    <Card><div className="flex items-center justify-between"><div><h3 className="font-bold text-slate-800">Simulation Result</h3><p className="text-sm text-slate-500">Based on your current assessment scores.</p></div><div className="text-3xl font-extrabold text-brand-600">{overall}%</div></div><div className="mt-4"><ProgressBar value={overall} label="Overall performance" showValue color="brand" size="lg"/></div><div className="mt-5 flex gap-3"><Button onClick={() => navigate('/readiness')}><Target size={16}/> View Readiness</Button><Button variant="outline" onClick={() => navigate('/recovery')}>Improve Weak Areas</Button></div></Card>
  </div>;
}

function CompanyPage() {
  const { profile } = useData();
  const company = profile?.targetCompany || companies[0];
  const values = companyData[company] || companyData[companies[0]];
  const categories = Object.entries(values).map(([key, value]) => ({ label: key === 'coreCS' ? 'Core CS' : key.charAt(0).toUpperCase() + key.slice(1), value }));
  const overall = Math.round(categories.reduce((s, c) => s + c.value, 0) / categories.length);
  return <div className="mx-auto max-w-5xl space-y-6">
    <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white"><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10"><Building2/></div><div><h2 className="text-xl font-bold">{company} Readiness</h2><p className="text-sm text-slate-300">Preparation estimate for your selected target company.</p></div></div></Card>
    <Card><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Company Readiness Score</p><p className="text-4xl font-extrabold text-brand-600">{overall}%</p></div><Badge variant={overall >= 70 ? 'success' : 'warning'}>{overall >= 70 ? 'Strong' : 'Needs Practice'}</Badge></div><div className="mt-6 space-y-4">{categories.map(c => <ProgressBar key={c.label} value={c.value} label={c.label} showValue color={c.value >= 70 ? 'success' : c.value >= 55 ? 'warning' : 'error'}/>)}</div></Card>
    <p className="text-xs text-slate-400">This is a preparation/readiness estimate, not a prediction of actual hiring outcomes.</p>
  </div>;
}

function SettingsPage() {
  const { user, logout } = useAuth();
  return <div className="mx-auto max-w-3xl space-y-6"><Card><div className="flex items-center gap-3"><Settings className="text-brand-600"/><div><h2 className="text-xl font-bold text-slate-800">Settings</h2><p className="text-sm text-slate-500">Manage your local MVP account preferences.</p></div></div><div className="mt-6 rounded-xl bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-700">Signed in as</p><p className="text-sm text-slate-500">{user?.name} · {user?.email}</p></div><Button className="mt-5" variant="outline" onClick={logout}>Sign out</Button></Card></div>;
}

function AppRoutes() {
  return <Routes>
    <Route path="/" element={<Navigate to="/login" replace/>}/>
    <Route path="/login" element={<LoginPage/>}/>
    <Route path="/register" element={<RegisterPage/>}/>
    <Route element={<ProtectedRoute/>}>
      <Route path="/dashboard" element={<DashboardPage/>}/><Route path="/profile" element={<ProfilePage/>}/><Route path="/aptitude" element={<AptitudePage/>}/><Route path="/coding" element={<CodingPage/>}/><Route path="/core-cs" element={<CoreCSPage/>}/><Route path="/technical" element={<TechnicalSkillsPage/>}/><Route path="/professional" element={<ProfessionalSkillsPage/>}/><Route path="/interview" element={<AIInterviewPage/>}/><Route path="/simulation" element={<SimulationPage/>}/><Route path="/recovery" element={<RecoveryPlanPage/>}/><Route path="/progress" element={<ProgressPage/>}/><Route path="/company" element={<CompanyPage/>}/><Route path="/readiness" element={<ReadinessPage/>}/><Route path="/weakness" element={<WeaknessPage/>}/><Route path="/reassessment" element={<ReAssessmentPage/>}/><Route path="/settings" element={<SettingsPage/>}/>
    </Route>
    <Route path="*" element={<Navigate to="/login" replace/>}/>
  </Routes>;
}

function App() { return <BrowserRouter><AuthProvider><DataProvider><AppRoutes/></DataProvider></AuthProvider></BrowserRouter>; }
export default App;
