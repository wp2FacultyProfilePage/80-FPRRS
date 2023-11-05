import React, { useState, useEffect } from 'react';
import FlipPage from 'react-pageflip';
import { txtDB } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import './Flip.css';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCertificate, faBook } from '@fortawesome/free-solid-svg-icons';

const IconContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const Flipbook = () => {
  const [users, setUsers] = useState([]);
  const usersCollectionRef = collection(txtDB, 'faculty');
  const [showCertifications, setShowCertifications] = useState(false);
  const [showProfile, setShowProfile] = useState(true);
  const [showResearch, setShowResearch] = useState(false); // Add state for showing research

  const getResearchData = async (facultyId) => {
    const researchCollectionRef = collection(txtDB, 'faculty', facultyId, 'researches');
    const querySnapshot = await getDocs(researchCollectionRef);
    const researchData = [];

    querySnapshot.forEach((doc) => {
      researchData.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return researchData;
  };

  useEffect(() => {
    const getUsers = async () => {
      try {
        const data = await getDocs(usersCollectionRef);
        const usersData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        const usersWithResearch = await Promise.all(
          usersData.map(async (user) => {
            user.research = await getResearchData(user.id); // Add research data to each user
            return user;
          })
        );
        setUsers(usersWithResearch);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    getUsers();
  }, [usersCollectionRef]);

  const toggleCertifications = () => {
    setShowCertifications(true);
    setShowProfile(false);
    setShowResearch(false);
  };

  const toggleProfile = () => {
    setShowProfile(true);
    setShowCertifications(false);
    setShowResearch(false);
  };

  const toggleResearch = () => {
    setShowResearch(true);
    setShowCertifications(false);
    setShowProfile(false);
  };

  const pages = users.map((user, index) => {
    return {
      content: (
        <div id="flip-main-container" key={user.id}>
          <p id="facultyType">{user.facultyType}</p>
          <img id="imgicon" src={user.imgUrl} height="200px" width="200px" />
          <div className="flip-data">
            <p id="name">{user.name}</p>
            <hr></hr>
            <p id="pos">{user.position}</p>
            {showProfile && (
              <div>
                <p id="dep">
                  <label>DEPARTMENT</label>
                  <br />
                  {user.department}
                </p>
                <p id="emp">
                  <label>EMPLOYMENT</label>
                  <br />
                  {user.employment}
                </p>
                <p id="edu">
                  <label>EDUCATION</label>
                  <br />
                  {user.education}
                </p>
              </div>
            )}
            {showCertifications && (
              <div>
                <p id="cert">CERTIFICATIONS</p>
                <div>
                  <ul id="ul-flip" style={{ height: '200px', overflowY: 'auto' }}>
                    {user.certifications.map((certification, index) => (
                      <li id="li-flip" key={index}>{certification}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {showResearch && (
              <div>
                <p>
                  <b id="res">RESEARCH</b>
                </p>
                <div>
                  <ul id="ul-flip" style={{ height: '200px', overflowY: 'auto' }}>
                    {user.research.map((research, index) => (
                      <li id="ul-flip" key={index}>
                        <p id="title">Title: </p> {research.title}
                      
                        <p id="author">Author: </p>{research.author}
                     
                        <p id="year">Year: </p> {research.year}
                   
                        <a href={research.link} target="_blank" rel="noopener noreferrer">
                          <p id="link">PROFILE LINK </p>
                        </a>
                        <hr></hr>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    };
  });

  return (
    <div className="flipbook-container">
      <IconContainer>
        <div id="nav-container">
          <button id="facultyProfileButton" onClick={toggleProfile}>
            <FontAwesomeIcon icon={faUser} />
          </button>
          <button id="certificationsButton" onClick={toggleCertifications}>
            <FontAwesomeIcon icon={faCertificate} />
          </button>
          <button id="researchButton" onClick={toggleResearch}>
            <FontAwesomeIcon icon={faBook} />
          </button>
        </div>
      </IconContainer>
      <FlipPage width={400} height={508}>
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
