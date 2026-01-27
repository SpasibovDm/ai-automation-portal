import React, { useEffect, useState } from "react";

import {
  connectEmailIntegration,
  getEmailIntegrationStatus,
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
  const [integrations, setIntegrations] = useState([]);
  const [integrationForm, setIntegrationForm] = useState({
    provider: "gmail",
    email_address: "",
    access_token: "",
    refresh_token: "",
    scopes: "",
  });
  const [integrationSaving, setIntegrationSaving] = useState(false);

  const loadSettings = async () => {
    try {
      const [data, integrationData] = await Promise.all([
        getCompanySettings(),
        getEmailIntegrationStatus(),
      ]);
      setCompany(data);
      setFormState({
        name: data.name,
        auto_reply_enabled: data.auto_reply_enabled,
        ai_model: data.ai_model,
        ai_prompt_template: data.ai_prompt_template,
      });
      setIntegrations(integrationData);
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

  const handleIntegrationChange = (event) => {
    const { name, value } = event.target;
    setIntegrationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleIntegrationSave = async (event) => {
    event.preventDefault();
    setIntegrationSaving(true);
    try {
      const payload = {
        ...integrationForm,
        scopes: integrationForm.scopes
          ? integrationForm.scopes.split(",").map((scope) => scope.trim())
          : undefined,
      };
      await connectEmailIntegration(payload);
      const updated = await getEmailIntegrationStatus();
      setIntegrations(updated);
      setIntegrationForm((prev) => ({ ...prev, access_token: "", refresh_token: "" }));
    } catch (err) {
      setError("Unable to save integration.");
    } finally {
      setIntegrationSaving(false);
    }
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

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <form
          onSubmit={handleIntegrationSave}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4"
        >
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Email integrations</h3>
            <p className="text-xs text-slate-500">
              Connect Gmail or Microsoft 365 accounts via OAuth tokens.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Provider</label>
            <select
              name="provider"
              value={integrationForm.provider}
              onChange={handleIntegrationChange}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
            >
              <option value="gmail">Gmail</option>
              <option value="outlook">Microsoft 365</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Email address</label>
            <input
              name="email_address"
              value={integrationForm.email_address}
              onChange={handleIntegrationChange}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Access token</label>
            <input
              name="access_token"
              value={integrationForm.access_token}
              onChange={handleIntegrationChange}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Refresh token</label>
            <input
              name="refresh_token"
              value={integrationForm.refresh_token}
              onChange={handleIntegrationChange}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Scopes</label>
            <input
              name="scopes"
              value={integrationForm.scopes}
              onChange={handleIntegrationChange}
              placeholder="https://mail.google.com/, Mail.Send"
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={integrationSaving}
            className="w-full rounded-lg bg-slate-900 text-white py-2 text-sm font-medium"
          >
            {integrationSaving ? "Connecting..." : "Save integration"}
          </button>
        </form>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Integration status</h3>
            <p className="text-xs text-slate-500">Live status of connected inboxes.</p>
          </div>
          <div className="space-y-3 text-sm text-slate-600">
            {integrations.length ? (
              integrations.map((integration) => (
                <div
                  key={`${integration.provider}-${integration.email_address}`}
                  className="rounded-lg border border-slate-200 px-3 py-2"
                >
                  <p className="font-medium text-slate-800">
                    {integration.provider.toUpperCase()} · {integration.email_address}
                  </p>
                  <p className="text-xs text-slate-500">
                    Status: {integration.status} · Updated{" "}
                    {new Date(integration.updated_at).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No integrations connected.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
