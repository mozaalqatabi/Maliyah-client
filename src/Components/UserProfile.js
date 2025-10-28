import React, { useState } from 'react';
import {
  FaUser,
  FaEnvelope,
  FaCamera,
  FaCheck,
  FaShieldAlt,
 
} from 'react-icons/fa';

import { Container, Row, Col, Form, Button, Card, Alert, InputGroup } from 'react-bootstrap';

const UserProfile = () => {
  const [userData, setUserData] = useState({
    name: 'Azza Azzan',
    email: 'Azza@gmail.com',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editedData, setEditedData] = useState(userData);

 

 

  const handleSave = () => {
    setUserData(editedData);
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCancel = () => {
    setEditedData(userData);
    setIsEditing(false);
  };

  return (
    <Container className="py-4" style={{ maxWidth: '900px' }}>
        <h4 className="fw-bold mb-0">Profile Settings</h4>
     
      <p className="text-muted mb-4">Manage your account information </p>

      {showSuccess && (
        <Alert
          variant="success"
          onClose={() => setShowSuccess(false)}
          dismissible
          className="d-flex align-items-center"
        >
          <FaCheck className="me-2" />
          Profile updated successfully!
        </Alert>
      )}

      <Card>
        <Card.Body>
          {/* Profile Header */}
          <Row className="align-items-center mb-4">
            <Col xs="auto" className="position-relative">
              <div
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  backgroundColor: '#e9ecef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  color: '#6c757d',
                }}
              >
                <FaUser />
              </div>
              <Button
                variant="primary"
                size="sm"
                className="position-absolute bottom-0 end-0 rounded-circle"
                style={{ width: '32px', height: '32px' }}
              >
                <FaCamera size={14} />
              </Button>
            </Col>
            <Col>
              <h4 className="mb-0">{userData.name}</h4>
              <div className="text-muted">{userData.email}</div>
            </Col>
          </Row>

          {/* Profile Form */}
          <Form>
            <h5>Personal Information</h5>
            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="formName">
                <Form.Label>Full Name</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaUser /></InputGroup.Text>
                  <Form.Control
                    type="text"
                    value={isEditing ? editedData.name : userData.name}
                    onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Full Name"
                  />
                </InputGroup>
              </Form.Group>
              </Row>
              <Row>
                <br/>
                <br/>

              <Form.Group as={Col} md="6" controlId="formEmail">
                <Form.Label>Email Address</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaEnvelope /></InputGroup.Text>
                  <Form.Control
                    type="email"
                    value={isEditing ? editedData.email : userData.email}
                    onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Email"
                  />
                </InputGroup>
              </Form.Group>
            </Row>

           

            

            

            <h5>Security</h5>
            <Card className="mb-4">
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <FaShieldAlt className="me-3 text-secondary" size={24} />
                  <div>
                    <div>Password</div>
                    <small className="text-muted">Change your Password</small>
                  </div>
                </div>
                <Button variant="primary" size="sm">Change Password</Button>
              </Card.Body>
            </Card>

            {/* Action Buttons */}
            <div className="d-flex justify-content-end gap-2">
              {isEditing ? (
                <>
                  <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                  <Button variant="primary" onClick={handleSave}>Save Changes</Button>
                </>
              ) : (
                <Button variant="primary" onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserProfile;


/*import { useState, useEffect } from "react";
import { Button, Container, Row, Col, Input, FormGroup, Form } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { updateUser } from "../Features/UserSlice";
import background from '../Images/background.jpg';

const UserProfile = () => {
    const user = useSelector((state) => state.counter.user);
    const defpic = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7l7J1BPxpQkMhKi2Ht4_DV2-ZDlXN0xvkuw&s";

    const [name, setName] = useState(user.uname || "");
    const [email, setEmail] = useState(user.email || ""); // Email is readonly
    const [profileURL, setProfileURL] = useState(user.pic || defpic);
    const [imageSelected, setImageSelected] = useState("");
    const [urlImage, setUrlImage] = useState("");

    const dispatch = useDispatch();

   
    useEffect(() => {
        setName(user.uname || "");
        setEmail(user.email || "");
        setProfileURL(user.pic || defpic);
    }, [user]);

    const handleNameUpdate = async () => {
        if (name.trim() === "") {
            alert("Name cannot be empty.");
            return;
        }

        try {
            const response = await axios.put("http://localhost:8080/updateUserName", {
                email: email,
                uname: name,
            });

            if (response.status === 200) {
                const updatedUser = { ...user, uname: name };
                dispatch(updateUser(updatedUser)); // Update Redux store
                alert("Name updated successfully.");
            } else {
                alert("Failed to update name. Please try again.");
            }
        } catch (error) {
            console.error("Error updating name:", error);
            alert("An error occurred while updating the name.");
        }
    };

    const handleImageUpload = async () => {
        try {
            const formData = new FormData();
            formData.append("file", imageSelected);
            formData.append("upload_preset", "skarahiman");

            const res = await axios.post(
                "https://api.cloudinary.com/v1_1/dh7gjsjrs/image/upload",
                formData
            );
            const updatedProfileURL = res.data.secure_url;
            setProfileURL(updatedProfileURL);

            // Update image in MongoDB
            const response = await axios.put("http://localhost:8080/updateUserImage", {
                email: user.email, // Use email or any unique identifier
                pic: updatedProfileURL,
            });

            if (response.status === 200) {
                const updatedUser = { ...user, pic: updatedProfileURL };
                dispatch(updateUser(updatedUser)); // Update Redux store
                alert("Profile image updated successfully.");
            } else {
                alert("Failed to update profile image.");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Error uploading image.");
        }
    };

    const handleImageDelete = async () => {
        try {
            const response = await axios.delete("http://localhost:8080/deleteUserImage", {
                data: { email: user.email }, // Use email or any unique identifier
            });

            if (response.status === 200) {
                setProfileURL(defpic); // Reset profile image URL to default
                const updatedUser = { ...user, pic: defpic };
                dispatch(updateUser(updatedUser)); // Update Redux store
                alert("Profile image deleted successfully.");
            } else {
                alert("Failed to delete profile image.");
            }
        } catch (error) {
            console.error("Error deleting image:", error);
            alert("Error deleting image.");
        }
    };

    const handleUrlImageChange = async () => {
        if (urlImage.trim() === "") {
            alert("Please enter a valid image URL.");
            return;
        }
        setProfileURL(urlImage);

        try {
            const response = await axios.put("http://localhost:8080/updateUserImage", {
                email: user.email,
                pic: urlImage, // Use the URL provided by the user
            });

            if (response.status === 200) {
                const updatedUser = { ...user, pic: urlImage };
                dispatch(updateUser(updatedUser)); // Update Redux store
                alert("Profile image URL updated successfully.");
            } else {
                alert("Failed to update profile image URL.");
            }
        } catch (error) {
            console.error("Error updating image URL:", error);
            alert("Error updating image URL.");
        }
    };

    return (
        <Container
            fluid
            style={{
                backgroundImage: `url(${background})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                height: '100vh',
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backgroundBlendMode: 'overlay',
            }}
        >
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
                <Form
                    style={{
                        background: "#f8f9fa",
                        padding: "30px",
                        borderRadius: "10px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        maxWidth: "500px",
                        width: "100%",
                    }}
                >
                    <Row className="text-center mb-4">
                        <h2 style={{ fontWeight: "bold" }}>User Profile</h2>
                    </Row>
                    <Row className="mb-3 text-center">
                        <img
                            src={profileURL}
                            alt="Profile"
                            width="100"
                            height="100"
                            className="rounded-circle border border-secondary"
                        />
                    </Row>
                    <Row>
                        <Col>
                            <FormGroup>
                                <label>Email</label>
                                <Input
                                    type="text"
                                    value={email}
                                    readOnly
                                    disabled
                                    className="form-control"
                                    style={{ backgroundColor: "#e9ecef" }}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FormGroup>
                                <label>Name</label>
                                <Input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="form-control"
                                />
                                <Button
                                    color="dark"
                                    className="mt-2 w-100"
                                    onClick={handleNameUpdate}
                                >
                                    Update Name
                                </Button>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FormGroup>
                                <label>Upload New Profile Picture</label>
                                <Input
                                    type="file"
                                    onChange={(e) => setImageSelected(e.target.files[0])}
                                    className="form-control mb-2"
                                />
                                <div className="d-flex justify-content-between">
                                    <Button
                                        color="dark"
                                        className="me-2"
                                        onClick={handleImageUpload}
                                        style={{ flex: "1" }}
                                    >
                                        Update Image
                                    </Button>
                                    <Button
                                        color="dark"
                                        onClick={handleImageDelete}
                                        style={{ flex: "1" }}
                                    >
                                        Delete Image
                                    </Button>
                                </div>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FormGroup>
                                <label>Or, Enter Image URL</label>
                                <Input
                                    type="url"
                                    value={urlImage}
                                    onChange={(e) => setUrlImage(e.target.value)}
                                    placeholder="Enter image URL"
                                />
                                <Button
                                    color="dark"
                                    className="mt-2 w-100"
                                    onClick={handleUrlImageChange}
                                >
                                    Set Profile Image
                                </Button>
                            </FormGroup>
                        </Col>
                    </Row>
                </Form>
            </Container>
        </Container>
    );
};

export default UserProfile;*/
