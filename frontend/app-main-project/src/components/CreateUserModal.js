import React, { useState } from 'react';

const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', 
    justifyContent: 'center', alignItems: 'center', zIndex: 1050
};

const modalContentStyle = {
    backgroundColor: 'white', padding: '20px', borderRadius: '8px', 
    width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto'
};

const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
    
    const [formData, setFormData] = useState({
        customId: '',
        name: '',
        gender: '',
        age: '',
        occupation: '',
        imageUrl: ''
    });
    
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const idToUse = formData.customId 
            ? parseInt(formData.customId) 
            : Math.floor(10000 + Math.random() * 90000);

        const dataToSend = {
            _id: idToUse,
            name: formData.name,
            gender: formData.gender,
            age: parseInt(formData.age),
            occupation: formData.occupation,
            imageUrl: formData.imageUrl,
            eventReviews: []
        };

        console.log("A enviar:", dataToSend);

        try {
            const response = await fetch('http://localhost:3000/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            });

            if (response.ok) {
                alert(`Sucesso! Utilizador criado com o ID: ${idToUse}`);
                setFormData({ customId: '', name: '', gender: '', age: '', occupation: '', imageUrl: '' });
                onUserCreated(); 
            } else {
                const errorData = await response.json();
                if (errorData.erro && errorData.erro.includes("duplicate key")) {
                     alert("ERRO: Esse ID já existe! Por favor escolha outro número.");
                } else {
                     alert('Erro ao criar: ' + (errorData.mensagem || 'Falha desconhecida'));
                }
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão ao servidor (Backend está ligado?)');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <div className="d-flex justify-content-between mb-3">
                    <h3>Create New User</h3>
                    <button type="button" className="btn-close" onClick={onClose}></button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    
                    {/* --- CAMPO DO ID MANUAL --- */}
                    <div className="mb-3 p-2 bg-light border rounded">
                        <label className="form-label fw-bold">ID (Obrigatório):</label>
                        <input 
                            type="number" 
                            name="customId" 
                            className="form-control" 
                            value={formData.customId} 
                            onChange={handleChange} 
                            placeholder="ex: 7001" 
                            required
                        />
                        <small className="text-muted" style={{fontSize: '0.8rem'}}>
                            Escolha um número que ainda não exista na base de dados.
                        </small>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Name:</label>
                        <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} placeholder="Nome Completo" required />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Gender:</label>
                        <select name="gender" className="form-select" value={formData.gender} onChange={handleChange} required>
                            <option value="">Select Gender</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Age:</label>
                        <input type="number" name="age" className="form-control" value={formData.age} onChange={handleChange} placeholder="Idade" required />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Occupation:</label>
                        <input type="text" name="occupation" className="form-control" value={formData.occupation} onChange={handleChange} placeholder="Ocupação" required />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Image URL:</label>
                        <input type="text" name="imageUrl" className="form-control" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." />
                    </div>

                    <div className="d-grid gap-2 mt-4">
                        <button type="submit" className="btn btn-success" disabled={isLoading}>
                            {isLoading ? 'A Criar...' : 'Criar User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUserModal;