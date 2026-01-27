import React, { useEffect, useState } from "react";

import { createTemplate, deleteTemplate, getTemplates, updateTemplate } from "../services/api";

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({
    trigger_type: "email",
    subject_template: "",
    body_template: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadTemplates = async () => {
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (err) {
      setError("Unable to load templates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleChange = (event) => {
    setFormState((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const created = await createTemplate(formState);
      setTemplates((prev) => [created, ...prev]);
      setFormState({ trigger_type: "email", subject_template: "", body_template: "" });
    } catch (err) {
      setError("Unable to save template.");
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateChange = (templateId, field, value) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === templateId ? { ...template, [field]: value } : template
      )
    );
  };

  const handleSave = async (template) => {
    const updated = await updateTemplate(template.id, {
      trigger_type: template.trigger_type,
      subject_template: template.subject_template,
      body_template: template.body_template,
    });
    setTemplates((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleDelete = async (templateId) => {
    await deleteTemplate(templateId);
    setTemplates((prev) => prev.filter((item) => item.id !== templateId));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Auto-reply templates</h2>
        <p className="text-sm text-slate-500">
          Configure AI-aware templates for leads and inbound emails.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700">Saved templates</h3>
          </div>
          {loading ? (
            <div className="p-6 text-slate-500">Loading templates...</div>
          ) : error ? (
            <div className="p-6 text-sm text-red-600">{error}</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {templates.length ? (
                templates.map((template) => (
                  <div key={template.id} className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase text-slate-400">Template #{template.id}</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSave(template)}
                          className="rounded-lg border border-slate-200 px-3 py-1 text-xs text-slate-600"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(template.id)}
                          className="rounded-lg border border-slate-200 px-3 py-1 text-xs text-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="text-xs text-slate-500">Trigger</label>
                        <select
                          value={template.trigger_type}
                          onChange={(event) =>
                            handleTemplateChange(template.id, "trigger_type", event.target.value)
                          }
                          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        >
                          <option value="email">Incoming email</option>
                          <option value="lead">New lead</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">Subject</label>
                        <input
                          value={template.subject_template}
                          onChange={(event) =>
                            handleTemplateChange(
                              template.id,
                              "subject_template",
                              event.target.value
                            )
                          }
                          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs text-slate-500">Body</label>
                        <textarea
                          value={template.body_template}
                          onChange={(event) =>
                            handleTemplateChange(
                              template.id,
                              "body_template",
                              event.target.value
                            )
                          }
                          rows={4}
                          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-sm text-slate-400">No templates yet.</div>
              )}
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-sm font-semibold text-slate-700">New template</h3>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium text-slate-600">Trigger</label>
              <select
                name="trigger_type"
                value={formState.trigger_type}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="email">Incoming email</option>
                <option value="lead">New lead</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Subject template</label>
              <input
                name="subject_template"
                value={formState.subject_template}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Re: {{subject}}"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Body template</label>
              <textarea
                name="body_template"
                value={formState.body_template}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                rows={6}
                placeholder="Hi {{name}}, thanks for reaching out..."
                required
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 text-white py-2 text-sm font-medium"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save template"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Templates;
