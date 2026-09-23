import React, { useState, useEffect } from "react";
import CardGroup from 'react-bootstrap/CardGroup';
import Row from 'react-bootstrap/Row';
import UserCard from "../components/UserCard";
import CreateUserModal from "../components/CreateUserModal";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const limit = 50; 

  const getUsers = async (page = 1) => {
    try {
      const response = await fetch(`http://localhost:3000/users?page=${page}&limit=${limit}`);
      const data = await response.json();
      setUsers(data.users || []); 
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleUserCreated = () => {
    setIsModalOpen(false);
    getUsers(currentPage);
  };

  useEffect(() => {
    getUsers(currentPage);
  }, [currentPage]);

  return (
    <div className="container pt-5 pb-5">
      
      {/* Cabeçalho com o Título e o Botão */}
      <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Users Page</h2>
          <button 
              className="btn btn-success" 
              onClick={() => setIsModalOpen(true)}
          >
              ➕ Create New User
          </button>
      </div>

      <CardGroup>
            <Row xs={1} md={2} className="d-flex justify-content-around">
            {users && users.map((user) => (
                <UserCard 
                    key={user._id || user.id} 
                    {...user}
                />
            ))}
            </Row>
      </CardGroup>

      {/* Paginação */}
      <div className="d-flex justify-content-between mt-4">
        <button
          className="btn btn-secondary"
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
        >
          Previous
        </button>

        <span className="align-self-center">Page {currentPage} of {totalPages}</span>

        <button
          className="btn btn-secondary"
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage(prev => prev + 1)}
        >
          Next
        </button>
      </div>

      {/* O Componente Modal */}
      <CreateUserModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onUserCreated={handleUserCreated}
      />

    </div>
  );
}