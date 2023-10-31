import React, { useEffect, useState } from "react";
import { imgDB, txtDB } from "../../firebase";
import { Link, useNavigate } from 'react-router-dom';
import { v4 } from "uuid";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { addDoc, collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import Swal from 'sweetalert2';
import cictlogo from './cictlogo.png';
import './Add.css';

function CRUD() {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [employment, setEmployment] = useState('');
  const [education, setEduc] = useState('');
  const [certifications, setCertifications] = useState('');
  const [img, setImg] = useState('');
  const [data, setData] = useState([]);
  const [editedData, setEditedData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [research, setResearch] = useState('');
  const [researchModalOpen, setResearchModalOpen] = useState(false);
  const [selectedResearch, setSelectedResearch] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedFacultyType, setSelectedFacultyType] = useState('BSIT CORE FACULTY'); // Default selected option

  const openResearchModal = (research) => {
    setSelectedResearch(research);
    setResearchModalOpen(true);
  };

  const closeResearchModal = () => {
    setResearchModalOpen(false);
  };

  const openItemModal = (value) => {
    setSelectedItem(value);
  };
  const closeItemModal = (value) => {
    setSelectedItem(value);
  };
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openEditModal = (value) => {
    setEditedData(value);
    // Set the state with the data of the item to be edited
    setName(value.name || '');
    setPosition(value.position || '');
    setDepartment(value.department || '');
    setEmployment(value.employment || '');
    setEduc(value.education || '');
    setCertifications(value.certifications || '');
    setResearch(value.txtresearch || '');

    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const clearInputs = () => {
    setName('');
    setPosition('');
    setDepartment('');
    setEmployment('');
    setEduc('');
    setCertifications('');
    setResearch('');
  };

  const handleUpload = (e) => {
    const imgs = ref(imgDB, `Imgs/${v4()}`);
    uploadBytes(imgs, e.target.files[0]).then(data => {
      getDownloadURL(data.ref).then(val => {
        setImg(val);
      });
    });
  };

  const handleClick = async () => {
    if (!name ||  !department || !employment || !education ||  !img) {
      // Check if any of the required fields is empty
      Swal.fire({
        title: 'Error',
        text: 'Please fill in all fields before adding data.',
        icon: 'error',
      });
    } else {
      const valRef = collection(txtDB, 'faculty');
      await addDoc(valRef, {
        name: name,
        position: position,
        department: department,
        employment: employment,
        education: education,
        certifications: certifications,
        txtresearch: research,
        imgUrl: img
      });
      Swal.fire({
        title: 'Data Added',
        text: 'Data added successfully!',
        icon: 'success',
      });
      clearInputs();
    }
  };

  const updateUser = async (id) => {
    if (!editedData) return;
    const facultyType = selectedFacultyType;
    const userDoc = doc(txtDB, 'faculty', id);
    const newInfo = {
      name: name,
      position: position,
      department: department,
      employment: employment,
      education: education,
      certifications: certifications,
      txtresearch: research,
      imgUrl: img,
      facultyType: facultyType, // Change 'selectedFacultyType' to 'facultyType'
    };

    await updateDoc(userDoc, newInfo);
    clearInputs();
    setIsEditModalOpen(false);
    setDataLoaded(false);
  };

  const getData = async () => {
    const valRef = collection(txtDB, 'faculty');
    const dataDb = await getDocs(valRef);
    const allData = dataDb.docs.map(val => ({ ...val.data(), id: val.id }));
    setData(allData);
    setDataLoaded(true);
  };

  const deleteUser = async (id) => {
    const userDoc = doc(txtDB, 'faculty', id);
    await deleteDoc(userDoc);
    clearInputs();
    setDataLoaded(false);
  };

  useEffect(() => {
    if (!dataLoaded) {
      getData();
    }
  }, [dataLoaded]);

  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to log out.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, log out',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('userToken');
        Swal.fire({
          title: 'Logged Out',
          text: 'You have been successfully logged out.',
          icon: 'success',
        }).then(() => {
          window.location.href = '/login';
          navigate('/login', { replace: true });
        });
      }
    });
  };

  const handleLogoutView = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to switch to Flipbook Page.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Move to Flipbook Page',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('userToken');
        Swal.fire({
          title: 'Redirecting......',
        }).then(() => {
          window.location.href = '/flip';
          navigate('/', { replace: true });
        });
      }
    });
  };

  return (
    <div className="custom-container">
      <div className="custom-sidebar">
        <img src={cictlogo} alt="Sidebar Image" id="CustomAdminicon_sidebar" />
        <div className="custom-sidebar-text">
          <h2>CICT FACULTY <br />(ADMIN)</h2>
        </div>

        <div className="custom-logout-container">
          <Link to="/add">
            <div className="custom-logout-container">
              <button id="CustomLogoutButton" onClick={handleLogout}>
                LOG OUT
              </button>
            </div>
          </Link>
          <Link to="/add">
            <div className="custom-view-container">
              <button id="CustomViewButton" onClick={handleLogoutView}>
               VIEW FLIPBOOK
              </button>
            </div>
          </Link>
        </div>
      </div>

      <div className="custom-main-content">
        <div id="addfaculty">
          <button id="addfacultybtn" onClick={openModal}>
            ADD FACULTY
          </button>
        </div>
        {isModalOpen && (
          <div className="add-modal-overlay">
            <div className="add-modal">
              <div className="custom-modal">
                <input id="Input" type="file" onChange={(e) => handleUpload(e)} /><br />
                <input placeholder="Name...." onChange={(e) => setName(e.target.value)} /><br />
                <input placeholder="Position...." onChange={(e) => setPosition(e.target.value)} /><br />
                <input placeholder="Department...." onChange={(e) => setDepartment(e.target.value)} /><br />
                <input placeholder="Employment Status....." onChange={(e) => setEmployment(e.target.value)} /><br />
                <input placeholder="Educational Attainment...." onChange={(e) => setEduc(e.target.value)} /><br />
                <input placeholder="Certifications...." onChange={(e) => setCertifications(e.target.value)} /><br />
                <input placeholder="Research...." onChange={(e) => setResearch(e.target.value)} /><br />
                <div>
                  <label>Faculty Type:</label>
                  <select value={selectedFacultyType} onChange={(e) => setSelectedFacultyType(e.target.value)}>
                    <option value="BSIT CORE FACULTY">BSIT CORE FACULTY</option>
                    <option value="ALLIED CORE FACULTY">ALLIED CORE FACULTY</option>
                    <option value="BSIS CORE FACULTY">BSIS CORE FACULTY</option>
                    <option value="BLIS CORE FACULTY">BLIS CORE FACULTY</option>
                    <option value="PART-TIME FACULTY">PART-TIME FACULTY</option>
                    <option value="INDUSTRY PRACTITIONERS">INDUSTRY PRACTITIONERS</option>
                  </select>
                </div>
                <button className="modal-add-button" onClick={() => {handleClick(); closeModal();}}>
                  Add
                </button>
                <button id="modalclosebtn" onClick={closeModal}>
                  Close Modal
                </button>
              </div>
            </div>
          </div>
        )}

       <div className="scrollable-grid-container">
          <div className="grid-container">
            {data.map((value) => (
              <div className="div-icon" key={value.id} onClick={() => openItemModal(value)}>
                <img src={value.imgUrl} height="300px" width="300px" />
                <h1>{value.name}</h1>
              </div>
            ))}
          </div>
        </div>
        {selectedItem && (
          <div id="modal-overlay">
            <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={() => openItemModal(null)}>
                &times;
              </span>
              <h2 className="modal-title">Faculty Profile</h2>
              <div className="modal-details">
                <img src={selectedItem.imgUrl} alt="Selected Image" />
                <p><strong>{selectedItem.facultyType}</strong></p>
                <p><strong>Name:</strong> {selectedItem.name}</p>
                <p><strong>Position:</strong> {selectedItem.position}</p>
                <p><strong>Department:</strong> {selectedItem.department}</p>
                <p><strong>Employment Status:</strong> {selectedItem.employment}</p>
                <p><strong>Educational Attainment:</strong> {selectedItem.education}</p>
                <p><strong>Certifications:</strong> {selectedItem.certifications}</p>
              </div>
              <button className="modal-button" onClick={() => openEditModal(selectedItem)}>
                Edit 
              </button>
              <button className="modal-button" onClick={() => {deleteUser(selectedItem.id);closeItemModal();}}>
                Delete 
              </button>
              <button className="modal-button" onClick={() => openResearchModal(selectedItem.txtresearch)}>
                View Research
              </button>
            </div>
          </div>
          </div>
          
        )}

        {isEditModalOpen && editedData && (
          <div className="edit-modal-overlay">
            <div className="edit-modal">
              <div className="custom-modal">
                <input id="Input" type="file" onChange={(e) => handleUpload(e)} /><br />
                <input placeholder="Name...." onChange={(e) => setName(e.target.value)} value={name} /><br />
                <input placeholder="Position...." onChange={(e) => setPosition(e.target.value)} value={position} /><br />
                <input placeholder="Department...." onChange={(e) => setDepartment(e.target.value)} value={department} /><br />
                <input placeholder="Employment Status....." onChange={(e) => setEmployment(e.target.value)} value={employment} /><br />
                <input placeholder="Educational Attainment...." onChange={(e) => setEduc(e.target.value)} value={education} /><br />
                <input placeholder="Certifications...." onChange={(e) => setCertifications(e.target.value)} value={certifications} /><br />
                <input placeholder="Research...." onChange={(e) => setResearch(e.target.value)} value={research} /><br />
                <div>
                  <label>Faculty Type:</label>
                  <select value={selectedFacultyType} onChange={(e) => setSelectedFacultyType(e.target.value)}>
                    <option value="BSIT CORE FACULTY">BSIT CORE FACULTY</option>
                    <option value="ALLIED CORE FACULTY">ALLIED CORE FACULTY</option>
                    <option value="BSIS CORE FACULTY">BSIS CORE FACULTY</option>
                    <option value="BLIS CORE FACULTY">BLIS CORE FACULTY</option>
                    <option value="PART-TIME FACULTY">PART-TIME FACULTY</option>
                    <option value="INDUSTRY PRACTITIONERS">INDUSTRY PRACTITIONERS</option>
                  </select>
                </div>
                <button className="btn btn-primary" onClick={() => updateUser(editedData.id)}>
                  Confirm
                </button>
                <button onClick={closeEditModal}>Close</button>
              </div>
            </div>
          </div>
        )}

        {researchModalOpen && selectedResearch !== null && (
          <div className={`research-modal ${researchModalOpen ? 'open' : ''}`}>
            <div className="research-modal-content">
              <span className="close" onClick={closeResearchModal}>
                &times;
              </span>
              <h2 className="modal-title">Research</h2>
              <div className="modal-details">
                <p>{"Research:"} {selectedResearch}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CRUD;
