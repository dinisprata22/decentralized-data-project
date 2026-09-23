import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReviewList from "../components/ReviewList";

const DEFAULT_IMAGE_URL = `https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80`;

export default function UserPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    /* --- API & Core Functions --- */

    const getUser = async (userId) => {
        try {
            const response = await fetch(`http://localhost:3000/users/${userId}`);
            const data = await response.json();
            console.log(data);
            setUser(data);
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    const deleteUser = async () => {
        if (!window.confirm(`Are you sure you want to delete user with ID: ${id}?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/users/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete user.');
            }

            alert(`User with ID ${id} deleted successfully!`);
            navigate('/users');
        } catch (error) {
            console.error('Deletion Error:', error);
            alert(`Error deleting user: ${error.message}`);
        }
    };
    
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`http://localhost:3000/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData), 
            });

            if (!response.ok) {
                throw new Error('Failed to update user.');
            }
            await getUser(id); 
            setIsEditing(false); 
            
            alert('User profile updated successfully!');

        } catch (error) {
            console.error('Update Error:', error);
            alert(`Error updating user: ${error.message}`);
        }
    }; 
    useEffect(() => {
        getUser(id);
    }, [id]);
    
    // --- Helper Functions ---
    
    const formatGender = (genderCode) => {
        if (!genderCode) return "Not available";
        const code = genderCode.toUpperCase(); 
        
        if (code === "M") return "Male";
        if (code === "F") return "Female";
        return "Other / Unspecified";
    };

    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleEditClick = () => {
        // Synchronize formData with the current user data
        setFormData({
            name: user.name || '', 
            gender: user.gender || '',
            age: user.age || '',
            occupation: user.occupation || '',
            imageUrl: user.imageUrl || DEFAULT_IMAGE_URL,
        });
        setIsEditing(true);
    };

    const cancelEdit = () => {
        setIsEditing(false);
    };
    
    // --- Component JSX ---

    return (
        <div className="container pt-5 pb-5">

            {/* Profile Header (Picture and Name) */}
            <div className="d-flex align-items-center mb-4 user-profile-header">
                
                <div className="d-flex flex-column align-items-start">
                    <img
                        src={isEditing ? formData.imageUrl : user.imageUrl || DEFAULT_IMAGE_URL}
                        alt={user.name}
                        width="100"
                        height="100"
                        className="profile-image" 
                        onError={(e) => { e.target.src = DEFAULT_IMAGE_URL; }}
                    />
                    
                    {/* Image URL Input (Edit Mode Only) */}
                    {isEditing && (
                        <div className="mt-2" style={{width: '200px'}}>
                            <input 
                                type="text"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleFormChange}
                                placeholder="Image URL"
                                className="form-control form-control-sm"
                            />
                        </div>
                    )}
                </div>

                {/* NAME DISPLAY / INPUT */}
                {isEditing ? (
                    <div className="ms-3 flex-grow-1">
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            className="form-control form-control-lg"
                            placeholder="Full Name"
                        />
                    </div>
                ) : (
                    <h2 className="ms-3">{user.name || `User ${id}`}</h2>
                )}
            </div>
            
            <hr/>

            {/* Main Content Area */}
            <div className="row"> 
                
                {/* User Details & Actions (Left Column) */}
                <div className="col-md-4">
                    <div className="user-details-card">
                        
                        {isEditing ? (
                            // --- EDIT MODE FORM ---
                            <form onSubmit={handleUpdateSubmit}>
                                {}
                                <div className="mb-2">
                                    <label className="form-label">Gender:</label>
                                    <input type="text" 
                                        name="gender" 
                                        value={formData.gender} 
                                        onChange={handleFormChange} 
                                        className="form-control"
                                        placeholder="M, F, or Other"
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="form-label">Age:</label>
                                    <input type="number" 
                                        name="age" 
                                        value={formData.age} 
                                        onChange={handleFormChange} 
                                        className="form-control"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label">Occupation:</label>
                                    <input type="text" 
                                        name="occupation" 
                                        value={formData.occupation} 
                                        onChange={handleFormChange} 
                                        className="form-control"
                                    />
                                </div>
                                
                                <div className="d-flex justify-content-between">
                                    <button type="submit" className="btn btn-success me-2">
                                        Save Changes
                                    </button>
                                    <button type="button" onClick={cancelEdit} className="btn btn-secondary">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            // --- VIEW MODE ---
                            <>
                                <div className="user-info mb-3">
                                    <p><strong>Gender:</strong> {formatGender(user.gender)}</p> 
                                    <p><strong>Age:</strong> {user.age || "Not available"}</p>
                                    <p><strong>Occupation:</strong> {user.occupation || "Not available"}</p>
                                </div>

                                {/* Action Buttons (View Mode Only) */}
                                <button onClick={handleEditClick} className="btn btn-primary w-100 mb-3">
                                    Update User Info
                                </button>
                                <button
                                    onClick={deleteUser}
                                    className="btn btn-danger w-100" 
                                >
                                    Permanently Delete User
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* User Reviews (Right Column) */}
                <div className="col-md-8">
                    <div className="user-reviews-section">
                        
                       <ReviewList 
                            eventReviews={user.eventReviews || []} 
                            userId={id}
                            onReviewCreated={() => getUser(id)}
                        />
                    </div>
                </div>

            </div>

        </div>
    );
}