import React, { useEffect, useState } from 'react';
import './Announcements.css';
import api from '../hooks/api';

function Announcements({ onNavigate }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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

    fetchAnnouncements();
  }, []);

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

      <div className="announcements-list">
        {announcements.length === 0 && !loading ? (
          <div className="empty-state">No announcements found.</div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className="announcement-card">
              <div className="announcement-title">{announcement.title}</div>
              <div className="announcement-date">{new Date(announcement.createdAt).toLocaleDateString()}</div>
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
