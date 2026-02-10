import React, { useEffect, useMemo, useState } from "react";

import { ShieldIcon, ToggleLeftIcon } from "../components/Icons";
import Skeleton from "../components/Skeleton";
import { useToast } from "../components/ToastContext";
import { getCompanySettings, updateCompanySettings, updatePassword } from "../services/api";

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
  const [passwordState, setPasswordState] = useState({ password: "", confirm: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
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

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordState((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError("");
    if (passwordState.password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (passwordState.password !== passwordState.confirm) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setPasswordSaving(true);
    try {
      await updatePassword({ password: passwordState.password });
      setPasswordState({ password: "", confirm: "" });
      addToast({
        title: "Password set",
        description: "Your password was saved for future logins.",
      });
    } catch (err) {
      setPasswordError("Unable to update password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
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
        <div className="space-y-6">
          <form
            onSubmit={handleSave}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md space-y-5 max-w-2xl dark:border-slate-800 dark:bg-slate-900/80"
          >
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Company profile
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update the core account settings.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Company name
              </label>
              <input
                name="name"
                value={formState.name}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Support email
              </label>
              <input
                name="supportEmail"
                value={supportEmail}
                onChange={(event) => setSupportEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Auto-reply
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    AI replies for inbound messages
                  </p>
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
                    formState.auto_reply_enabled
                      ? "bg-indigo-600"
                      : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full bg-white shadow transition ${
                      formState.auto_reply_enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <ToggleLeftIcon className="h-4 w-4" />
                {toggledLabel}
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
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

          <form
            onSubmit={handlePasswordSubmit}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md space-y-4 max-w-2xl dark:border-slate-800 dark:bg-slate-900/80"
          >
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Password (optional)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Set a password for backup access. Magic links remain the primary login method.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                New password
              </label>
              <input
                name="password"
                type="password"
                value={passwordState.password}
                onChange={handlePasswordChange}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Confirm password
              </label>
              <input
                name="confirm"
                type="password"
                value={passwordState.confirm}
                onChange={handlePasswordChange}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            </div>
            {passwordError ? <p className="text-sm text-red-600">{passwordError}</p> : null}
            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              disabled={passwordSaving}
            >
              {passwordSaving ? "Saving..." : "Set password"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Settings;
