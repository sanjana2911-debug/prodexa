/**
 * Notes page - Create, edit, delete notes with categories and search
 */
import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useConfirm } from '../context/ConfirmContext';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/helpers';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiAnchor, FiFileText, FiBookmark, FiAlertCircle } from 'react-icons/fi';

const NOTE_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
];

const CATEGORIES = ['General', 'Programming', 'Science', 'Mathematics', 'Language', 'Other'];

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote, toggleNotePin, loading, error } = useData();
  const { confirm } = useConfirm();
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    color: '#6366f1',
  });

  const resetForm = () => {
    setFormData({ title: '', content: '', category: 'General', color: '#6366f1' });
    setEditingNote(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category,
      color: note.color,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || submitting) return;

    try {
      setSubmitting(true);
      if (editingNote) {
        await updateNote(editingNote._id, formData);
      } else {
        await addNote(formData);
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (noteId) => {
    const confirmed = await confirm({
      title: 'Delete Note',
      message: 'Are you sure you want to delete this note? This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      try {
        await deleteNote(noteId);
      } catch (err) {
        console.error('Failed to delete note:', err);
      }
    }
  };

  const handleTogglePin = async (noteId) => {
    try {
      await toggleNotePin(noteId);
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort: pinned first, then by updated date
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 flex items-center gap-3">
        <FiAlertCircle className="text-red-500 text-xl flex-shrink-0" />
        <p className="text-red-700 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notes</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Organize your notes by categories</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25"
        >
          <FiPlus />
          <span>Add Note</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      {sortedNotes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedNotes.map(note => (
            <div
              key={note._id}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all overflow-hidden animate-fadeIn"
            >
              {/* Color bar */}
              <div className="h-2" style={{ backgroundColor: note.color }} />
              
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FiFileText className="text-gray-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{note.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleTogglePin(note._id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        note.pinned
                          ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                          : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                    <FiAnchor className={note.pinned ? 'fill-current rotate-45' : 'rotate-45'} />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(note)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line line-clamp-4 mb-4">
                  {note.content}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiBookmark className="text-xs" style={{ color: note.color }} />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{note.category}</span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDate(note.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <FiFileText className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No notes found</p>
          <button onClick={handleOpenAdd} className="mt-3 text-primary-600 dark:text-primary-400 font-medium text-sm hover:underline">
            Create your first note
          </button>
        </div>
      )}

      {/* Add/Edit Note Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingNote ? 'Edit Note' : 'Add New Note'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Note title"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your notes here..."
              rows="5"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
              <div className="flex gap-2 mt-2">
                {NOTE_COLORS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: c.value }))}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      formData.color === c.value ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800 scale-110' : ''
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowModal(false); resetForm(); }}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingNote ? 'Update Note' : 'Add Note'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}