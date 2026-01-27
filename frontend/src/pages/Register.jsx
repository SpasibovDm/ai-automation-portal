import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { register } from "../services/api";

const Register = () => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    company_name: "",
    email: "",
    password: "",
  });
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
      await register(formState);
      navigate("/login");
    } catch (err) {
      setError("Registration failed. Try a different email or company name.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Create your workspace</h1>
        <p className="text-sm text-slate-500 mt-2">
          Set up a secure company space and invite your team.
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-700">Company name</label>
            <input
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
              type="text"
              name="company_name"
              value={formState.company_name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Work email</label>
            <input
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
              type="email"
              name="email"
              value={formState.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
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
            className="w-full rounded-lg bg-slate-900 text-white py-2 font-medium hover:bg-slate-800"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create account"}
          </button>
          <p className="text-sm text-slate-500 text-center">
            Already have access?{" "}
            <Link className="text-slate-900 font-medium" to="/login">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
