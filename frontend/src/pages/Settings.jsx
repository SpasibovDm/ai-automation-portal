import React, { useEffect, useMemo, useState } from "react";

import { PaintbrushIcon, ShieldIcon, ToggleLeftIcon } from "../components/Icons";
import Skeleton from "../components/Skeleton";
import { useToast } from "../components/ToastContext";
import {
  connectEmailIntegration,
  getEmailIntegrationStatus,
  getCompanySettings,
  rotateCompanyKey,
  updateCompanySettings,
} from "../services/api";

const assistantNameKey = "automation-assistant-name";
const brandColorKey = "automation-brand-color";
const companyNameKey = "automation-company-name";

const Settings = () => {
  const [company, setCompany] = useState(null);
  const [formState, setFormState] = useState({
    name: "",
    auto_reply_enabled: true,
    ai_model: "",
    ai_prompt_template: "",
  });
  const [uiSettings, setUiSettings] = useState(() => ({
    assistantName: localStorage.getItem(assistantNameKey) || "Nova",
    brandColor: localStorage.getItem(brandColorKey) || "#4f46e5",
  }));
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
  const { addToast } = useToast();

  const toggledLabel = useMemo(
    () => (formState.auto_reply_enabled ? "Enabled" : "Disabled"),
    [formState.auto_reply_enabled]
  );

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
      localStorage.setItem(companyNameKey, data.name);
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
      localStorage.setItem(companyNameKey, updated.name);
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

  const handleRotate = async () => {
    const updated = await rotateCompanyKey();
    setCompany(updated);
    addToast({
      title: "API key rotated",
      description: "Your webhook key has been regenerated.",
    });
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
      addToast({
        title: "Integration saved",
        description: "Your inbox connection has been updated.",
      });
    } catch (err) {
      setError("Unable to save integration.");
    } finally {
      setIntegrationSaving(false);
    }
  };

  const handleUiSettingsChange = (event) => {
    const { name, value } = event.target;
    setUiSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleUiSettingsSave = () => {
    localStorage.setItem(assistantNameKey, uiSettings.assistantName);
    localStorage.setItem(brandColorKey, uiSettings.brandColor);
    window.dispatchEvent(new Event("assistant-settings-updated"));
    addToast({
      title: "Brand settings saved",
      description: "Your assistant branding has been updated.",
    });
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
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-32" />
        </div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <form
            onSubmit={handleSave}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md space-y-5"
          >
            <div>
              <h3 className="text-sm font-semibold text-slate-700">Company profile</h3>
              <p className="text-xs text-slate-500">Customize how your workspace appears.</p>
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
            <div>
              <label className="text-sm font-medium text-slate-700">AI model</label>
              <input
                name="ai_model"
                value={formState.ai_model}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">AI prompt template</label>
              <textarea
                name="ai_prompt_template"
                value={formState.ai_prompt_template}
                onChange={handleChange}
                rows={5}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save settings"}
            </button>
          </form>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md space-y-4">
              <div className="flex items-center gap-2">
                <ShieldIcon className="h-4 w-4 text-indigo-500" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">API key</h3>
                  <p className="text-xs text-slate-500">
                    Use this key to authenticate webhook requests.
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 break-all">
                {company?.api_key}
              </div>
              <button
                type="button"
                onClick={handleRotate}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Rotate API key
              </button>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md space-y-4">
              <div className="flex items-center gap-2">
                <PaintbrushIcon className="h-4 w-4 text-indigo-500" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">Branding</h3>
                  <p className="text-xs text-slate-500">
                    Update the assistant name and brand color.
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Assistant name</label>
                <input
                  name="assistantName"
                  value={uiSettings.assistantName}
                  onChange={handleUiSettingsChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Brand color</label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="color"
                    name="brandColor"
                    value={uiSettings.brandColor}
                    onChange={handleUiSettingsChange}
                    className="h-10 w-16 cursor-pointer rounded-xl border border-slate-200"
                  />
                  <input
                    name="brandColor"
                    value={uiSettings.brandColor}
                    onChange={handleUiSettingsChange}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleUiSettingsSave}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Save brand settings
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <form
          onSubmit={handleIntegrationSave}
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md space-y-4"
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

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md space-y-4">
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
