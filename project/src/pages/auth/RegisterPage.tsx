import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, Building2, GraduationCap as GradCap, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    degree: '',
    graduationYear: '',
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.college || !form.degree || !form.graduationYear) {
      setError('Please fill in all fields');
      return;
    }
    register(form.name, form.email);
    navigate('/profile');
  };

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', icon: User, placeholder: 'John Doe' },
    { key: 'email', label: 'Email', type: 'email', icon: Mail, placeholder: 'you@college.edu' },
    { key: 'password', label: 'Password', type: 'password', icon: Lock, placeholder: 'Create a password' },
    { key: 'college', label: 'College', type: 'text', icon: Building2, placeholder: 'Your college name' },
    { key: 'degree', label: 'Degree', type: 'text', icon: GradCap, placeholder: 'B.Tech / B.E / MCA' },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-brand-50/30 to-blue-50/40 p-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-200">
            <GraduationCap size={30} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">PersonaHire</h1>
          <p className="mt-1.5 text-sm text-slate-500">AI-Based Personalized Placement Tracking & Interview Simulator</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Create Your Account</h2>
          <p className="mb-6 mt-1 text-sm text-slate-500">Start your personalized placement preparation journey</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.key}>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600">{f.label}</label>
                  <div className="relative">
                    <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={f.type}
                      value={form[f.key as keyof typeof form]}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                </div>
              );
            })}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">Graduation Year</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={form.graduationYear}
                  onChange={(e) => handleChange('graduationYear', e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">Select year</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="2025">2025</option>
                </select>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-700 shadow-md shadow-brand-200"
            >
              Create Account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          This is a college MVP project with mock data. No real authentication is performed.
        </p>
      </div>
    </div>
  );
}
