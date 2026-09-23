import React, { useState, useEffect } from "react";
import CreateReviewModal from './CreateReviewModal';
import '../User.css';

const ReviewItem = ({ eventName, reviewDate, score, imageURL, eventId }) => {
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="review-item-card">
            {imageURL && <img src={imageURL} alt={eventName} className="review-event-image" />}
            <div className="review-item-text-portion">
              <a 
                    href={"/event/" + eventId}
                    className="review-title-link"
                >
                    <h4>{eventName}</h4>
                </a>
              <p>
                  <strong>Date Reviewed:</strong> {formatDate(reviewDate)}
              </p>
              <p>
                  <strong>Score:</strong> {score} / 5 &#127775;
              </p>
            </div>
        </div>
    );
};

export default function ReviewList({ eventReviews, userId, onReviewCreated }) { 
    const [reviewsWithEvent, setReviewsWithEvent] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState("");
    
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!eventReviews || eventReviews.length === 0) {
            setReviewsWithEvent([]);
            setFilteredReviews([]);
            setEvents([]);
            return;
        }

        const fetchEvents = async () => {
            const enrichedReviews = await Promise.all(
                eventReviews.map(async (review) => {
                    try {
                        const response = await fetch(`http://localhost:3000/events/${review.eventId}`, {
                            method: 'GET',
                            headers: { 'Content-Type': 'application/json' },
                        });
                        const eventData = await response.json();
                        return {
                            ...review,
                            nome_atividade: eventData.nome_atividade || `Event ${review.eventId}`, 
                            imageUrl: eventData.fotografia || null,
                        };
                    } catch (err) {
                        console.error("Error fetching event:", err);
                        return { ...review, nome_atividade: `Event ${review.eventId}`, imageUrl: null };
                    }
                })
            );

            setReviewsWithEvent(enrichedReviews);
            setFilteredReviews(enrichedReviews);

            const uniqueEvents = Array.from(
                new Set(enrichedReviews.map(r => r.nome_atividade))
            );
            setEvents(uniqueEvents);
        };

        fetchEvents();
    }, [eventReviews]);

    const handleFilterChange = (e) => {
        const eventName = e.target.value;
        setSelectedEvent(eventName);

        if (eventName === "") {
            setFilteredReviews(reviewsWithEvent);
        } else {
            const filtered = reviewsWithEvent.filter(r => r.nome_atividade === eventName);
            setFilteredReviews(filtered);
        }
    };
    
    const handleReviewSuccess = () => {
        setIsModalOpen(false);
        if (onReviewCreated) {
            onReviewCreated();
        }
    };


    return (
        <div className="review-list-container">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>User Reviews</h3>
                {/* Button to open the modal */}
                {userId && (
                    <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => setIsModalOpen(true)}
                    >
                        + Create Review
                    </button>
                )}
            </div>
            
            <div className="review-filter mb-3">
                <label htmlFor="eventFilter" className="me-2">Filter by Event:</label>
                <select
                    id="eventFilter"
                    value={selectedEvent}
                    onChange={handleFilterChange}
                    className="form-select d-inline-block w-auto"
                >
                    <option value="">All Events</option>
                    {events.map((event) => (
                        <option key={event} value={event}>{event}</option>
                    ))}
                </select>
            </div>

            {reviewsWithEvent.length === 0 ? (
                <p>No reviews yet.</p>
            ) : (
                <div className="review-cards-container" >
                    {filteredReviews.map((review, index) => (
                        <ReviewItem
                            key={`${review.eventId}-${index}`}
                            eventName={review.nome_atividade}
                            reviewDate={review.date} 
                            score={review.score} 
                            imageURL={review.imageUrl}
                            eventId={review.eventId}
                        />
                    ))}
                </div>
            )}
            
            {/* The Modal Component */}
            <CreateReviewModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onReviewSuccess={handleReviewSuccess}
                userId={userId}
            />
        </div>
    );
}