import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Registration = () => {
    const [email ,setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/habit/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  "email": email,
                  "password": password
                }
                ),
            });
            if (response.ok) {
                navigate(`/dashboard/${email}`);
            } else {
                setError('Failed to register user.');
            }
        } catch (error) {
            console.error('Error registering user:', error);
            setError('Error connecting to server.');
        }
    };

    return (

        <div className='registration-page'>

<div className="registration-page-container">
            <div className="registration-left-section">
                <h1>Join Our Habit Tracker</h1>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus, expedita iusto veniam atque, magni tempora mollitia dolorum consequatur nulla, neque debitis eos reprehenderit quasi ab ipsum nisi dolorem modi. Quos?</p>
            </div>
            <div className="registration-right-section">
                <form onSubmit={handleSubmit} className="registration-form">
                    <h2>Register</h2>
                    {error && <p className="error">{error}</p>}
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    
                    <button type="submit">Register</button>
                    
                </form>
                
                <p className="already-user-text">Already a user? <a href="/login">Login here</a></p>
            </div>
        </div>

        </div>
    );
};

export default Registration;
