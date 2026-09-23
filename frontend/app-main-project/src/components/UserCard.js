import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";




function UserCard(props) {
  const profilePic = props.imageUrl || `https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80`;

  return (
    <Card style={{ width: '18rem' }} className="mb-3">
      <Row className="justify-content-center pt-3">
        <Col xs="5">
          <Card.Img variant="top" 
            src={profilePic}
            loading='lazy'
            alt = {props.title} 
            width="100" 
            height="100" />
        </Col>
      <Col xs="7">
        <Card.Body>
          <Card.Title>{props.title}</Card.Title>
          <Card.Text>
            {props.name}
          </Card.Text>
          <Button href={"/user/" + props._id} variant="outline-primary">Open User</Button>
        </Card.Body>
      </Col>
      </Row>
    </Card>
  );
}

export default UserCard;