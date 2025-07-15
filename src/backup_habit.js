import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Habit.css';

const Habit = () => {
  const { email } = useParams();
  const navigate = useNavigate(); 
  const [habits, setHabits] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('2024-06-27');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [editingHabitId, setEditingHabitId] = useState(null);

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        console.log(email)
        const response = await fetch(`http://localhost:8080/habit/habits/${email}?date=${selectedDate}`);

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        console.log(data)
        
        setHabits(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHabits();
    console.log('called')
  }, [email, selectedDate]);
  
  const addHabit = async (habit) => {
    try {
      console.log(habit)
      const response = await fetch(`http://localhost:8080/habit/create/${email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...habit, email }),
      });

      if (!response.ok) {
        throw new Error('Failed to add habit');
      }
      console.log(response)
      const responseData = await response.text();
      const [logId, habitId] = responseData.split(' ');
      console.log('response data')
      console.log(habitId)
      setHabits([...habits, { ...habit, id: habitId}]);
    } catch (error) {
      setError('Error adding habit: ' + error.message);
    }
  };

  const completeHabit = async (habitId) => {
    try {
      console.log(habits)
      const habitToUpdate = habits.find(habit => habit.id === habitId);
      if (!habitToUpdate) {
        throw new Error('Habit not found');
      }
      const currentDate = new Date().toISOString().slice(0, 10); 
      console.log(habitId)
      console.log(currentDate)
      
      const response = await fetch(`http://localhost:8080/habit/logId?habitId=${habitId}&date=${currentDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch log ID');
      }

  
      const logId = await response.json();
      console.log(logId)
      const completeResponse = await fetch(`http://localhost:8080/habit/log/complete/${logId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (!completeResponse.ok) {
        throw new Error('Failed to mark log as completed');
      }
  
      // Update habit completion status in state
      setHabits(habits.map(habit =>
        habit.id === habitId ? { ...habit, completed: !habit.completed } : habit
      ));
  
    } catch (error) {
      setError('Error completing habit: ' + error.message);
    }
  };
  
  // Edit habit description
  const editHabitDescription = async (habitId, description) => {
    try {
      const response = await fetch(`http://localhost:8080/habit/${habitId}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      if (!response.ok) {
        throw new Error('Failed to update habit');
      }
      setHabits(habits.map(habit => habit.id === habitId ? { ...habit, habitDescription: description } : habit));
    } catch (error) {
      setError('Error updating habit: ' + error.message);
    }
  };

  // Delete a habit
  const deleteHabit = async (habitId) => {
    try {
      const response = await fetch(`http://localhost:8080/habit/${habitId}/delete`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete habit');
      }
      setHabits(habits.filter(habit => habit.id !== habitId));
    } catch (error) {
      setError('Error deleting habit: ' + error.message);
    }
  };

  // Handle form submission to fetch habits for a specific date
  const handleDateSubmit = (event) => {
    event.preventDefault();
    setSelectedDate(event.target.elements.date.value);
  };

  // Logout handler
  const handleLogout = () => {
    navigate('/login'); // Adjust path as per your routing setup
  };

  const openEditModal = (habitId, currentDescription) => {
    setEditingHabitId(habitId);
    setEditedDescription(parseDescription(currentDescription));
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditedDescription('');
    setEditingHabitId(null);
  };

  const handleSave = async () => {
    try {
      await editHabitDescription(editingHabitId, editedDescription);
      closeEditModal();
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching habits: {error}</div>;
  }

  const parseDescription = (description) => {
    try {
      const parsed = JSON.parse(description);
      return parsed && parsed.description ? parsed.description : description;
    } catch (error) {
      return description; // Return the original string if parsing fails
    }
  };

  return (
    <section className="habit-page">
      <div className="header">
        <button onClick={handleLogout} className="button button-logout">Logout</button>
      </div>
      <div className="content">
        <div className="left-section">
          <h1>Habits for {email.split("@")[0]} on {selectedDate}</h1>
          <ul className="habit-list">
            {habits.map((habit) => (
              <li key={habit.id} className={`habit-item ${habit.completed ? 'completed' : ''}`}>
                <div className="habit-details">
                  <strong>{habit.habitName}</strong>
                  <p>{parseDescription(habit.habitDescription)}</p>
                  <p>Frequency: {habit.habitFrequency}</p>
                </div>
                <div className="habit-actions">
                  {/* Conditionally render the Complete button */}
        {selectedDate <= new Date().toISOString().slice(0, 10) && (
          <button className="button button-complete" onClick={() => completeHabit(habit.id)}>
            {habit.completed ? 'Undo' : 'Complete'}
          </button>
        )}
                  <button className="button button-edit" onClick={() => openEditModal(habit.id, habit.habitDescription)}>
                    Edit
                  </button>
                  <button className="button button-delete" onClick={() => deleteHabit(habit.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="right-section">
        <div className="date-form">
  <form onSubmit={handleDateSubmit}>
    <input type="date" className="date-input" id="date" name="date" />
    <button type="submit" className="date-submit-button">Get Habits</button>
  </form>
</div>

          <form className="habit-form" onSubmit={(e) => {
            e.preventDefault();
            const name = e.target.elements.name.value.trim();
            const description = e.target.elements.description.value.trim();
            const frequency = e.target.elements.frequency.value;
            if (!name) return;
            addHabit({ habitName: name, habitDescription: description, habitFrequency: frequency });
            e.target.reset();
          }}>
            <input type="text" name="name" placeholder="Enter habit name" />
            <input type="text" name="description" placeholder="Enter habit description" />
            <select name="frequency">
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
            </select>
            <button type="submit" className="button button-add">Add Habit</button>
          </form>
        </div>
      </div>
      
      {/* Edit Modal */}
      {editModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              placeholder="Edit habit description..."
            />
            <div className="modal-actions">
              <button className="button button-save" onClick={handleSave}>
                Save
              </button>
              <button className="button button-cancel" onClick={closeEditModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Habit;
