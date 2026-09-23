import React, {useState, useEffect} from "react";
import CardGroup from 'react-bootstrap/CardGroup';
import Row from 'react-bootstrap/Row';

import EventCard from "../components/EventCard";

export default function App() {
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  const getEvents = async (page=1) => {
    try {
      const response = await fetch(`http://localhost:3000/events?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json'
        },
      });
      
      const data = await response.json();
      console.log(data)
      setEvents(data.eventos || []);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 1);

    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }

  useEffect(() => {
    getEvents(currentPage);
  }, [currentPage]);

  return (
    <div className="container pt-5 pb-5">
        <h2>Events</h2>
        <CardGroup>
            <Row xs={1} md={2} className="d-flex justify-content-around">
            {events && events.map((event) => {
                return (
                    <EventCard 
                        key={event.id} 
                        {...event}
                    />
                );
            })}
            </Row>
        </CardGroup>
        <div className="d-flex justify-content-between mt-4">
        <button
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
        >
          Previous
        </button>

        <span>Page {currentPage} of {totalPages}</span>

        <button
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage(prev => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}