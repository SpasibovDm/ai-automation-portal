import React, { useEffect, useMemo, useState } from "react";

import Badge from "../components/Badge";
import Button from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import Skeleton from "../components/Skeleton";
import { useWorkspace } from "../context/WorkspaceContext";
import { createTemplate, deleteTemplate, getTemplates, updateTemplate } from "../services/api";

const initialFormState = {
  name: "",
  trigger_keywords: "",
  subject_template: "Re: {subject}",
  body_template: "",
  tone: "",
};

const defaultSample = {
  name: "Taylor",
  email: "taylor@acme.io",
  company: "Acme Corp",
  subject: "Demo request",
  source: "Website",
};

const Templates = () => {
  const { workspace, userRole, can, getPermissionHint, scopeCollection } = useWorkspace();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState(initialFormState);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [query, setQuery] = useState("");
  const [sample, setSample] = useState(defaultSample);

  const loadTemplates = async () => {
    try {
      const data = await getTemplates();
      setTemplates(scopeCollection(data, { min: 1 }));
    } catch (err) {
      setError("Unable to load templates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [scopeCollection, workspace.id]);

  const openCreate = () => {
    setEditingTemplate(null);
    setFormState(initialFormState);
  };

  const openEdit = (template) => {
    setEditingTemplate(template);
    setFormState({
      name: template.name || "",
      trigger_keywords: template.category || "",
      subject_template: template.subject_template || "Re: {subject}",
      body_template: template.body_template || "",
      tone: template.tone || "",
    });
  };

  const handleChange = (event) => {
    setFormState((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSampleChange = (event) => {
    const { name, value } = event.target;
    setSample((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!can("manage_templates")) {
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: formState.name,
        category: formState.trigger_keywords,
        tone: formState.tone || null,
        trigger_type: "email",
        subject_template: formState.subject_template || "Re: {subject}",
        body_template: formState.body_template,
      };
      if (editingTemplate) {
        const updated = await updateTemplate(editingTemplate.id, payload);
        setTemplates((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setEditingTemplate(updated);
      } else {
        const created = await createTemplate(payload);
        setTemplates((prev) => [created, ...prev]);
        setEditingTemplate(created);
      }
    } catch (err) {
      setError("Unable to save template.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (templateId) => {
    if (!can("manage_templates")) {
      return;
    }
    await deleteTemplate(templateId);
    setTemplates((prev) => prev.filter((item) => item.id !== templateId));
    if (editingTemplate?.id === templateId) {
      openCreate();
    }
  };

  const interpolateTemplate = (text, values) =>
    text.replace(/\{(\w+)\}/g, (match, key) => values[key] || match);

  const renderedSubject = useMemo(
    () => interpolateTemplate(formState.subject_template || "", sample),
    [formState.subject_template, sample]
  );

  const renderedBody = useMemo(
    () => interpolateTemplate(formState.body_template || "", sample),
    [formState.body_template, sample]
  );

  const extractVariables = (text) => {
    const matches = text.match(/\{(\w+)\}/g) || [];
    return Array.from(new Set(matches.map((match) => match.replace(/[{}]/g, ""))));
  };

  const highlightedTemplate = (text) => {
    const parts = text.split(/(\{\w+\})/g);
    return parts.map((part, index) =>
      part.match(/\{\w+\}/g) ? (
        <span
          key={`${part}-${index}`}
          className="rounded-md bg-indigo-100 px-1 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200"
        >
          {part}
        </span>
      ) : (
        <span key={`${part}-${index}`}>{part}</span>
      )
    );
  };

  const filteredTemplates = templates.filter((template) => {
    const search = query.toLowerCase();
    return (
      !search ||
      template.name?.toLowerCase().includes(search) ||
      template.category?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Templates</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage AI reply templates for common scenarios.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default">{workspace.name}</Badge>
          <Badge variant="info">Role: {userRole}</Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            <input
              type="search"
              placeholder="Search templates"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-44 bg-transparent text-sm text-slate-600 focus:outline-none dark:text-slate-200"
            />
          </div>
          <Button
            onClick={openCreate}
            disabled={!can("manage_templates")}
            title={!can("manage_templates") ? getPermissionHint("manage_templates") : undefined}
          >
            New template
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="divide-y divide-slate-100 dark:divide-slate-800">
          <div className="p-5">
            <p className="text-xs uppercase text-slate-400 dark:text-slate-500">
              Library
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {templates.length} templates available
            </p>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={`template-${index}`} className="h-16" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-sm text-red-600">{error}</div>
          ) : filteredTemplates.length ? (
            filteredTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => openEdit(template)}
                className={`w-full p-5 text-left transition ${
                  editingTemplate?.id === template.id
                    ? "bg-indigo-50 dark:bg-indigo-500/10"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase text-slate-400 dark:text-slate-500">
                      Template #{template.id}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                      {template.name || "Untitled template"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Keywords: {template.category || "Not set"}
                    </p>
                  </div>
                  <Badge variant="info">{template.tone || "Adaptive"}</Badge>
                </div>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  {template.body_template}
                </p>
              </button>
            ))
          ) : (
            <div className="p-6">
              <EmptyState
                title="No templates in this workspace"
                description="Template libraries standardize brand voice and reduce manual rewrite time."
                impact="Without templates, response quality varies and approvals take longer."
                icon={<span className="text-xl">+</span>}
                actionLabel="Create template"
                onAction={openCreate}
                actionDisabled={!can("manage_templates")}
                actionHint={getPermissionHint("manage_templates")}
              />
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase text-slate-400 dark:text-slate-500">
                Editor
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                {editingTemplate ? "Edit template" : "Create template"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Preview variables, test sample data, and save.
              </p>
            </div>
            {editingTemplate ? (
              <Button
                variant="danger"
                onClick={() => handleDelete(editingTemplate.id)}
                disabled={!can("manage_templates")}
                title={!can("manage_templates") ? getPermissionHint("manage_templates") : undefined}
              >
                Delete
              </Button>
            ) : null}
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Template name
              </label>
              <input
                name="name"
                value={formState.name}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                placeholder="Inbound sales reply"
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Trigger keywords
                </label>
                <input
                  name="trigger_keywords"
                  value={formState.trigger_keywords}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  placeholder="pricing, demo, onboarding"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Tone
                </label>
                <input
                  name="tone"
                  value={formState.tone}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  placeholder="Professional, Friendly, Brief"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Subject template
              </label>
              <input
                name="subject_template"
                value={formState.subject_template}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                placeholder="Re: {subject}"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Reply template
              </label>
              <textarea
                name="body_template"
                value={formState.body_template}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                rows={6}
                placeholder="Hi {name}, thanks for reaching out..."
                required
              />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {extractVariables(formState.body_template).map((variable) => (
                  <Badge key={variable} variant="info">
                    {variable}
                  </Badge>
                ))}
              </div>
              <Button
                type="submit"
                disabled={saving || !can("manage_templates")}
                title={!can("manage_templates") ? getPermissionHint("manage_templates") : undefined}
              >
                {saving ? "Saving..." : "Save template"}
              </Button>
            </div>
            {!can("manage_templates") ? (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {getPermissionHint("manage_templates")}
              </p>
            ) : null}
          </form>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-xs uppercase text-slate-400 dark:text-slate-500">
                Template preview
              </p>
              <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {highlightedTemplate(formState.subject_template)}
                </p>
                <p className="whitespace-pre-line">{highlightedTemplate(formState.body_template)}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/70">
              <p className="text-xs uppercase text-slate-400 dark:text-slate-500">
                Test with sample data
              </p>
              <div className="mt-3 grid gap-3 text-sm">
                <input
                  name="name"
                  value={sample.name}
                  onChange={handleSampleChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  placeholder="Name"
                />
                <input
                  name="email"
                  value={sample.email}
                  onChange={handleSampleChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  placeholder="Email"
                />
                <input
                  name="company"
                  value={sample.company}
                  onChange={handleSampleChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  placeholder="Company"
                />
                <input
                  name="subject"
                  value={sample.subject}
                  onChange={handleSampleChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  placeholder="Subject"
                />
                <input
                  name="source"
                  value={sample.source}
                  onChange={handleSampleChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  placeholder="Source"
                />
              </div>
              <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-sm text-slate-600 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-100">
                <p className="text-xs uppercase text-indigo-400">Rendered output</p>
                <p className="mt-2 font-semibold">{renderedSubject}</p>
                <p className="mt-2 whitespace-pre-line">{renderedBody}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Templates;
