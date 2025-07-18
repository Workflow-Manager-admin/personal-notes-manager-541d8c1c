import React, { useState, useEffect } from "react";
import "./App.css";
import "./notes.css";

/**
 * Modern Minimal Note-Taking App (SPA)
 * Features: View, Create, Edit, Delete Notes, Persistent to localStorage.
 * Sidebar: Navigation of notes
 * Main area: Editor/view for current note
 * Theme: Light, minimal, with user color scheme (primary, secondary, accent)
 */

// ---------- Note Storage Helpers ----------
// PUBLIC_INTERFACE
function loadNotes() {
  /** Load notes from localStorage or return default if none exist. */
  const data = localStorage.getItem("personal_notes_v1");
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
}

// PUBLIC_INTERFACE
function saveNotes(notes) {
  /** Persist notes array to localStorage. */
  localStorage.setItem("personal_notes_v1", JSON.stringify(notes));
}

// Generate a simple unique ID for notes
const generateId = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

// ---------- Components ----------

// PUBLIC_INTERFACE
function Sidebar({ notes, activeId, onSelect, onAdd }) {
  /** Sidebar component: shows all notes and an "add" button. */
  return (
    <aside className="notekit-sidebar">
      <header className="sidebar-header">
        <span className="sidebar-title">Notes</span>
        <button title="New Note" className="sidebar-add-btn" onClick={onAdd}>+</button>
      </header>
      <nav className="note-list">
        {notes.length === 0 ? (
          <div className="sidebar-empty">No notes yet</div>
        ) : (
          notes.map((note) => (
            <button
              key={note.id}
              onClick={() => onSelect(note.id)}
              className={`note-list-item${note.id === activeId ? " active" : ""}`}
              title={note.title || "Untitled"}
            >
              <span className="note-title">{note.title || "Untitled"}</span>
            </button>
          ))
        )}
      </nav>
      <footer className="sidebar-footer">
        <span className="sidebar-footer-label">Personal Notes</span>
      </footer>
    </aside>
  );
}

// PUBLIC_INTERFACE
function NoteEditor({ note, isEditMode, onChange, onSave, onDelete, onCancel }) {
  /** Main area: View or edit selected note. */
  if (!note) {
    return (
      <div className="note-main-empty">
        <h2>No note selected</h2>
        <p>Select a note or create a new one.</p>
      </div>
    );
  }

  return (
    <div className="note-main">
      {isEditMode ? (
        <form
          className="note-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
        >
          <input
            className="note-title-input"
            name="title"
            value={note.title}
            placeholder="Title"
            autoFocus
            maxLength={80}
            onChange={e => onChange({ ...note, title: e.target.value })}
            required
          />
          <textarea
            className="note-content-input"
            name="content"
            rows={12}
            value={note.content}
            placeholder="Write your note here..."
            onChange={e => onChange({ ...note, content: e.target.value })}
          />
          <div className="note-form-actions">
            <button className="btn btn-primary" type="submit">Save</button>
            <button className="btn btn-secondary" type="button" onClick={onCancel}>Cancel</button>
            {note.id && (
              <button
                className="btn btn-danger"
                type="button"
                onClick={onDelete}
                title="Delete note"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      ) : (
        <div className="note-view">
          <header className="note-view-header">
            <h2>{note.title || "Untitled"}</h2>
            <button className="btn btn-accent" onClick={onEditClick} title="Edit note">Edit</button>
          </header>
          <article className="note-view-content">
            {note.content ? (
              note.content.split("\n").map((line, idx) => <p key={idx}>{line}</p>)
            ) : (
              <div className="note-empty-content">No content.</div>
            )}
          </article>
          <footer className="note-view-footer">
            <small>Last edited: {note.updated ? new Date(note.updated).toLocaleString() : "N/A"}</small>
          </footer>
        </div>
      )}
    </div>
  );

  // public event
  function onEditClick() {
    onChange({ ...note });
    onSave("__EDIT__");
  }
}

// ---------- Root App Component ----------
export default function App() {
  // App state: notes array, id of selected note, edit mode, current edit note
  const [notes, setNotes] = useState(loadNotes());
  const [activeId, setActiveId] = useState(notes.length > 0 ? notes[0].id : null);
  const [isEditing, setIsEditing] = useState(false);
  const [editNote, setEditNote] = useState(null);

  // Sync changes to notes to localStorage
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Select first note if deletion removed selected
  useEffect(() => {
    if (!notes.find(n => n.id === activeId)) {
      setActiveId(notes.length > 0 ? notes[0].id : null);
      setIsEditing(false);
    }
  }, [notes, activeId]);

  // Event handlers
  // PUBLIC_INTERFACE
  function handleNewNote() {
    // Create a blank note and switch to edit mode
    const newNote = {
      id: generateId(),
      title: "",
      content: "",
      updated: Date.now()
    };
    setEditNote(newNote);
    setIsEditing(true);
  }

  // PUBLIC_INTERFACE
  function handleSelectNote(id) {
    setActiveId(id);
    setIsEditing(false);
    setEditNote(null);
  }

  // PUBLIC_INTERFACE
  function handleEditNote(mode = "__EDIT__") {
    // mode === "__EDIT__" means switch to edit
    if (mode === "__EDIT__") {
      const note = notes.find(n => n.id === activeId);
      if (note) {
        setEditNote({ ...note });
        setIsEditing(true);
      }
    }
  }

  // PUBLIC_INTERFACE
  function handleNoteChange(updatedNote) {
    setEditNote(updatedNote);
  }

  // PUBLIC_INTERFACE
  function handleSaveNote() {
    // If editing existing, update; if new, prepend
    if (!editNote.title.trim()) {
      alert("Title cannot be empty.");
      return;
    }
    let updatedNotes;
    if (notes.find(n => n.id === editNote.id)) {
      updatedNotes = notes.map(n =>
        n.id === editNote.id
          ? { ...editNote, updated: Date.now() }
          : n
      );
    } else {
      updatedNotes = [{ ...editNote, updated: Date.now() }, ...notes];
      setActiveId(editNote.id);
    }
    setNotes(updatedNotes);
    setIsEditing(false);
    setEditNote(null);
  }

  // PUBLIC_INTERFACE
  function handleDeleteNote() {
    if (!window.confirm("Delete this note?")) return;
    setNotes(notes.filter(n => n.id !== editNote.id));
    if (activeId === editNote.id) {
      setActiveId(notes.length > 1 ? notes[0].id : null);
    }
    setIsEditing(false);
    setEditNote(null);
  }

  // PUBLIC_INTERFACE
  function handleCancelEdit() {
    setIsEditing(false);
    setEditNote(null);
  }

  // THEME: Apply colors as CSS vars (on body)
  useEffect(() => {
    document.body.style.setProperty('--primary', '#1976d2');
    document.body.style.setProperty('--secondary', '#424242');
    document.body.style.setProperty('--accent', '#ffc107');
  }, []);

  // Main render
  const currNote = isEditing
    ? editNote
    : notes.find(n => n.id === activeId);

  return (
    <div className="notekit-app">
      <Sidebar
        notes={notes}
        activeId={activeId}
        onSelect={handleSelectNote}
        onAdd={handleNewNote}
      />
      <main className="notekit-main">
        <header className="notekit-main-header">
          <span className="brand-pill">NoteKit</span>
        </header>
        <section className="notekit-content">
          <NoteEditor
            note={currNote}
            isEditMode={isEditing}
            onChange={handleNoteChange}
            onSave={isEditing ? handleSaveNote : handleEditNote}
            onDelete={handleDeleteNote}
            onCancel={handleCancelEdit}
          />
        </section>
      </main>
    </div>
  );
}
