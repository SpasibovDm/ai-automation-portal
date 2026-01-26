import React, { useEffect, useState } from "react";

import {
  createTemplate,
  deleteTemplate,
  getTemplates,
  updateTemplate,
} from "../services/api";

const triggerOptions = ["lead", "email"];

const Settings = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({
    trigger_type: "lead",
    subject_template: "",
    body_template: "",
  });

  const loadTemplates = async () => {
    try {
      const data = await getTemplates();
      setTemplates(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleFormChange = (event) => {
    setFormState((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const created = await createTemplate(formState);
    setTemplates((prev) => [created, ...prev]);
    setFormState({ trigger_type: "lead", subject_template: "", body_template: "" });
  };

  const handleTemplateChange = (id, field, value) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === id ? { ...template, [field]: value } : template
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

  const handleDelete = async (id) => {
    await deleteTemplate(id);
    setTemplates((prev) => prev.filter((template) => template.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Auto-reply settings</h2>
          <p className="text-sm text-slate-500">Manage response templates for leads and emails.</p>
        </div>
      </div>

      <form
        onSubmit={handleCreate}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8"
      >
        <h3 className="text-lg font-semibold text-slate-900">Create template</h3>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Trigger type</label>
            <select
              name="trigger_type"
              value={formState.trigger_type}
              onChange={handleFormChange}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
            >
              {triggerOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Subject template</label>
            <input
              name="subject_template"
              value={formState.subject_template}
              onChange={handleFormChange}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
              placeholder="Thanks, {name}!"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Body template</label>
            <textarea
              name="body_template"
              value={formState.body_template}
              onChange={handleFormChange}
              rows={3}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
              placeholder="We received your inquiry about {source}."
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium"
        >
          Save template
        </button>
      </form>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-semibold text-slate-900">Existing templates</h3>
        {loading ? (
          <p className="text-slate-500 mt-4">Loading templates...</p>
        ) : templates.length === 0 ? (
          <p className="text-slate-500 mt-4">No templates yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="border border-slate-100 rounded-xl p-4 grid gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase text-slate-400">Template #{template.id}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSave(template)}
                      className="text-xs font-medium px-3 py-1 rounded-lg border border-slate-200"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(template.id)}
                      className="text-xs font-medium px-3 py-1 rounded-lg border border-red-200 text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-500">Trigger type</label>
                    <select
                      value={template.trigger_type}
                      onChange={(event) =>
                        handleTemplateChange(template.id, "trigger_type", event.target.value)
                      }
                      className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
                    >
                      {triggerOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">Subject template</label>
                    <input
                      value={template.subject_template}
                      onChange={(event) =>
                        handleTemplateChange(template.id, "subject_template", event.target.value)
                      }
                      className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-slate-500">Body template</label>
                    <textarea
                      value={template.body_template}
                      onChange={(event) =>
                        handleTemplateChange(template.id, "body_template", event.target.value)
                      }
                      rows={3}
                      className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
