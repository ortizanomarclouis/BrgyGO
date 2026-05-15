import React, { useEffect, useState } from 'react';
import './Announcements.css';
import api from '../../hooks/api';
import { useAuth } from '../../hooks';

function Announcements({ onNavigate }) {
  const { user } = useAuth();
  const isStaff = user?.role === 'STAFF' || user?.role === 'ADMIN';
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [formMode, setFormMode] = useState('create');
  const [formValues, setFormValues] = useState({
    id: null,
    title: '',
    description: '',
    content: '',
    imageUrl: '',
    isPinned: false,
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/announcements');
      setAnnouncements(response.data.content || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const resetForm = () => {
    setFormMode('create');
    setFormValues({
      id: null,
      title: '',
      description: '',
      content: '',
      imageUrl: '',
      isPinned: false,
    });
    setStatusMessage('');
  };

  const handleFormChange = (field, value) => {
    setFormValues((curr) => ({ ...curr, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatusMessage('');

    try {
      const payload = {
        title: formValues.title,
        description: formValues.description,
        content: formValues.content,
        imageUrl: formValues.imageUrl,
        isPinned: formValues.isPinned,
      };

      if (formMode === 'edit' && formValues.id) {
        await api.put(`/api/announcements/${formValues.id}`, payload);
        const message = 'Announcement updated successfully.';
        setStatusMessage(message);
      } else {
        await api.post('/api/announcements', payload);
        const message = 'Announcement created successfully.';
        setStatusMessage(message);
      }

      resetForm();
      await fetchAnnouncements();
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to save announcement.';
      setStatusMessage(message);
    }
  };

  const handleEditAnnouncement = (announcement) => {
    setFormMode('edit');
    setFormValues({
      id: announcement.id,
      title: announcement.title || '',
      description: announcement.description || '',
      content: announcement.content || '',
      imageUrl: announcement.imageUrl || '',
      isPinned: announcement.isPinned || false,
    });
    setStatusMessage('');
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement? This action cannot be undone.')) {
      return;
    }

    setStatusMessage('');
    try {
      await api.delete(`/api/announcements/${id}`);
      const message = 'Announcement deleted successfully.';
      setStatusMessage(message);
      await fetchAnnouncements();
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to delete announcement.';
      setStatusMessage(message);
    }
  };

  return (
    <div className="announcements-page">
      <div className="announcements-header">
        <button className="back-button" onClick={() => onNavigate('dashboard')}>
          ← Back to Dashboard
        </button>
        <div>
          <h1>Announcements</h1>
          <p>Stay informed about the latest barangay updates and events.</p>
        </div>
      </div>

      {loading && <div className="status-message">Loading announcements...</div>}
      {error && <div className="status-message status-error">{error}</div>}
      {statusMessage && <div className="status-message status-success">{statusMessage}</div>}

      {isStaff && (
        <div className="announcement-form-card">
          <div className="announcement-form-header">
            <h2>{formMode === 'edit' ? 'Edit Announcement' : 'Create Announcement'}</h2>
            <p>Staff can create or update announcements for residents.</p>
          </div>
          <form className="announcement-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Title</label>
              <input
                type="text"
                value={formValues.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <label>Description</label>
              <textarea
                value={formValues.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <label>Content</label>
              <textarea
                value={formValues.content}
                onChange={(e) => handleFormChange('content', e.target.value)}
              />
            </div>
            <div className="form-row">
              <label>Image URL</label>
              <input
                type="text"
                value={formValues.imageUrl}
                onChange={(e) => handleFormChange('imageUrl', e.target.value)}
              />
            </div>
            <div className="form-row checkbox-row">
              <label>
                <input
                  type="checkbox"
                  checked={formValues.isPinned}
                  onChange={(e) => handleFormChange('isPinned', e.target.checked)}
                />
                Pin announcement
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-button">
                {formMode === 'edit' ? 'Update Announcement' : 'Create Announcement'}
              </button>
              {formMode === 'edit' && (
                <button type="button" className="cancel-button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="announcements-list">
        {announcements.length === 0 && !loading ? (
          <div className="empty-state">No announcements found.</div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className="announcement-card">
              <div className="announcement-header">
                <div>
                  <div className="announcement-title">{announcement.title}</div>
                  <div className="announcement-date">{new Date(announcement.createdAt).toLocaleDateString()}</div>
                </div>
                {isStaff && (
                  <div className="announcement-actions">
                    <button className="edit-button" onClick={() => handleEditAnnouncement(announcement)}>
                      Edit
                    </button>
                    <button className="delete-button" onClick={() => handleDeleteAnnouncement(announcement.id)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <div className="announcement-description">{announcement.description}</div>
              {announcement.content && <div className="announcement-content">{announcement.content}</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Announcements;
