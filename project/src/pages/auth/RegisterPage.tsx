
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Building2,
  GraduationCap as GradCap,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_URL = 'http://127.0.0.1:5000';

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
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (
      !name ||
      !email ||
      !form.password ||
      !form.college.trim() ||
      !form.degree.trim() ||
      !form.graduationYear
    ) {
      setError('Please fill in all fields.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Could not create your account.');
        return;
      }

      // Save the verified backend identity in the existing auth context.
      // The password is never stored in frontend localStorage.
      login(data.user.email, data.user.name);

      navigate('/profile');
    } catch {
      setError(
        'Cannot connect to the backend. Make sure Flask is running on port 5000.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', icon: User, placeholder: 'Your full name' },
    { key: 'email', label: 'Email', type: 'email', icon: Mail, placeholder: 'you@college.edu' },
    { key: 'password', label: 'Password', type: 'password', icon: Lock, placeholder: 'At least 8 characters' },
    { key: 'college', label: 'College', type: 'text', icon: Building2, placeholder: 'Your college name' },
    { key: 'degree', label: 'Degree', type: 'text', icon: GradCap, placeholder: 'B.Tech / B.E / MCA' },
  ] as const;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-brand-50/30 to-blue-50/40 p-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-200">
            <GraduationCap size={30} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
            PersonaHire
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            AI-Based Personalized Placement Tracking &amp; Interview Simulator
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Create Your Account</h2>
          <p className="mb-6 mt-1 text-sm text-slate-500">
            Start your personalized placement preparation journey
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.key}>
                  <label
                    htmlFor={f.key}
                    className="mb-1.5 block text-sm font-medium text-slate-600"
                  >
                    {f.label}
                  </label>
                  <div className="relative">
                    <Icon
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id={f.key}
                      type={f.type}
                      required
                      minLength={f.key === 'password' ? 8 : undefined}
                      autoComplete={
                        f.key === 'password'
                          ? 'new-password'
                          : f.key === 'email'
                            ? 'email'
                            : f.key === 'name'
                              ? 'name'
                              : 'off'
                      }
                      value={form[f.key]}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                </div>
              );
            })}

            <div>
              <label
                htmlFor="graduationYear"
                className="mb-1.5 block text-sm font-medium text-slate-600"
              >
                Graduation Year
              </label>
              <div className="relative">
                <Calendar
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <select
                  id="graduationYear"
                  required
                  value={form.graduationYear}
                  onChange={(e) => handleChange('graduationYear', e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">Select year</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-md shadow-brand-200 transition-all hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-brand-600 hover:text-brand-700"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Your password is securely hashed by the backend before storage.
        </p>
      </div>
    </div>
  );
}
