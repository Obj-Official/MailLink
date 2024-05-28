import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import axios from "axios";

const MyForm=()=>{
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [dob, setDOB] = useState("");
    const [passport, setPassport] = useState(null);
    const [idImage, setIdImage] = useState(null);
    const [passportURL, setPassportURL] = useState(null);
    const [idImageURL, setIdImageURL] = useState(null);
    const [allText, setAllText] = useState("");

    
    const handlePassportUpload = (event) => {
        const file = event.target.files[0];
        setPassport(file);
        const reader = new FileReader();
        reader.onload = () => {
            setPassportURL(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleIdImageUpload = (event) => {
        const file = event.target.files[0];
        setIdImage(file);
        const reader = new FileReader();
        reader.onload = () => {
            setIdImageURL(reader.result);
        };
        reader.readAsDataURL(file);
    };
    const setInfo =()=> {
        setAllText(`
        <p><b>First Name:</b> ${firstname}</p>
        <p><b>Last Name:</b> ${lastname}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Gender:</b> ${document.querySelector('select[name="gender"]')?.value}</p>
        <p><b>Date fo birth:</b> ${dob}</p>
        `)
    }

    useEffect(()=>{
        setInfo();
    })

    const generatePDF =()=>{
        const doc = new jsPDF();
        doc.text(`
        First Name: ${firstname}\n
        Last Name: ${lastname}\n
        Email: ${email}\n
        Phone: ${phone}\n
        Gender: ${document.querySelector('select[name="gender"]')?.value}\n
        Date of birth: ${dob}\n
        `, 10, 10)
        doc.save('myPDF.pdf'); // Save the PDF with a specified name
        return doc;
    }
    const  sendEmailWithAttachment = async (pdfDoc) => {
        try {
            const base64Pdf = pdfDoc.output('datauristring').split(',')[1];
            const response = await axios.post(
                'https://api.brevo.com/v3/smtp/email',
                {
                    sender: {
                        name: 'BioData WebApp',
                        email: 'biodatawebapp@biomail.com'
                    },
                    to: [
                        {
                            name: 'John Snow',
                            email: 'johnsnow@mymail.com'
                        }
                    ],
                    subject: 'New BioData Registeration',
                    htmlContent: allText,
                    attachment: [
                        {   //base64 encoded pdf containing user details
                            content: base64Pdf,
                            name: 'userDetails.pdf'
                        },
                        { //base64 encoded images selecting just the actual base64 string 
                            content: passportURL?.split(",")[1],
                            name: 'passport.jpg'
                        } ,
                        {    
                            content: idImageURL?.split(",")[1],
                            name: 'idDocument.jpg'
                        }
                    ]
                },
                {
                    headers: {
                        'accept': 'application/json',
                        'api-key': '123yadiyadiyada-mygeneratedapikeys-frombrevoapi456',
                        'content-type': 'application/json'
                    }
                }
            );
            console.log('Email sent', response.data); 
            alert("Registration Successful!")
        } catch (error) {
            console.error('Error sending email:', error);
        }
    };
    
    const submitForm = async (e) => {
        e.preventDefault();
        const document = generatePDF();
        sendEmailWithAttachment(document);
    };

    return(
        <div>
            <form onSubmit={submitForm} method="POST">
                <center>
                    <h2>BioData Registration</h2>
                    <label><p className="note">Fields marked with asteriks (<span  className="red-asteriks">*</span>) are required</p></label>
                    <div className="item-container">
                        <label for="firstname">First Name <span  className="red-asteriks">*</span></label><br/>
                        <input type="text" name="firstname" id="firstname" className="entries" placeholder="Enter Firstname" value={firstname} onChange={event =>setFirstname(event.target.value)} required/>
                    </div>

                    <div className="item-container">
                        <label for="lastname">Last Name <span  className="red-asteriks">*</span></label><br/>
                        <input type="text" name="lastname" id="lastname" className="entries" placeholder="Enter Lastname" value={lastname} onChange={event =>setLastname(event.target.value)} required/>
                    </div>

                    <div className="item-container">
                        <label for="email">Email <span className="red-asteriks">*</span></label><br/>
                        <input type="email" name="email" id="email" className="entries" placeholder="Enter Email" value={email} onChange={event =>setEmail(event.target.value)} required/>
                    </div >
                    <div className="item-container">
                        <label for="phone">Phone <span className="red-asteriks">*</span></label><br/>
                        <input type="number" name="phone" id="phone" className="entries" placeholder="Phone Number" value={phone} onChange={event =>setPhone(event.target.value)} required/>
                    </div>

                    <div className="item-container">
                        <label for="gender">Gender <span  className="red-asteriks">*</span></label><br/>
                        <select name="gender" className="list" required>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Others">Others</option>
                        </select>
                    </div>
                    
                    <div className="item-container">
                        <label for="dob">Date of Birth <span  className="red-asteriks">*</span></label><br/>
                        <input type="date" name="dob" id="dob" className="entries" value={dob} onChange={event =>setDOB(event.target.value)} required/>
                    </div>

                <div id="images-subsection">
                    <div className="img-input-container">
                        <div className="item-container img-item">
                            <label for="passport">Upload Passport Photograph<span className="red-asteriks">*</span></label><br/>
                            <input type="file" accept="image/*" name="passport" id="passport" className="entries img-input" onChange={handlePassportUpload} required/>
                        </div>
                        <div className="item-container img-item"> 
                            <label for="id-img">Upload ID Card<span className="red-asteriks">*</span></label><br/>
                            <input type="file" accept="image/*" name="id-img" id="id-img" className="entries img-input" onChange={handleIdImageUpload} required/>
                        </div>
                    </div>
                    <div className="img-container">
                        <div className="picture-box image">
                            {passport? (
                                    <img src={passportURL} alt="Selected" width={200} height={200} id="imgx"/>
                                ):
                                (<span className="select-image">
                                    <div className="no-image">No image selected</div>
                                </span>)}
                        </div>
                        <div className="picture-box image">
                            {idImage? (
                                    <img src={idImageURL} alt="Selected" width= {200} height={200} id="imgx"/>
                                ):
                                (<span className="select-image">
                                    <div className="no-image">No image selected</div>
                                </span>)}
                        </div>
                    </div>
                </div>
                    <input type="submit" name="submit" id="submit" value="Submit" />
                </center>
            </form>
        </div>
    )
}
export default MyForm;