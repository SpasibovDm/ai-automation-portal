import React, { useEffect, useState } from "react";

import Button from "../components/Button";
import Card from "../components/Card";
import Spinner from "../components/Spinner";
import { createTemplate, deleteTemplate, getTemplates, updateTemplate } from "../services/api";

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({
    name: "",
    category: "sales",
    tone: "Professional",
    subject_template: "Re: {subject}",
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
        subject_template: formState.subject_template || formState.name,
      });
      setTemplates((prev) => [created, ...prev]);
      setFormState({
        name: "",
        category: "sales",
        tone: "Professional",
        subject_template: "Re: {subject}",
        body_template: "",
      });
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
      subject_template: template.subject_template || template.name || "Re: {subject}",
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
        <Card>
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
            <div className="p-6 flex items-center gap-2 text-slate-500">
              <Spinner />
              Loading templates...
            </div>
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
                        <Button
                          onClick={() => handleSave(template)}
                          variant="secondary"
                          className="rounded-lg px-3 py-1 text-xs"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => handleDelete(template.id)}
                          variant="danger"
                          className="rounded-lg px-3 py-1 text-xs"
                        >
                          Delete
                        </Button>
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
                      <div>
                        <label className="text-xs text-slate-500">Subject template</label>
                        <input
                          value={template.subject_template || "Re: {subject}"}
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
        </Card>
        <Card className="p-6">
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
              <label className="text-sm font-medium text-slate-600">Subject template</label>
              <input
                name="subject_template"
                value={formState.subject_template}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Re: {subject}"
                required
              />
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
            <Button
              type="submit"
              className="w-full rounded-lg py-2 text-sm font-medium"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save template"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Templates;
