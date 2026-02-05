import React, { useEffect, useMemo, useState } from "react";

import { ShieldIcon, ToggleLeftIcon } from "../components/Icons";
import Skeleton from "../components/Skeleton";
import { useToast } from "../components/ToastContext";
import { getCompanySettings, updateCompanySettings } from "../services/api";

const supportEmailKey = "automation-support-email";

const Settings = () => {
  const [company, setCompany] = useState(null);
  const [formState, setFormState] = useState({
    name: "",
    auto_reply_enabled: true,
  });
  const [supportEmail, setSupportEmail] = useState(
    () => localStorage.getItem(supportEmailKey) || "support@company.com"
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { addToast } = useToast();

  const toggledLabel = useMemo(
    () => (formState.auto_reply_enabled ? "Enabled" : "Disabled"),
    [formState.auto_reply_enabled]
  );

  const loadSettings = async () => {
    try {
      const data = await getCompanySettings();
      setCompany(data);
      setFormState({
        name: data.name,
        auto_reply_enabled: data.auto_reply_enabled,
      });
      localStorage.setItem("automation-company-name", data.name);
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
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const updated = await updateCompanySettings(formState);
      setCompany(updated);
      localStorage.setItem("automation-company-name", updated.name);
      localStorage.setItem(supportEmailKey, supportEmail);
      window.dispatchEvent(new Event("assistant-settings-updated"));
      addToast({
        title: "Settings saved",
        description: "Your company settings were updated.",
      });
    } catch (err) {
      setError("Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500">
          Manage workspace details and automation preferences.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-32" />
        </div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : (
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md space-y-5 max-w-2xl"
        >
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Company profile</h3>
            <p className="text-xs text-slate-500">Update the core account settings.</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Company name</label>
            <input
              name="name"
              value={formState.name}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Support email</label>
            <input
              name="supportEmail"
              value={supportEmail}
              onChange={(event) => setSupportEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Auto-reply</p>
                <p className="text-xs text-slate-500">AI replies for inbound messages</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormState((prev) => ({
                    ...prev,
                    auto_reply_enabled: !prev.auto_reply_enabled,
                  }))
                }
                className={`flex h-7 w-12 items-center rounded-full p-1 transition ${
                  formState.auto_reply_enabled ? "bg-indigo-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`h-5 w-5 rounded-full bg-white shadow transition ${
                    formState.auto_reply_enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <ToggleLeftIcon className="h-4 w-4" />
              {toggledLabel}
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldIcon className="h-4 w-4 text-indigo-500" />
              <span>API key available in the admin settings for integrations.</span>
            </div>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
        </form>
      )}
    </div>
  );
};

export default Settings;
