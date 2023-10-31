import React, { useState, useEffect } from 'react';
import FlipPage from 'react-pageflip';
import { txtDB } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import './Flip.css';
import styled from 'styled-components';

const ScrollableContent = styled.div`
  max-height: 500px; /* Adjust the maximum height as needed */
  overflow-y: auto;
`;

const Flipbook = () => {
  const [users, setUsers] = useState([]);
  const usersCollectionRef = collection(txtDB, 'faculty');

  useEffect(() => {
    const getUsers = async () => {
      try {
        const data = await getDocs(usersCollectionRef);
        const usersData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setUsers(usersData);
        console.log("Data:", usersData); // Log the fetched data
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    getUsers();
  }, [usersCollectionRef]);

  const pages = users.map((user, index) => {
    return {
      content: (
        <div  key={user.id}>
          <p id="type">{user.facultyType}</p>
            <img id="imgicon" src={user.imgUrl} height="200px" width="200px" />
              <div className="flip-data">
                <p id="name">{user.name}</p>
                <hr></hr>
                <p id="pos">{user.position}</p>
                <p id="dep"><b>DEPARTMENT</b><br/>{user.department}</p>
                <p id="emp"><b>EMPLOYMENT</b><br/>{user.employment}</p>
                <p id="edu"><b>EDUCATION</b><br/>{user.education}</p>
                <p className="scrollable-content">
                  <b>CERTIFICATIONS</b>
                  <br />{user.certifications}
                </p>
              </div>
        </div>

      ),
    };
  });

  return (
    <div className="flipbook-container">
      <FlipPage width={500} height={708}>
        {pages.map((page, index) => (
          <div className={`page ${index % 2 === 0 ? 'even-page' : 'odd-page'}`} key={index}>
            <h2>{page.title}</h2>
            <div>{page.content}</div>
          </div>
        ))}
      </FlipPage>
    </div>
  );
};

export default Flipbook;
