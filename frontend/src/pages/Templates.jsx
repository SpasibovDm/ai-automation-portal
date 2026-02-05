import React, { useEffect, useState } from "react";

import Button from "../components/Button";
import Card from "../components/Card";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";
import { createTemplate, deleteTemplate, getTemplates, updateTemplate } from "../services/api";

const initialFormState = {
  name: "",
  trigger_keywords: "",
  body_template: "",
};

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState(initialFormState);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

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

  const openCreate = () => {
    setEditingTemplate(null);
    setFormState(initialFormState);
    setModalOpen(true);
  };

  const openEdit = (template) => {
    setEditingTemplate(template);
    setFormState({
      name: template.name || "",
      trigger_keywords: template.category || "",
      body_template: template.body_template || "",
    });
    setModalOpen(true);
  };

  const handleChange = (event) => {
    setFormState((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: formState.name,
        category: formState.trigger_keywords,
        trigger_type: "email",
        subject_template: "Re: {subject}",
        body_template: formState.body_template,
      };
      if (editingTemplate) {
        const updated = await updateTemplate(editingTemplate.id, payload);
        setTemplates((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await createTemplate(payload);
        setTemplates((prev) => [created, ...prev]);
      }
      setModalOpen(false);
      setFormState(initialFormState);
    } catch (err) {
      setError("Unable to save template.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (templateId) => {
    await deleteTemplate(templateId);
    setTemplates((prev) => prev.filter((item) => item.id !== templateId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Templates</h2>
          <p className="text-sm text-slate-500">
            Manage AI reply templates for common scenarios.
          </p>
        </div>
        <Button onClick={openCreate}>Create template</Button>
      </div>

      <Card>
        {loading ? (
          <div className="p-6 flex items-center gap-2 text-slate-500">
            <Spinner />
            Loading templates...
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {templates.length ? (
              templates.map((template) => (
                <div key={template.id} className="p-6 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase text-slate-400">Template #{template.id}</p>
                      <p className="text-sm font-semibold text-slate-800 mt-1">
                        {template.name || "Untitled template"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Keywords: {template.category || "Not set"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => openEdit(template)}>
                        Edit
                      </Button>
                      <Button variant="danger" onClick={() => handleDelete(template.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                    {template.body_template}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-sm text-slate-400">No templates yet.</div>
            )}
          </div>
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTemplate ? "Edit template" : "Create template"}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-700">Name</label>
            <input
              name="name"
              value={formState.name}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Inbound sales reply"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Trigger keywords</label>
            <input
              name="trigger_keywords"
              value={formState.trigger_keywords}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="pricing, demo, onboarding"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Reply template text</label>
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
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save template"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Templates;
