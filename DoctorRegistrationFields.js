          {/* ---------- DOCTOR SECTION ---------- */}
          {role === 'doctor' && (
            <>
              {/* Basic Information */}
              <div style={{ background: '#f0f8ff', padding: '1rem', borderRadius: '8px', margin: '1rem 0' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#2c5aa0' }}>👨⚕️ Basic Information</h4>
                
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
              </div>

              {/* Education & Credentials */}
              <div style={{ background: '#f0fff4', padding: '1rem', borderRadius: '8px', margin: '1rem 0' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#16a34a' }}>🎓 Education & Credentials</h4>
                
                <label>University/College</label>
                <input type="text" name="university" className="modern-input" onChange={handleChange} value={formData.university} placeholder="Where you completed your degree" />

                <label>Certifications & Fellowships</label>
                <textarea name="certifications" className="modern-input" rows="3" onChange={handleChange} value={formData.certifications} placeholder="List your certifications, fellowships (one per line)" />

                <label>Medical Council Registration</label>
                <input type="text" name="medicalCouncilReg" className="modern-input" onChange={handleChange} value={formData.medicalCouncilReg} placeholder="Your medical council registration number" />
              </div>

              {/* Expertise */}
              <div style={{ background: '#fff7ed', padding: '1rem', borderRadius: '8px', margin: '1rem 0' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#ea580c' }}>🔬 Expertise</h4>
                
                <label>Diseases/Conditions Treated</label>
                <textarea name="conditionsTreated" className="modern-input" rows="3" onChange={handleChange} value={formData.conditionsTreated} placeholder="List conditions you specialize in treating (one per line)" />

                <label>Key Procedures Performed</label>
                <textarea name="keyProcedures" className="modern-input" rows="3" onChange={handleChange} value={formData.keyProcedures} placeholder="List key procedures you perform (one per line)" />

                <label>Special Interests</label>
                <textarea name="specialInterests" className="modern-input" rows="2" onChange={handleChange} value={formData.specialInterests} placeholder="Your niche areas of interest (one per line)" />
              </div>

              {/* Professional Experience */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', margin: '1rem 0' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#475569' }}>💼 Professional Experience</h4>
                
                <label>Previous Hospitals/Clinics</label>
                <textarea name="previousHospitals" className="modern-input" rows="3" onChange={handleChange} value={formData.previousHospitals} placeholder="List previous workplaces (one per line)" />

                <label>Academic Roles</label>
                <textarea name="academicRoles" className="modern-input" rows="2" onChange={handleChange} value={formData.academicRoles} placeholder="Professor, Lecturer, etc. (one per line)" />

                <label>Workshops & Conferences</label>
                <textarea name="workshopsAttended" className="modern-input" rows="3" onChange={handleChange} value={formData.workshopsAttended} placeholder="Recent workshops/conferences attended (one per line)" />
              </div>

              {/* Achievements */}
              <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '8px', margin: '1rem 0' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#d97706' }}>🏆 Achievements</h4>
                
                <label>Awards & Recognitions</label>
                <textarea name="awards" className="modern-input" rows="2" onChange={handleChange} value={formData.awards} placeholder="Awards and recognitions received (one per line)" />

                <label>Research Papers/Publications</label>
                <textarea name="publications" className="modern-input" rows="3" onChange={handleChange} value={formData.publications} placeholder="Your published research papers (one per line)" />

                <label>Professional Memberships</label>
                <textarea name="memberships" className="modern-input" rows="2" onChange={handleChange} value={formData.memberships} placeholder="IMA, MCI, etc. (one per line)" />
              </div>

              {/* Patient-Focused */}
              <div style={{ background: '#f3e8ff', padding: '1rem', borderRadius: '8px', margin: '1rem 0' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#7c3aed' }}>💙 Patient Care</h4>
                
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
              </div>
              
              <div className="gov-notice">
                <p>⚠️ <strong>Doctor Verification Required:</strong></p>
                <p>All doctors must be verified by the Government Health Ministry before accessing the platform. Your registration will be pending until verification is complete.</p>
              </div>
            </>
          )}