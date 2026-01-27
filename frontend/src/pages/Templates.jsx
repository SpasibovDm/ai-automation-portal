import React, { useEffect, useState } from "react";

import { createTemplate, deleteTemplate, getTemplates, updateTemplate } from "../services/api";

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({
    name: "",
    category: "sales",
    tone: "Professional",
    body_template: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categoryOptions = ["sales", "support", "follow-up"];

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
      const created = await createTemplate({
        ...formState,
        trigger_type: "email",
        subject_template: formState.name,
      });
      setTemplates((prev) => [created, ...prev]);
      setFormState({ name: "", category: "sales", tone: "Professional", body_template: "" });
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
      name: template.name,
      category: template.category,
      tone: template.tone,
      trigger_type: template.trigger_type || "email",
      subject_template: template.name || template.subject_template,
      body_template: template.body_template,
    });
    setTemplates((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleDelete = async (templateId) => {
    await deleteTemplate(templateId);
    setTemplates((prev) => prev.filter((item) => item.id !== templateId));
  };

  const filteredTemplates = templates.filter((template) => {
    if (categoryFilter === "all") {
      return true;
    }
    return (template.category || "sales") === categoryFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">AI response templates</h2>
        <p className="text-sm text-slate-500">
          Curate responses with structured tone, category, and variables.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-700">Saved templates</h3>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600"
            >
              <option value="all">All categories</option>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          {loading ? (
            <div className="p-6 text-slate-500">Loading templates...</div>
          ) : error ? (
            <div className="p-6 text-sm text-red-600">{error}</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTemplates.length ? (
                filteredTemplates.map((template) => (
                  <div key={template.id} className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase text-slate-400">
                          Template #{template.id}
                        </p>
                        <p className="text-sm font-semibold text-slate-800 mt-1">
                          {template.name || template.subject_template || "Untitled template"}
                        </p>
                      </div>
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
                        <label className="text-xs text-slate-500">Name</label>
                        <input
                          value={template.name || template.subject_template || ""}
                          onChange={(event) =>
                            handleTemplateChange(template.id, "name", event.target.value)
                          }
                          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">Category</label>
                        <select
                          value={template.category || "sales"}
                          onChange={(event) =>
                            handleTemplateChange(template.id, "category", event.target.value)
                          }
                          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        >
                          {categoryOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">Tone</label>
                        <input
                          value={template.tone || "Professional"}
                          onChange={(event) =>
                            handleTemplateChange(template.id, "tone", event.target.value)
                          }
                          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs text-slate-500">
                          Template body (variables supported)
                        </label>
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
          <h3 className="text-sm font-semibold text-slate-700">New response template</h3>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium text-slate-600">Template name</label>
              <input
                name="name"
                value={formState.name}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Inbound sales follow-up"
                required
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-600">Category</label>
                <select
                  name="category"
                  value={formState.category}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Tone</label>
                <input
                  name="tone"
                  value={formState.tone}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Professional, warm, concise"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">
                Template body with variables
              </label>
              <textarea
                name="body_template"
                value={formState.body_template}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                rows={6}
                placeholder="Hi {{name}}, thanks for reaching out about {{topic}}..."
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
