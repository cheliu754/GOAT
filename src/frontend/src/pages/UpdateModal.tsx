import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function UpdateModal() {
  const navigate = useNavigate();

  // ✅ 未登录就跳转到 /signin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/signin");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Sample form state
  const [name, setName] = useState("Stanford University");
  const [deadline, setDeadline] = useState<string>("2025-12-05");
  const [location, setLocation] = useState("Stanford, CA");
  const [website, setWebsite] = useState("https://www.stanford.edu/");
  const [notes, setNotes] = useState("");

  const [customFields, setCustomFields] = useState<CustomField[]>([
    {
      id: crypto.randomUUID(),
      label: "SAT Requirement",
      type: "number",
      value: 1500,
    },
    {
      id: crypto.randomUUID(),
      label: "Enable Notification",
      type: "flag",
      value: true,
    },
  ]);

  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<CustomFieldType>("text");
  const isAddDisabled = useMemo(() => !newLabel.trim(), [newLabel]);

  const addCustomField = () => {
    if (!newLabel.trim()) return;
    const id = crypto.randomUUID();
    const defaultValue =
      newType === "text" ? "" : newType === "number" ? 0 : false;
    setCustomFields((prev) => [
      ...prev,
      { id, label: newLabel.trim(), type: newType, value: defaultValue },
    ]);
    setNewLabel("");
    setNewType("text");
  };

  const removeCustomField = (id: string) =>
    setCustomFields((prev) => prev.filter((f) => f.id !== id));

  const updateFieldValue = (id: string, v: string | number | boolean) =>
    setCustomFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, value: v } : f))
    );

  const handleSave = () => {
    const payload = { name, deadline, location, website, notes, extras: customFields };
    console.log("Record saved:", payload);
    localStorage.setItem("lastUpdateRecord", JSON.stringify(payload));
    navigate(-1); // close modal back to dashboard
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
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
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

            <div className="adder">
              <input
                className="field__input adder__label"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Field label (e.g., SAT Requirement)"
              />
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
              <button
                className="btn"
                onClick={addCustomField}
                disabled={isAddDisabled}
                type="button"
              >
                Add More
              </button>
            </div>

            <ul className="extras">
              {customFields.map((f) => (
                <li key={f.id} className="extra">
                  <div className="extra__row">
                    <div className="extra__label">{f.label}</div>
                    <button
                      className="iconbtn"
                      onClick={() => removeCustomField(f.id)}
                      aria-label={`Remove ${f.label}`}
                    >
                      ✕
                    </button>
                  </div>

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
