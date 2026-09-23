import"../EventDetails.css";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { openContractCall } from '@stacks/connect';
import {
  bufferCV,
} from '@stacks/transactions';
import { utf8ToBytes } from '@stacks/common';
import { userSession } from '../auth';
const bytes = utf8ToBytes('foo');
const bufCV = bufferCV(bytes);

export default function App() {
  let params = useParams();
  const { id } = useParams();
  let [event, setEvent] = useState([]);
  const navigate = useNavigate();

  const getEvent = async (Userid) => {
    try {
      const response = await fetch('http://localhost:3000/events/' + Userid, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      const data = await response.json();
      console.log(data)
      setEvent(data);

    } catch (error) {
      console.error('Error:', error);
    }
  }
  const deleteEvent = async () => {
        if (!window.confirm(`Are you sure you want to delete event with ID: ${id}?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/events/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete event.');
            }

            alert(`Event with ID ${id} deleted successfully!`);
            navigate('/events');
        } catch (error) {
            console.error('Deletion Error:', error);
            alert(`Error deleting event: ${error.message}`);
        }
    };

  useEffect(() => {
    let id = params.id;
    console.log(id);
    getEvent(params.id);

  }, []);

  const dataEvento = event.data_inicio ? new Date(event.data_inicio) : null;
  const dia = dataEvento ? dataEvento.getDate().toString().padStart(2, '0') : '--';
  const mes = dataEvento ? (dataEvento.getMonth() + 1).toString().padStart(2, '0') : '--';
  const ano = dataEvento ? dataEvento.getFullYear() : '----';

  return (
    <div className="event container">

      <div className="event-header-image" style={{ backgroundImage: `url(${event.fotografia})` }}>
        <div className="header-content">

          <div className="event-date-box">
            <span className="date-day">{dia}</span>
            <span className="date-month-year">{mes}/{ano}</span>
          </div>
          <h1 className="event-title">{event.nome_atividade || "Nome do Evento"}</h1>
        </div>
      </div>
      <div className="event-details-section">
       
       
        <div className="details-card">
          <h2 className="section-title">Detalhes Principais</h2>
          <div className="info-item">
            <strong>Data:</strong>
            <span>
              {event.data_inicio === event.data_fim
                ? event.data_inicio
                : `${event.data_inicio} a ${event.data_fim}`
              }
            </span>
          </div>
          <div className="info-item">
            <strong>Hora:</strong> <span>{event.horario || "N/A"}</span>
          </div>
          <div className="info-item">
            <strong>Local:</strong> <span>{event.localizacao || "N/A"}</span>
          </div>
          <div className="info-item">
            <strong>Custo:</strong> <span>{event.custo || "Gratuito"}</span>
          </div>
          <div className="info-item">
            <strong>Público:</strong> <span>{event.publico_destinatario || "Publico em geral"}</span>
          </div>
        </div>
          <div className="details-card organizadores-card">
          <h2 className="section-title">Organização</h2>
          <p>{event.organizacao || "Informação dos organizadores não disponível."}</p>
        </div>
              
        <div className="details-card sinopse-card">
          <h2 className="section-title">Sobre a Atividade</h2>
          <p>{event.sinopse || "Sem sinopse disponível."}</p>
        </div>
        <div className="details-card acoes-card">
          <h2 className="section-title">Edit Event</h2>
          <button className="btn btn-danger w-100" 
          onClick={deleteEvent}>Delete Evento</button>
        </div>
      

      </div>
    </div>
  )
}
