// src/components/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api';
import './Register.css';

const degrees = [
  "MBBS",
  "BAMS",
  "BHMS",
  "BUMS",
  "BSMS",
  "BNYS",
  "BDS"
];

const specializationMap = {
  MBBS: [
    "General Medicine", "General Surgery", "Pediatrics", "Obstetrics & Gynecology",
    "Orthopedics", "Dermatology", "Ophthalmology", "ENT", "Psychiatry",
    "Anesthesiology", "Radiology", "Pathology", "Community Medicine",
    "Family Medicine", "Emergency Medicine", "Physical Medicine & Rehabilitation",
    "Cardiology", "Neurology", "Nephrology", "Gastroenterology", "Endocrinology",
    "Clinical Hematology", "Medical Oncology", "Rheumatology",
    "Infectious Diseases", "Pulmonology", "Hepatology",
    "Neurosurgery", "Plastic Surgery", "Cardiothoracic Surgery",
    "Pediatric Surgery", "Urology", "Surgical Oncology", "Vascular Surgery"
  ],

  BAMS: ["Kayachikitsa", "Panchakarma", "Shalya Tantra", "Shalakya Tantra", "Prasuti & Stri Roga (Ayurveda)", "Kaumarbhritya"],

  BHMS: ["Homeopathic Repertory", "Homeopathic Materia Medica", "Organon of Medicine"],

  BUMS: ["Ilmul Advia", "Ilmul Amraz", "Moalijat"],

  BSMS: ["Siddha General Medicine", "Siddha Pharmacology"],

  BNYS: ["Yoga Therapy", "Naturopathy Medicine"],

  BDS: [
    "Oral Medicine & Radiology", "Oral & Maxillofacial Surgery", "Orthodontics",
    "Periodontology", "Prosthodontics", "Pedodontics",
    "Conservative Dentistry & Endodontics", "Public Health Dentistry"
  ]
};

const Register = () => {
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    age: '',
    gender: '',
    specialization: '',
    hospital: '',
    degree: '',
    aadhaar: '',
    department: '',
    govId: '',
    accessLevel: '',
    medicalTitle: '',
    yearsOfExperience: '',
    university: '',
    certifications: '',
    medicalCouncilReg: '',
    conditionsTreated: '',
    keyProcedures: '',
    specialInterests: '',
    previousHospitals: '',
    academicRoles: '',
    workshopsAttended: '',
    awards: '',
    publications: '',
    memberships: '',
    consultationType: '',
    languagesSpoken: '',
    carePhilosophy: '',
    successStories: ''
  });

  // Aadhaar OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [aadhaarVerified, setAadhaarVerified] = useState(false);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // --- Aadhaar prototype OTP ---
  const sendOtp = () => {
    if (!formData.aadhaar || formData.aadhaar.length !== 12) {
      return setError("Enter a valid 12-digit Aadhaar number.");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpSent(true);
    alert(`Prototype OTP: ${otp}`); // visible for prototype
  };

  const verifyOtp = () => {
    if (otpInput === generatedOtp) {
      setAadhaarVerified(true);
      setOtpSent(false);
      setError(null);
    } else {
      setError("Invalid OTP. Try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!formData.fullName || !formData.email || !formData.password) {
      setLoading(false);
      return setError('Please fill in all required fields.');
    }

    if (formData.password.length < 6) {
      setLoading(false);
      return setError('Password must be at least 6 characters long.');
    }

    // Prevent patient registration unless Aadhaar is verified
    if (role === "patient" && !aadhaarVerified) {
      setLoading(false);
      return setError("Please verify your Aadhaar before registering.");
    }

    // Government validation
    if (role === 'government' && (!formData.department || !formData.govId || !formData.accessLevel)) {
      setLoading(false);
      return setError('Please fill in all government fields.');
    }

    // Special government validation
    if (role === 'government') {
      if (formData.department !== 'health-ministry') {
        setLoading(false);
        return setError('Currently only Health Ministry registration is available.');
      }
      if (!/^\d{10}$/.test(formData.govId)) {
        setLoading(false);
        return setError('Government ID must be exactly 10 digits.');
      }
    }

    let url = '';
    let data = {};

    if (role === 'patient') {
      url = '/users/register';
      data = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender.trim() || undefined,
      };
    } else if (role === 'doctor') {
      url = '/doctors/register';
      data = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        degree: formData.degree,
        specialization: formData.specialization,
        hospital: formData.hospital.trim() || undefined,
        medicalTitle: formData.medicalTitle || undefined,
        department: formData.department.trim() || undefined,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : undefined,
        university: formData.university.trim() || undefined,
        certifications: formData.certifications ? formData.certifications.split('\n').filter(c => c.trim()) : undefined,
        medicalCouncilReg: formData.medicalCouncilReg.trim() || undefined,
        conditionsTreated: formData.conditionsTreated ? formData.conditionsTreated.split('\n').filter(c => c.trim()) : undefined,
        keyProcedures: formData.keyProcedures ? formData.keyProcedures.split('\n').filter(p => p.trim()) : undefined,
        specialInterests: formData.specialInterests ? formData.specialInterests.split('\n').filter(i => i.trim()) : undefined,
        previousHospitals: formData.previousHospitals ? formData.previousHospitals.split('\n').filter(h => h.trim()) : undefined,
        academicRoles: formData.academicRoles ? formData.academicRoles.split('\n').filter(r => r.trim()) : undefined,
        workshopsAttended: formData.workshopsAttended ? formData.workshopsAttended.split('\n').filter(w => w.trim()) : undefined,
        awards: formData.awards ? formData.awards.split('\n').filter(a => a.trim()) : undefined,
        publications: formData.publications ? formData.publications.split('\n').filter(p => p.trim()) : undefined,
        memberships: formData.memberships ? formData.memberships.split('\n').filter(m => m.trim()) : undefined,
        consultationType: formData.consultationType || undefined,
        languagesSpoken: formData.languagesSpoken ? formData.languagesSpoken.split(',').map(l => l.trim()).filter(l => l) : undefined,
        carePhilosophy: formData.carePhilosophy.trim() || undefined,
        successStories: formData.successStories.trim() || undefined
      };
    } else if (role === 'government') {
      // Government users register through admin endpoint
      url = '/users/register'; // Use same endpoint as patients but with special handling
      data = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        department: formData.department,
        govId: formData.govId,
        accessLevel: formData.accessLevel,
        role: 'government' // Add role identifier
      };
    }

    try {
      const response = await apiClient.post(url, data);
      console.log('Registration successful:', response.data);
      alert(`Registration successful! ${role === 'patient' ? 'Patient ID: ' + response.data.patientTagId : 'Doctor registered successfully'}`);
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed.';
      setError(errorMessage);
    }
    setLoading(false);
  };

  return (
    <div className="register-wrapper">
      <div className="register-card">

        <h2 className="title">Create Your Account</h2>

        {/* Role Toggle - 3 options: Patient, Doctor & Government */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${role === 'patient' ? 'role-btn-active' : ''}`}
            onClick={() => setRole('patient')}
          >
            👤 Patient
          </button>
          <button
            type="button"
            className={`role-btn ${role === 'doctor' ? 'role-btn-active' : ''}`}
            onClick={() => setRole('doctor')}
          >
            👨⚕️ Doctor
          </button>
          <button
            type="button"
            className={`role-btn ${role === 'government' ? 'role-btn-active' : ''}`}
            onClick={() => setRole('government')}
          >
            🏛️ Government
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">

          <label>Full Name</label>
          <input type="text" name="fullName" className="modern-input" required onChange={handleChange} value={formData.fullName} />

          <label>Email</label>
          <input type="email" name="email" className="modern-input" required onChange={handleChange} value={formData.email} />

          <label>Password</label>
          <input type="password" name="password" className="modern-input" required onChange={handleChange} value={formData.password} />

          {/* ---------- PATIENT SECTION ---------- */}
          {role === 'patient' && (
            <>
              {/* Aadhaar */}
              <label>Aadhaar Number</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  name="aadhaar"
                  className="modern-input"
                  maxLength="12"
                  disabled={aadhaarVerified}
                  value={formData.aadhaar}
                  onChange={(e) =>
                    setFormData({ ...formData, aadhaar: e.target.value.replace(/\D/g, "") })
                  }
                  required
                />

                {!aadhaarVerified && (
                  <button type="button" className="primary-button glossy-btn" onClick={sendOtp}>
                    Send OTP
                  </button>
                )}
              </div>

              {otpSent && !aadhaarVerified && (
                <>
                  <label>Enter OTP</label>
                  <input
                    type="text"
                    className="modern-input"
                    maxLength="6"
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                  />

                  <button type="button" className="primary-button glossy-btn" onClick={verifyOtp}>
                    Verify OTP
                  </button>
                </>
              )}

              {aadhaarVerified && (
                <p style={{ color: "green", fontWeight: "600" }}>✔ Aadhaar Verified</p>
              )}

              {/* Basic fields */}
              <label>Age (Optional)</label>
              <input type="number" name="age" className="modern-input" onChange={handleChange} value={formData.age} />

              <label>Gender (Optional)</label>
              <input type="text" name="gender" className="modern-input" onChange={handleChange} value={formData.gender} />
            </>
          )}

          {/* ---------- DOCTOR SECTION ---------- */}
          {role === 'doctor' && (
            <>
              {/* Basic Information */}
              <div style={{ margin: '1rem 0', padding: '0.5rem', background: '#f0f8ff', borderRadius: '8px', fontWeight: 'bold', color: '#2c5aa0' }}>👨⚕️ Basic Information</div>
              
              <label>Medical Title</label>
              <select name="medicalTitle" className="modern-input" onChange={handleChange} value={formData.medicalTitle}>
                <option value="">Select Title</option>
                <option value="Dr.">Dr.</option>
                <option value="Prof.">Prof.</option>
                <option value="Prof. Dr.">Prof. Dr.</option>
              </select>

              <label>Medical Degree</label>
              <select name="degree" className="modern-input" required value={formData.degree} onChange={handleChange}>
                <option value="">Select Degree</option>
                {degrees.map((deg) => (
                  <option key={deg} value={deg}>{deg}</option>
                ))}
              </select>

              <label>Specialization</label>
              <select name="specialization" className="modern-input" required value={formData.specialization} onChange={handleChange} disabled={!formData.degree}>
                <option value="">Select Specialization</option>
                {formData.degree && specializationMap[formData.degree].map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>

              <label>Department</label>
              <input type="text" name="department" className="modern-input" onChange={handleChange} value={formData.department} placeholder="e.g., Internal Medicine, Surgery" />

              <label>Years of Experience</label>
              <input type="number" name="yearsOfExperience" className="modern-input" onChange={handleChange} value={formData.yearsOfExperience} min="0" max="50" />

              <label>Current Hospital/Clinic</label>
              <input type="text" name="hospital" className="modern-input" onChange={handleChange} value={formData.hospital} placeholder="Current workplace" />

              {/* Education & Credentials */}
              <div style={{ margin: '1rem 0', padding: '0.5rem', background: '#f0fff4', borderRadius: '8px', fontWeight: 'bold', color: '#16a34a' }}>🎓 Education & Credentials</div>
              
              <label>University/College</label>
              <input type="text" name="university" className="modern-input" onChange={handleChange} value={formData.university} placeholder="Where you completed your degree" />

              <label>Certifications & Fellowships</label>
              <textarea name="certifications" className="modern-input" rows="3" onChange={handleChange} value={formData.certifications} placeholder="List your certifications, fellowships (one per line)" />

              <label>Medical Council Registration</label>
              <input type="text" name="medicalCouncilReg" className="modern-input" onChange={handleChange} value={formData.medicalCouncilReg} placeholder="Your medical council registration number" />

              {/* Expertise */}
              <div style={{ margin: '1rem 0', padding: '0.5rem', background: '#fff7ed', borderRadius: '8px', fontWeight: 'bold', color: '#ea580c' }}>🔬 Expertise</div>
              
              <label>Diseases/Conditions Treated</label>
              <textarea name="conditionsTreated" className="modern-input" rows="3" onChange={handleChange} value={formData.conditionsTreated} placeholder="List conditions you specialize in treating (one per line)" />

              <label>Key Procedures Performed</label>
              <textarea name="keyProcedures" className="modern-input" rows="3" onChange={handleChange} value={formData.keyProcedures} placeholder="List key procedures you perform (one per line)" />

              <label>Special Interests</label>
              <textarea name="specialInterests" className="modern-input" rows="2" onChange={handleChange} value={formData.specialInterests} placeholder="Your niche areas of interest (one per line)" />

              {/* Professional Experience */}
              <div style={{ margin: '1rem 0', padding: '0.5rem', background: '#f8f9fa', borderRadius: '8px', fontWeight: 'bold', color: '#374151' }}>💼 Professional Experience</div>
              
              <label>Previous Hospitals/Clinics</label>
              <textarea name="previousHospitals" className="modern-input" rows="3" onChange={handleChange} value={formData.previousHospitals} placeholder="List previous workplaces (one per line)" />

              <label>Academic Roles</label>
              <textarea name="academicRoles" className="modern-input" rows="2" onChange={handleChange} value={formData.academicRoles} placeholder="Professor, Lecturer, etc. (one per line)" />

              <label>Workshops & Conferences</label>
              <textarea name="workshopsAttended" className="modern-input" rows="3" onChange={handleChange} value={formData.workshopsAttended} placeholder="Recent workshops/conferences attended (one per line)" />

              {/* Achievements */}
              <div style={{ margin: '1rem 0', padding: '0.5rem', background: '#fef3c7', borderRadius: '8px', fontWeight: 'bold', color: '#d97706' }}>🏆 Achievements</div>
              
              <label>Awards & Recognitions</label>
              <textarea name="awards" className="modern-input" rows="2" onChange={handleChange} value={formData.awards} placeholder="Awards and recognitions received (one per line)" />

              <label>Research Papers/Publications</label>
              <textarea name="publications" className="modern-input" rows="3" onChange={handleChange} value={formData.publications} placeholder="Your published research papers (one per line)" />

              <label>Professional Memberships</label>
              <textarea name="memberships" className="modern-input" rows="2" onChange={handleChange} value={formData.memberships} placeholder="IMA, MCI, etc. (one per line)" />

              {/* Patient-Focused */}
              <div style={{ margin: '1rem 0', padding: '0.5rem', background: '#f3e8ff', borderRadius: '8px', fontWeight: 'bold', color: '#7c3aed' }}>💙 Patient Care</div>
              
              <label>Consultation Type</label>
              <select name="consultationType" className="modern-input" onChange={handleChange} value={formData.consultationType}>
                <option value="">Select Type</option>
                <option value="in-person">In-Person Only</option>
                <option value="online">Online Only</option>
                <option value="both">Both In-Person & Online</option>
              </select>

              <label>Languages Spoken</label>
              <input type="text" name="languagesSpoken" className="modern-input" onChange={handleChange} value={formData.languagesSpoken} placeholder="e.g., English, Hindi, Tamil (comma separated)" />

              <label>Patient Care Philosophy</label>
              <textarea name="carePhilosophy" className="modern-input" rows="3" onChange={handleChange} value={formData.carePhilosophy} placeholder="Describe your approach to patient care" />

              <label>Success Stories/Outcomes</label>
              <textarea name="successStories" className="modern-input" rows="3" onChange={handleChange} value={formData.successStories} placeholder="Brief description of notable patient outcomes or success stories" />
              
              <div className="gov-notice">
                <p>⚠️ <strong>Doctor Verification Required:</strong></p>
                <p>All doctors must be verified by the Government Health Ministry before accessing the platform. Your registration will be pending until verification is complete.</p>
              </div>
            </>
          )}

          {/* ---------- GOVERNMENT SECTION ---------- */}
          {role === 'government' && (
            <>
              <label>Department</label>
              <select
                name="department"
                className="modern-input"
                required
                value={formData.department}
                onChange={handleChange}
              >
                <option value="">Select Department</option>
                <option value="health-ministry">Ministry of Health & Family Welfare</option>
                <option value="digital-health">National Digital Health Mission</option>
                <option value="medical-council">Medical Council of India</option>
                <option value="drug-controller">Central Drugs Standard Control Organization</option>
                <option value="aiims">All India Institute of Medical Sciences</option>
              </select>

              <label>Government ID</label>
              <input
                type="text"
                name="govId"
                className="modern-input"
                placeholder="Enter 10-digit Government ID"
                required
                maxLength="10"
                pattern="\d{10}"
                value={formData.govId}
                onChange={(e) => setFormData({...formData, govId: e.target.value.replace(/\D/g, '')})}
              />

              <label>Access Level</label>
              <select
                name="accessLevel"
                className="modern-input"
                required
                value={formData.accessLevel}
                onChange={handleChange}
              >
                <option value="">Select Access Level</option>
                <option value="admin">Administrator</option>
                <option value="supervisor">Supervisor</option>
                <option value="analyst">Data Analyst</option>
                <option value="auditor">Auditor</option>
              </select>

              <div className="gov-notice">
                <p>⚠️ <strong>Government Registration Notice:</strong></p>
                <p>This registration is for authorized government personnel only. All activities are monitored and logged for security purposes.</p>
              </div>
            </>
          )}

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="primary-button glossy-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="footer-text">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;