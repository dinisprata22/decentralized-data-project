import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import '../EventCard.css';

function EventCard(props) {
  return (
    <Card style={{ width: '18rem' }} className="event-card-custom">
      <Card.Body>
        <Card.Title className='text-primary'>
          {props.nome_atividade}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          Tema: {props.tipologia || "No description available."}
        </Card.Subtitle>
        <Button href={"/event/" + props.id} variant="outline-primary">Open Event</Button>
      </Card.Body>
    </Card>
  );
}

export default EventCard;