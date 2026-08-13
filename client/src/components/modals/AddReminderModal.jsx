import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function AddReminderModal() {
  const { showAddReminder, setShowAddReminder, addReminder } = useApp();
  const [taskName, setTaskName] = useState('');
  const [interval, setInterval] = useState('Every 2 Days');
  const [dueDate, setDueDate] = useState('');

  if (!showAddReminder) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskName || !dueDate) return;

    // Format date nicely
    const dateObj = new Date(dueDate);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    const formattedDate = dateObj.toLocaleDateString('en-GB', options);

    const res = await addReminder({
      name: taskName,
      interval: interval,
      nextDue: formattedDate
    });

    if (res.success) {
      alert("Care schedule saved!");
      setTaskName('');
      setDueDate('');
      setShowAddReminder(false);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="modal-overlay active" id="modal-add-reminder" onClick={() => setShowAddReminder(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" id="reminder-close-btn" onClick={() => setShowAddReminder(false)}>&times;</button>
        <h3 style={{ marginBottom: '20px' }}>Schedule Plant Reminder</h3>
        <form id="reminder-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="rem-name">Reminder Task</label>
            <input type="text" id="rem-name" required value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="e.g. Water Jade Plant" />
          </div>
          <div className="form-group">
            <label htmlFor="rem-interval">How Often?</label>
            <select id="rem-interval" value={interval} onChange={(e) => setInterval(e.target.value)}>
              <option value="Every 2 Days">Every 2 Days</option>
              <option value="Weekly">Weekly (Every 7 Days)</option>
              <option value="Every 15 Days">Every 15 Days</option>
              <option value="Monthly">Monthly (Every 30 Days)</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="rem-due">First Due Date</label>
            <input type="date" id="rem-due" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <button type="submit" className="btn" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}>
            Save Care Schedule
          </button>
        </form>
      </div>
    </div>
  );
}
