import React, { useEffect, useState } from 'react';
import { Container, Table } from 'react-bootstrap';
import axios from 'axios';

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await axios.get('http://localhost:8080/feedbacks');
        setFeedbacks(res.data);
      } catch (err) {
        console.error("Error fetching feedbacks:", err);
      }
    };
    fetchFeedbacks();
  }, []);

  return (
    <Container className="py-4">
      <h4 className="fw-bold mb-4">User Feedbacks</h4>
      {feedbacks.length === 0 ? (
        <p>No feedback submitted yet.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Email</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map(fb => (
              <tr key={fb._id}>
                <td>{fb.userEmail}</td>
                <td>{fb.rating} ⭐</td>
                <td>{fb.comment}</td>
                <td>{new Date(fb.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default AdminFeedback;
