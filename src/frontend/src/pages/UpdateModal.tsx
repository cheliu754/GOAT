import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./UpdateModal.css";

import { auth } from "../auth/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

type CustomFieldType = "text" | "number" | "flag";
type CustomField = {
  id: string;
  label: string;
  type: CustomFieldType;
  value: string | number | boolean;
};

type SchoolFromRoute = {
  _id: string;
  INSTNM: string;
  CITY?: string;
  STABBR?: string;
  DEADLINE?: string;
  WEBSITE?: string;
  NOTES?: string;
  extras?: CustomField[];
};

export default function UpdateModal() {
  const navigate = useNavigate();
  const location = useLocation();

  const routeState = location.state as { school?: SchoolFromRoute } | null;
  const school = routeState?.school;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) navigate("/signin");
    });
    return () => {
      unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const [name, setName] = useState(() => school?.INSTNM ?? "");
  const [deadline, setDeadline] = useState(() => school?.DEADLINE ?? today);
  const [locationText, setLocationText] = useState(() => {
    if (school?.CITY && school?.STABBR) return `${school.CITY}, ${school.STABBR}`;
    return "";
  });
  const [website, setWebsite] = useState(() => school?.WEBSITE ?? "");
  const [notes, setNotes] = useState(() => school?.NOTES ?? "");

  const [customFields, setCustomFields] = useState<CustomField[]>(() => {
    if (school?.extras) return school.extras;
    return [];
  });

  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<CustomFieldType>("text");
  const isAddDisabled = useMemo(() => !newLabel.trim(), [newLabel]);

  const addCustomField = () => {
    if (!newLabel.trim()) return;
    setCustomFields((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: newLabel.trim(),
        type: newType,
        value: newType === "text" ? "" : newType === "number" ? 0 : false,
      },
    ]);
    setNewLabel("");
    setNewType("text");
  };

  const removeCustomField = (id: string) =>
    setCustomFields((prev) => prev.filter((f) => f.id !== id));

  const updateFieldMeta = (
    id: string,
    patch: Partial<Pick<CustomField, "label" | "type">>
  ) =>
    setCustomFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch } : f))
    );

  const updateFieldValue = (id: string, v: string | number | boolean) =>
    setCustomFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, value: v } : f))
    );

  const handleSave = () => {
    const payload = {
      schoolId: school?._id ?? null,
      name,
      deadline,
      location: locationText,
      website,
      notes,
      extras: customFields,
    };

    console.log("Record saved:", payload);
    // TODO(backend): replace with real API
    localStorage.setItem("lastUpdateRecord", JSON.stringify(payload));
    navigate(-1);
  };

  const handleFieldUpdate = (field: CustomField) => {
    // Placeholder for future backend patch call per-field
    console.log("Field updated:", field);
    // For now this just logs; full record is saved by the main Save button.
  };

  const close = () => navigate(-1);

  return (
    <div className="modalBackdrop" onClick={close} aria-hidden>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upd-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal__head">
          <h1 id="upd-title" className="modal__title">
            Update Record
          </h1>
          <button className="iconbtn" aria-label="Close" onClick={close}>
            ✕
          </button>
        </header>

        <div className="modal__content">
          <div className="panel">
            <label className="field">
              <span className="field__label">Record Name</span>
              <input
                className="field__input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <div className="grid2">
              <label className="field">
                <span className="field__label">Deadline</span>
                <input
                  className="field__input"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </label>

              <label className="field">
                <span className="field__label">Location</span>
                <input
                  className="field__input"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                />
              </label>
            </div>

            <label className="field">
              <span className="field__label">Website</span>
              <input
                className="field__input"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </label>

            <label className="field">
              <span className="field__label">Notes</span>
              <textarea
                className="field__input field__textarea"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
          </div>

          <div className="panel">
            <h2 className="panel__title">Additional Info</h2>

            {/* Add-new row */}
            <div className="adder">
              <select
                className="field__input adder__type"
                value={newType}
                onChange={(e) =>
                  setNewType(e.target.value as CustomFieldType)
                }
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="flag">Flag (On/Off)</option>
              </select>

              <input
                className="field__input adder__label"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Field name (e.g., SAT Requirement)"
              />

              <button
                className="btn"
                onClick={addCustomField}
                disabled={isAddDisabled}
                type="button"
              >
                Add
              </button>
            </div>

            <ul className="extras">
              {customFields.map((f) => (
                <li key={f.id} className="extra">
                  <div className="extra__top">
                    <select
                      className="field__input extra__type"
                      value={f.type}
                      onChange={(e) =>
                        updateFieldMeta(f.id, {
                          type: e.target.value as CustomFieldType,
                        })
                      }
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="flag">Flag (On/Off)</option>
                    </select>

                    <input
                      className="field__input extra__name"
                      value={f.label}
                      onChange={(e) =>
                        updateFieldMeta(f.id, { label: e.target.value })
                      }
                      placeholder="Field name"
                    />
                  </div>

                  <div className="extra__bottom">
                    <div className="extra__value">
                      {f.type === "text" && (
                        <textarea
                          className="field__input field__textarea"
                          rows={3}
                          value={(f.value as string) ?? ""}
                          onChange={(e) =>
                            updateFieldValue(f.id, e.target.value)
                          }
                          placeholder="Enter text..."
                        />
                      )}

                      {f.type === "number" && (
                        <input
                          className="field__input"
                          type="number"
                          value={Number(f.value) ?? 0}
                          onChange={(e) =>
                            updateFieldValue(f.id, Number(e.target.value))
                          }
                        />
                      )}

                      {f.type === "flag" && (
                        <label className="toggle">
                          <input
                            type="checkbox"
                            checked={Boolean(f.value)}
                            onChange={(e) =>
                              updateFieldValue(f.id, e.target.checked)
                            }
                          />
                          <span className="toggle__ui" />
                          <span className="toggle__text">
                            {Boolean(f.value) ? "Enabled" : "Disabled"}
                          </span>
                        </label>
                      )}
                    </div>

                    <div className="extra__actions">
                      <button
                        type="button"
                        className="btn btn--small"
                        onClick={() => handleFieldUpdate(f)}
                      >
                        Update
                      </button>
                      <button
                        className="iconbtn iconbtn--ghost"
                        type="button"
                        onClick={() => removeCustomField(f.id)}
                        aria-label={`Remove ${f.label}`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <footer className="modal__footer">
          <button className="btn btn--light" type="button" onClick={close}>
            Cancel
          </button>
          <button className="btn" type="button" onClick={handleSave}>
            Save
          </button>
        </footer>
      </section>
    </div>
  );
}
