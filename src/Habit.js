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
    const [filter, setFilter] = useState('all'); // New state for filter

    useEffect(() => {
      const fetchHabits = async () => {
        try {
          const response = await fetch(`http://localhost:8080/habit/habits/${email}?date=${selectedDate}`);
    
          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }
          
          const logs = await response.json();
    
          const habitsWithStatus = logs.map(log => ({
            id: log.habit.habitId,
            habitName: log.habit.habitName,
            habitDescription: log.habit.habitDescription,
            habitFrequency: log.habit.habitFrequency,
            completed: log.status
          }));
    
          setHabits(habitsWithStatus);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };
    
      fetchHabits();
    }, [email, selectedDate]);
    
    const addHabit = async (habit) => {
      try {
        const response = await fetch(`http://localhost:8080/habit/create/${email}/${selectedDate}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...habit, email }),
        });

        if (!response.ok) {
          throw new Error('Failed to add habit');
        }

        const responseData = await response.text();
        const [logId, habitId] = responseData.split(' ');
        setHabits([...habits, { ...habit, id: habitId, completed: false }]); // Ensure initial completed status is false
      } catch (error) {
        setError('Error adding habit: ' + error.message);
      }
    };

    const completeHabit = async (habitId) => {
      try {
        const habitToUpdate = habits.find(habit => habit.id === habitId);
        if (!habitToUpdate) {
          throw new Error('Habit not found');
        }
        const currentDate = new Date().toISOString().slice(0, 10); 
        
        const response = await fetch(`http://localhost:8080/habit/logId?habitId=${habitId}&date=${currentDate}`);
        if (!response.ok) {
          throw new Error('Failed to fetch log ID');
        }
        const logId = await response.json();

        const completeResponse = await fetch(`http://localhost:8080/habit/log/complete/${logId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!completeResponse.ok) {
          throw new Error('Failed to mark log as completed');
        }

        setHabits(habits.map(habit =>
          habit.id === habitId ? { ...habit, completed: !habit.completed } : habit
        ));

      } catch (error) {
        setError('Error completing habit: ' + error.message);
      }
    };

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

    const handleDateSubmit = (event) => {
      event.preventDefault();
      setSelectedDate(event.target.elements.date.value);
    };

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

    const parseDescription = (description) => {
      try {
        const parsed = JSON.parse(description);
        return parsed && parsed.description ? parsed.description : description;
      } catch (error) {
        return description; // Return the original string if parsing fails
      }
    };

    const filteredHabits = habits.filter(habit => {
      if (filter === 'completed') {
        return habit.completed;
      }
      if (filter === 'incomplete') {
        return !habit.completed;
      }
      return true;
    });

    if (loading) {
      return <div>Loading...</div>;
    }

    if (error) {
      return <div>Error fetching habits: {error}</div>;
    }

    return (
      <section className="habit-page">
       <div className="header">
  <h3>Habit Tracker</h3>
    <div className='butto'>
    <a href="#"  className="link-progress">Progress</a>
    <a href="#" onClick={handleLogout} className="link-logout">Logout</a>
    </div>
 
</div>


        <div className="content">
  <div className="left-section">
    <h1>Habits for {email.split("@")[0]} on {selectedDate}</h1>
    <ul className="habit-list">
      {filteredHabits.map((habit) => (
        <div key={habit.id} className="habit-item-wrapper">
          <li className={`habit-item ${habit.completed ? 'completed' : ''}`}>
            <div className="habit-details">
              <h2><strong>{habit.habitName}</strong></h2>
              <p>{parseDescription(habit.habitDescription)}</p>
              <p>Frequency: {habit.habitFrequency}</p>
            </div>
            <div className="habit-actions">
              {selectedDate <= new Date().toISOString().slice(0, 10) && !habit.completed && (
                <button className="button button-complete" onClick={() => completeHabit(habit.id)}>
                  Complete
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
        </div>
      ))}
    </ul>
  </div>


          <div className="right-section">
            <div className="date-form box">
              <h2>Get Habits</h2>
              <form onSubmit={handleDateSubmit}>
                <input type="date" className="date-input" id="date" name="date" />
                <button type="submit" className="date-submit-button">Get Habits</button>
              </form>
            </div>

            <div className="habit-form box">
              <h2>Add Habits</h2>
              <form onSubmit={(e) => {
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
                <select className="dropdownhabit" name="frequency">
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                </select>
                <button type="submit" className="button button-add">Add Habit</button>
              </form>
            </div>

            <div className="filter-form box">
              <h2>Apply Filters</h2>
              <form className='filter-formm'>
                <label>
                  <input
                    type="radio"
                    name="filter"
                    value="all"
                    checked={filter === 'all'}
                    onChange={() => setFilter('all')}
                  />
                  All
                </label>
                <label>
                  <input
                    type="radio"
                    name="filter"
                    value="completed"
                    checked={filter === 'completed'}
                    onChange={() => setFilter('completed')}
                  />
                  Completed
                </label>
                <label>
                  <input
                    type="radio"
                    name="filter"
                    value="incomplete"
                    checked={filter === 'incomplete'}
                    onChange={() => setFilter('incomplete')}
                  />
                  Incomplete
                </label>
              </form>
            </div>
          </div>
        </div>

        {editModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <h2>Edit Habit Description</h2>
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
              ></textarea>
              <button onClick={handleSave} className="button button-save">Save</button>
              <button onClick={closeEditModal} className="button button-cancel">Cancel</button>
            </div>
          </div>
        )}
      </section>
    );
  };

  export default Habit;
