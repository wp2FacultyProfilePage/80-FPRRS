import React, { useEffect, useState, useRef } from "react";
import { imgDB, txtDB } from "../../firebase";
import { Link, useNavigate } from 'react-router-dom';
import { v4 } from "uuid";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { addDoc, collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import Swal from 'sweetalert2';
import cictlogo from './cictlogo.png';
import defaultImage from './default.jpg';
import './Add.css';

function CRUD() {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [employment, setEmployment] = useState('');
  const [img, setImg] = useState('');
  const [data, setData] = useState([]);
  const [title, setTitle] = useState('');
  const [year, setYear] = useState(0);
  const [link, setLink] = useState('');
  const [research, setResearch] = useState('');
  const [selectedResearch, setSelectedResearch] = useState('');
  const [editedData, setEditedData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [researchModalOpen, setResearchModalOpen] = useState(false);
  const [addResearchModalOpen, setAddResearchModalOpen] = useState(false);
  const [EditResearchModalOpen, setEditResearchModalOpen] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [researchData, setResearchData] = useState([]); // Initialize researchData state variable
  const [selectedFacultyType, setSelectedFacultyType] = useState('BSIT CORE FACULTY');
  const [uploadedImageURL, setUploadedImageURL] = useState(defaultImage);
  const fileInputRef = useRef(null);

  // State for dynamic Author, Certification and Education input fields
  const [certificationsFields, setCertificationsFields] = useState(['']);
  const [educationFields, setEducationFields] = useState(['']);
  const [author, setAuthor] = useState(['']);
  

  const handleCertificationsChange = (e, index) => {
    const updatedCertifications = [...certificationsFields];
    updatedCertifications[index] = e.target.value;
    setCertificationsFields(updatedCertifications);
  };

    // Function to handle changes in Author input fields
  const handleAuthorChange = (e, index) => {
    const updatedAuthors = [...author];
    updatedAuthors[index] = e.target.value;
    setAuthor(updatedAuthors);
  };

  // Function to add a new Author field
  const addAuthorField = () => {
    setAuthor([...author, '']);
  };

  // Function to remove an Author field by index
  const removeAuthorField = (index) => {
    if (author.length > 1) {
      const newAuthors = [...author];
      newAuthors.splice(index, 1);
      setAuthor(newAuthors);
    }
  };

  // Function to handle changes in Education input fields
  const handleEducationChange = (e, index) => {
    const updatedEducation = [...educationFields];
    updatedEducation[index] = e.target.value;
    setEducationFields(updatedEducation);
  };
  // Function to add a new Certification field
  const addCertificationField = () => {
    setCertificationsFields([...certificationsFields, '']);
  };

  // Function to remove the last Certification field
  const removeCertificationField = () => {
    if (certificationsFields.length > 1) {
      const newFields = [...certificationsFields];
      newFields.pop();
      setCertificationsFields(newFields);
    }
  };

  // Function to add a new Education field
  const addEducationField = () => {
    setEducationFields([...educationFields, '']);
  };

  // Function to remove the last Education field
  const removeEducationField = () => {
    if (educationFields.length > 1) {
      const newFields = [...educationFields];
      newFields.pop();
      setEducationFields(newFields);
    }
  };

  const handleAddResearch = () => {
    if (selectedItem) {
      const facultyMemberId = selectedItem.id;
      const researchCollectionRef = collection(txtDB, 'faculty', facultyMemberId, 'researches');
      const newResearchItem = {
        title: title,
        author: author.filter(author => author.trim() !== ''), // Filter out empty author fields
        year: year,
        link: link,
      };
  
      addDoc(researchCollectionRef, newResearchItem)
        .then(() => {
          setTitle('');
          setAuthor(['']); // Reset authors to one empty field
          setYear(0);
          setLink('');
          closeAddResearchModal();
        })
        .catch((error) => {
          console.error('Error adding research item: ', error);
        });
    }
  };
  
  
  const handleDeleteResearch = (research) => {
    // You need to implement the logic to delete the research data from Firebase here.
    // Here's an example using Firebase's deleteDoc function:
    const facultyMemberId = selectedItem.id; // Assuming you have the faculty member's ID
    const researchId = research.id; // Assuming you have the research document ID
  
    const researchCollectionRef = collection(txtDB, 'faculty', facultyMemberId, 'researches');
    const researchDocRef = doc(researchCollectionRef, researchId);
  
    // Use the deleteDoc function to delete the research document
    deleteDoc(researchDocRef)
      .then(() => {
        // Handle success (you can also update the UI accordingly)
        console.log('Research deleted successfully.');
      })
      .catch((error) => {
        // Handle errors
        console.error('Error deleting research:', error);
      });
  };

  const openAddResearchModal = (research) => {
    setSelectedResearch(research);
    setAddResearchModalOpen(true);
  };

  const closeAddResearchModal = () => {
    setAddResearchModalOpen(false);
  };

  const openResearchModal = (research) => {
    setSelectedResearch(research);
    setResearchModalOpen(true);
  };

  const closeResearchModal = () => {
    setResearchModalOpen(false);
  };

  const openEditResearchModal = async (research) => {
    setSelectedResearch(research);
  
    if (selectedItem) {
      const facultyId = selectedItem.id;
      const researchData = await getResearchData(facultyId);
  
      // Now you have the research data and can display it in your modal
      // Set the state to populate the modal fields with the existing data
      setTitle(research.title);
      setAuthor(research.author);
      setYear(research.year);
      setLink(research.link);
    }
  
    setEditResearchModalOpen(true);
  };

  const closeEditResearchModal = () => {
    setEditResearchModalOpen(false);
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
    setUploadedImageURL(defaultImage); // Clear the uploaded image URL
  };

  const openEditModal = (value) => {
    setEditedData(value);
    // Set the state with the data of the item to be edited
    setName(value.name || '');
    setPosition(value.position || '');
    setDepartment(value.department || '');
    setEmployment(value.employment || '');
    setEducationFields(value.education || ['']); // Set educationFields with fetched data or an empty array
    setCertificationsFields(value.certifications || ['']); // Set certificationsFields with fetched data or an empty array
    setTitle(value.title || ''); // Populate "Title" with the selected data
    setAuthor(value.author || ['']); // Populate "Author" with the selected data
    setYear(value.year || 0); // Populate "Year" with the selected data
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
    setEducationFields('');
    setCertificationsFields('');
    setResearch('');
  };

  const clearFileInput = () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear the file input
        setUploadedImageURL(''); // Clear the uploaded image URL
      } 
  };

  const handleUpload = (e) => {
    const imgs = ref(imgDB, `Imgs/${v4()}`);
      uploadBytes(imgs, e.target.files[0]).then(data => {
        getDownloadURL(data.ref).then(val => {
          setImg(val);
          setUploadedImageURL(val); // Set the uploaded image URL here
      });
    })
    .catch((error) => {
      console.error('Error uploading image: ', error);
    });
  };

  const handleClick = async () => {
    {
       const valRef = collection(txtDB, 'faculty');
       const certificationsArray = certificationsFields.filter(certification => certification !== '');
       const educationArray = educationFields.filter(education => education !== '');
       const facultyDocRef = await addDoc(valRef, {
         name: name,
         position: position,
         department: department,
         employment: employment,
         education: educationArray,
         certifications: certificationsArray,
         facultyType: selectedFacultyType,
         imgUrl: img
       });
        // Add research data to the "Research" subcollection
        const facultyId = facultyDocRef.id;
        const researchCollectionRef = collection(txtDB, 'faculty', facultyId, 'researches');
        await addDoc(researchCollectionRef, {
          // title: title,
          // author: author.split(',').map(author => author.trim()),
          // year: year,
          // link: link,
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
    const userDoc = doc(txtDB, 'faculty', id);
    const newInfo = {
      name: name,
      position: position,
      department: department,
      employment: employment,
      education: educationFields,
      certifications: certificationsFields,
      facultyType: selectedFacultyType,
      imgUrl: img
    };

    await updateDoc(userDoc, newInfo);
    clearInputs();
    setIsEditModalOpen(false);
    setDataLoaded(false);
  };

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
    if (researchModalOpen && selectedItem !== null) {
      const facultyMemberId = selectedItem.id;
      getResearchData(facultyMemberId)
        .then((researchData) => {
          setResearchData(researchData);
        })
        .catch((error) => {
          console.error('Error fetching research data: ', error);
        });
    }
  }, [dataLoaded,researchModalOpen, selectedItem]);

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
          window.location.href = '/';
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
      </div>
      {selectedItem && (
        <div id="modal-overlay">
          <div className="modal">
            <div className="modal-content">
              <table>
                <tr>
                  <th id="title"> 
                  <p className="modal-title">PROFILE</p>
                  </th>
                  <th id="title">
                    <span className="thclose" onClick={() => openItemModal(null)}>
                    &times;
                  </span>
                  </th>
                </tr>
                <tr>
                  <td>
                 
                  <div className="modal-details">
                    <img src={selectedItem.imgUrl} alt="Selected Image" />
                    <p><strong>{selectedItem.facultyType}</strong></p>
                    <p><strong>Name:</strong> {selectedItem.name}</p>
                    <p><strong>Position:</strong> {selectedItem.position}</p>
                    <p><strong>Department:</strong> {selectedItem.department}</p>
                    <p><strong>Employment Status:</strong> {selectedItem.employment}</p>
                    <p><strong>Educational Attainment:</strong></p>
                    <ul id="ul-add">
                      {Array.isArray(selectedItem.education) ? (
                        selectedItem.education.map((education, index) => (
                          <li id="li-add" key={index}>{education}</li>
                        ))
                      ) : (
                        <li>No education data</li>
                      )}
                    </ul>
                    <p><strong>Certifications:</strong></p>
                    <ul id="ul-add" className="cert-scroll">
                      {Array.isArray(selectedItem.certifications) ? (
                        selectedItem.certifications.map((certification, index) => (
                          <li id="li-add" key={index}>{certification}</li>
                        ))
                      ) : (
                        <li id="li-add">No certification data</li>
                      )}
                    </ul>
                  </div>
                  <button id="viewbtn" onClick={() => openResearchModal(selectedItem.research)}>
                    View Research
                  </button>
                  <button id="editbtn" onClick={() => openEditModal(selectedItem)}>
                    Edit 
                  </button>
                  <button id="deletebtn" onClick={() => {deleteUser(selectedItem.id);closeItemModal();}}>
                    Delete 
                  </button>
                  </td>
                </tr>
              </table>   
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
          <div className="add-modal-overlay">
            <div className="add-modal">
              <div className="custom-modal"  style={{ maxHeight: '100vh', overflow: 'auto' }}>
              {uploadedImageURL && (
                <img id="img-show" src={uploadedImageURL} alt="Uploaded Image" style={{maxWidth: '150px', maxHeight: '150px' }} />
              )}
              <input id="Input" type="file" onChange={(e) => handleUpload(e)} ref={fileInputRef} />
                <label>Faculty Type:</label>
                  <select value={selectedFacultyType} onChange={(e) => setSelectedFacultyType(e.target.value)}>
                    <option value="BSIT CORE FACULTY">BSIT CORE FACULTY</option>
                    <option value="ALLIED CORE FACULTY">ALLIED CORE FACULTY</option>
                    <option value="BSIS CORE FACULTY">BSIS CORE FACULTY</option>
                    <option value="BLIS CORE FACULTY">BLIS CORE FACULTY</option>
                    <option value="PART-TIME FACULTY">PART-TIME FACULTY</option>
                    <option value="INDUSTRY PRACTITIONERS">INDUSTRY PRACTITIONERS</option>
                  </select>
                <input id="Input" placeholder="Name...." onChange={(e) => setName(e.target.value)} /><br />
                <input id="Input" placeholder="Position...." onChange={(e) => setPosition(e.target.value)} /><br />
                <input id="Input" placeholder="Department...." onChange={(e) => setDepartment(e.target.value)} /><br />
                <input id="Input" placeholder="Employment Status....." onChange={(e) => setEmployment(e.target.value)} /><br />
                <div style={{ maxHeight: '100vh', overflow: 'auto' }}>
                  {educationFields.map((value, index) => (
                    <div key={index}>
                      <input id="input-div"  placeholder={`Educational Attainment #${index + 1}....`} onChange={(e) => handleEducationChange(e, index)} />
                      <button id="addbutton" onClick={addEducationField}>+</button>
                    <button id="minusbutton" onClick={removeEducationField}>-</button>
                    </div>
                    ))}
                    {certificationsFields.map((value, index) => (
                    <div key={index}>
                      <input  id="input-div"  placeholder={`Certification #${index + 1}....`} onChange={(e) => handleCertificationsChange(e, index)} />
                      <button id="addbutton" onClick={addCertificationField}>+</button>
                      <button id="minusbutton" onClick={removeCertificationField}>-</button>
                    </div>
                    ))}
                  </div>    
                <div id="type">
                  
                </div>
                <div id="btn-container">
                  <button id="addbtn" onClick={() => { handleClick(); closeModal(); }}>
                    Add
                  </button>
                  <button id="closebtn" onClick={() => { closeModal(); }}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
      )}

      {isEditModalOpen && editedData && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <div className="custom-modal">
              <table id="edit-table">
                <tr>
                  <th id="title"> 
                    <p className="modal-title">EDIT</p>
                  </th>
                </tr>
                <tr>
                  <td>
                  {uploadedImageURL && (
                      <img id="img-show" src={uploadedImageURL} alt="Uploaded Image" style={{maxWidth: '150px', maxHeight: '150px' }} />
                    )}
                    <input id="Input" type="file" onChange={(e) => handleUpload(e)} ref={fileInputRef} />
                    <input id="input-edit" placeholder="Name...." onChange={(e) => setName(e.target.value)} value={name} /><br />
                    <input id="input-edit" placeholder="Position...." onChange={(e) => setPosition(e.target.value)} value={position} /><br />
                    <input id="input-edit" placeholder="Department...." onChange={(e) => setDepartment(e.target.value)} value={department} /><br />
                    <input id="input-edit" placeholder="Employment Status....." onChange={(e) => setEmployment(e.target.value)} value={employment} /><br />
                    <div id="scrollable-list">
                    {educationFields.map((value, index) => (
                      <div key={index}>
                          <input id="input-div" 
                          placeholder={`Educational Attainment #${index + 1}....`}
                          onChange={(e) => handleEducationChange(e, index)}
                          value={value}
                          />
                          <button id="addbutton" onClick={addEducationField}>+</button>
                          <button id="minusbutton" onClick={() => removeEducationField(index)}>-</button>
                      </div>
                      ))}
                      {certificationsFields.map((value, index) => (
                      <div  key={index}>
                          <input  id="input-div"
                          placeholder={`Certification #${index + 1}....`}
                          onChange={(e) => handleCertificationsChange(e, index)}
                          value={value}
                          />
                          <button id="addbutton" onClick={addCertificationField}>+</button>
                          <button id="minusbutton" onClick={() => removeCertificationField(index)}>-</button>
                      </div>
                      ))}
                    </div> 
                  </td>
                </tr>
              </table>
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
              <div id="btn-container">
              <button id="confirmbtn" onClick={() => updateUser(editedData.id)}>
                Confirm
              </button>
              <button id="closebtn" onClick={closeEditModal}>
                Close
              </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {researchModalOpen && selectedResearch !== null && (
        <div className="research-modal-overlay">
          <div className={`research-modal ${researchModalOpen ? 'open' : ''}`}>
            <div className="research-modal-content">
            <table>
            <tr>
              <th id="title">
                <p className="modal-title">Research</p>
              </th>
              <th id="title">
                <span className="researchclose" onClick={closeResearchModal}>
                  &times;
                </span>
              </th>
            </tr>
            <tr>
              <td>
              <div className="modal-details">
                <button id="addresearch-button" onClick={openAddResearchModal}>
                  Add Research
                </button>
                <div id="research-list">
                  <table className="research-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Year</th>
                        <th>Link</th>
                        <th>Actions</th> {/* Add a new column for buttons */}
                      </tr>
                    </thead>
                    <tbody>
                      {researchData.map((research) => (
                        <tr key={research.id} className="research-item">
                          <td>{research.title}</td>
                          <td>{research.author ? research.author.join(', ') : ''}</td>
                          <td>{research.year}</td>
                          <td id="link">
                            <a href={research.link} target="_blank" rel="noopener noreferrer">
                              {research.link}
                            </a>
                          </td>
                          <td>
                          {/* <button id="editresearch-button" onClick={openEditResearchModal}>
                           Edit
                          </button> */}
                          <button onClick={() => handleDeleteResearch(research)}>DELETE</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              </td>
            </tr>
          </table>
            </div>
          </div>
        </div>
      )}

      {addResearchModalOpen && (
        <div className="research-add-modal">
          <div className="research-add-modal-content">
            <span className="close" onClick={closeAddResearchModal}>
              &times;
            </span>
            <h2 className="modal-title">Add Research</h2>
            <div className="modal-details">
              <input
                placeholder="Title...."
                onChange={(e) => setTitle(e.target.value)}
              /><br />
              <div className="authors-input">
                <label>Authors:</label>
                {author.map((value, index) => (
                  <div key={index} className="author-input">
                    <input
                      placeholder="Author...."
                      value={value}
                      onChange={(e) => handleAuthorChange(e, index)}
                    />
                    {index === author.length - 1 && ( // Display "+" button for the last author field
                      <button className="add-author-button" onClick={addAuthorField}>+</button>
                    )}
                    {index !== 0 && ( // Display "-" button for all but the first author field
                      <button className="remove-author-button" onClick={() => removeAuthorField(index)}>-</button>
                    )}
                  </div>
                ))}
              </div>
              <input
                placeholder="Year...."
                onChange={(e) => setYear(e.target.value)}
              /><br />
              <input
                placeholder="Link...."
                onChange={(e) => setLink(e.target.value)}
              /><br />
              <button className="modal-add-button" onClick={handleAddResearch}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {EditResearchModalOpen && (
        <div className="research-add-modal">
          <div className="research-add-modal-content">
            <span className="close" onClick={closeEditResearchModal}>
              &times;
            </span>
            <h2 className="modal-title">Edit Research</h2>
            <button id="confirmbtn">
              Confirm Button
            </button>
          </div>
        </div>
      )}

    </div>
);
}

export default CRUD;
