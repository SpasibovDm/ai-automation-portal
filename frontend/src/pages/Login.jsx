import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { MoonIcon, SunIcon } from "../components/Icons";
import { getErrorMessage } from "../utils/httpError";

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormState((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(formState.email, formState.password);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "Login failed. Please check your credentials."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 app-shell">
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute right-6 top-6 rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
      </button>
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
            AI Automation Portal
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
            Sign in
          </h1>
          <p className="text-sm text-slate-500 mt-2 dark:text-slate-400">
            Use your password to access your automated inbox workspace.
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Email
            </label>
            <input
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:ring-indigo-500/50"
              type="email"
              name="email"
              value={formState.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Password
            </label>
            <input
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:ring-indigo-500/50"
              type="password"
              name="password"
              value={formState.password}
              onChange={handleChange}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 text-white py-2 font-medium hover:bg-indigo-500"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <p className="text-sm text-slate-500 text-center dark:text-slate-400">
            New here?{" "}
            <Link className="text-slate-900 font-medium dark:text-white" to="/register">
              Get started with email
            </Link>
          </p>
          <p className="text-xs text-center text-slate-400 dark:text-slate-500">
            Looking for the demo?{" "}
            <Link className="text-slate-900 font-medium dark:text-white" to="/demo">
              Try demo
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
