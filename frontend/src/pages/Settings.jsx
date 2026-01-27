import React, { useEffect, useState } from "react";

import {
  getCompanySettings,
  rotateCompanyKey,
  updateCompanySettings,
} from "../services/api";

const Settings = () => {
  const [company, setCompany] = useState(null);
  const [formState, setFormState] = useState({
    name: "",
    auto_reply_enabled: true,
    ai_model: "",
    ai_prompt_template: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadSettings = async () => {
    try {
      const data = await getCompanySettings();
      setCompany(data);
      setFormState({
        name: data.name,
        auto_reply_enabled: data.auto_reply_enabled,
        ai_model: data.ai_model,
        ai_prompt_template: data.ai_prompt_template,
      });
    } catch (err) {
      setError("Unable to load company settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const updated = await updateCompanySettings(formState);
      setCompany(updated);
    } catch (err) {
      setError("Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleRotate = async () => {
    const updated = await rotateCompanyKey();
    setCompany(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Company settings</h2>
        <p className="text-sm text-slate-500">
          Manage workspace details, API keys, and AI automation controls.
        </p>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading settings...</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-slate-700">Company name</label>
              <input
                name="name"
                value={formState.name}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">AI model</label>
              <input
                name="ai_model"
                value={formState.ai_model}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">AI prompt template</label>
              <textarea
                name="ai_prompt_template"
                value={formState.ai_prompt_template}
                onChange={handleChange}
                rows={5}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                name="auto_reply_enabled"
                checked={formState.auto_reply_enabled}
                onChange={handleChange}
                className="rounded border-slate-300"
              />
              Enable auto-replies
            </label>
            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 text-white py-2 text-sm font-medium"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save settings"}
            </button>
          </form>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">API key</h3>
              <p className="text-xs text-slate-500">
                Use this key to authenticate webhook requests.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 break-all">
              {company?.api_key}
            </div>
            <button
              type="button"
              onClick={handleRotate}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
            >
              Rotate API key
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
