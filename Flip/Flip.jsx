import React, { useState, useEffect } from 'react';
import FlipPage from 'react-pageflip';
import { txtDB } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import './Flip.css';
import styled from 'styled-components';

const ScrollableContent = styled.div`
  max-height: 500px;
  overflow-y: auto;
`;

const Flipbook = () => {
  const [users, setUsers] = useState([]);
  const usersCollectionRef = collection(txtDB, 'faculty');
  const [showCertifications, setShowCertifications] = useState(false);
  const [showProfile, setShowProfile] = useState(true);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const data = await getDocs(usersCollectionRef);
        const usersData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setUsers(usersData);
        console.log("Data:", usersData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    getUsers();
  }, [usersCollectionRef]);

  const toggleCertifications = () => {
    setShowCertifications(true);
    setShowProfile(false);
  };

  const toggleProfile = () => {
    setShowProfile(true);
    setShowCertifications(false);
  };

  const pages = users.map((user, index) => {
    return {
      content: (
        <div id="flip-main-container" key={user.id}>
          <p id="type">{user.facultyType}</p>
          <img id="imgicon" src={user.imgUrl} height="200px" width="200px" />
          <div className="flip-data">
            <p id="name">{user.name}</p>
            <hr></hr>
            <p id="pos">{user.position}</p>
            {showProfile && (
              <div>
                <p id="dep"><b>DEPARTMENT</b><br/>{user.department}</p>
                <p id="emp"><b>EMPLOYMENT</b><br/>{user.employment}</p>
                <p id="edu"><b>EDUCATION</b><br/>{user.education}</p>
              </div>
            )}
            {showCertifications && (
              <p>
                <b>CERTIFICATIONS</b>
                <br />{user.certifications}
              </p>
            )}
          </div>
        </div>
      ),
    };
  });

  return (
    <div className="flipbook-container">
      <FlipPage width={400} height={508}>
        {pages.map((page, index) => (
          <div className={`page ${index % 2 === 0 ? 'even-page' : 'odd-page'}`} key={index}>
            <h2>{page.title}</h2>
            <div>{page.content}</div>
          </div>
          
        ))}
      </FlipPage>
      <div className="button-container">
        <button id="facultyProfileButton" onClick={toggleProfile}>FACULTY PROFILE</button>
        <button id="certificationsButton" onClick={toggleCertifications}>CERTIFICATIONS</button>
      </div>
    </div>
  );
};

export default Flipbook;
