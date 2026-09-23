import React, { useState, useEffect } from 'react';
import '../User.css';

const fetchAllEvents = async () => {
    const page = 1; 
    const limit = 1000;
    
    try {
        const response = await fetch(`http://localhost:3000/events?page=${page}&limit=${limit}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) {
            const errorData = await response.json(); 
            throw new Error(`Failed to fetch events: ${errorData.mensagem || response.statusText}`);
        }
        
        const data = await response.json();
        return data.eventos || []; 

    } catch (error) {
        console.error("Error fetching all events:", error);
        throw error;
    }
};

const CreateReviewModal = ({ isOpen, onClose, onReviewSuccess, userId }) => {
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [score, setScore] = useState(5);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const loadEvents = async () => {
                const allEvents = await fetchAllEvents();
                setEvents(allEvents);
                if (allEvents.length > 0) {
                    setSelectedEventId(allEvents[0].id || allEvents[0]._id);
                }
            };
            loadEvents();
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!selectedEventId) {
            setError('Please select an event.');
            return;
        }
        
        if (score < 1 || score > 5) {
            setError('Score must be between 1 and 5.');
            return;
        }

        setIsLoading(true);

        // Endpoint: /:id/review/:event_id
        const endpoint = `http://localhost:3000/users/${userId}/review/${selectedEventId}`;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score: parseInt(score) }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit review.');
            }

            alert(data.message || 'Review added successfully!');
            onReviewSuccess();
        } catch (err) {
            console.error("Review Submission Error:", err);
            setError(err.message || 'There was an error saving your review.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h4>Add New Review</h4>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body">
                    
                    {error && <div className="alert alert-danger">{error}</div>}

                    {/* Event Dropdown */}
                    <div className="mb-3">
                        <label htmlFor="event-select" className="form-label">Select Event:</label>
                        <select
                            id="event-select"
                            className="form-select"
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            required
                        >
                            {events.length === 0 && <option value="">Loading events...</option>}
                            {events.map((event) => (
                                <option key={event.id || event._id} value={event.id || event._id}>
                                    {event.nome_atividade}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Score Input */}
                    <div className="mb-4">
                        <label htmlFor="score-select" className="form-label">Score (1-5):</label>
                        <input
                            id="score-select"
                            type="number"
                            className="form-control"
                            value={score}
                            min="1"
                            max="5"
                            onChange={(e) => setScore(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button type="submit" className="btn btn-success w-100" disabled={isLoading}>
                        {isLoading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateReviewModal;