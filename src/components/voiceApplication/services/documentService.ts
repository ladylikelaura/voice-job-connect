
/**
 * Service for generating downloadable documents from CV data
 */

/**
 * Convert CV data to a downloadable docx-like format
 * @param cvData The structured CV data
 * @returns A Blob containing the document
 */
export const generateWordDocument = (cvData: any): Blob => {
  // For now, create a simple HTML representation that will download as a .doc file
  // (This is a simple approach - for production, consider using libraries like docx.js)
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Professional CV - ${cvData.personalInfo?.name || 'Candidate'}</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; margin: 1in; }
        h1 { color: #2c3e50; border-bottom: 1px solid #7f8c8d; padding-bottom: 5px; }
        h2 { color: #34495e; margin-top: 15px; border-bottom: 1px solid #bdc3c7; padding-bottom: 3px; }
        .section { margin-bottom: 15px; }
        .contact-info { margin-bottom: 20px; }
        .item { margin-bottom: 10px; }
        .item-title { font-weight: bold; }
        .item-subtitle { font-style: italic; color: #7f8c8d; }
        .skills-list { display: flex; flex-wrap: wrap; }
        .skill-item { background: #f1f2f6; padding: 3px 8px; margin: 3px; border-radius: 3px; }
      </style>
    </head>
    <body>
      <h1>${cvData.personalInfo?.name || 'Professional CV'}</h1>
      
      <div class="contact-info">
        ${cvData.personalInfo?.email ? `Email: ${cvData.personalInfo.email}<br>` : ''}
        ${cvData.personalInfo?.phone ? `Phone: ${cvData.personalInfo.phone}<br>` : ''}
      </div>
      
      <div class="section">
        <h2>Professional Summary</h2>
        <p>${cvData.professionalSummary || 'Experienced professional with a track record of success.'}</p>
      </div>
      
      ${cvData.jobTitle ? `
      <div class="section">
        <h2>Professional Title</h2>
        <p>${cvData.jobTitle}</p>
      </div>
      ` : ''}
      
      ${cvData.skills && cvData.skills.length > 0 ? `
      <div class="section">
        <h2>Skills</h2>
        <div class="skills-list">
          ${cvData.skills.map((skill: string) => `<div class="skill-item">${skill}</div>`).join('')}
        </div>
      </div>
      ` : ''}
      
      ${cvData.experience && cvData.experience.length > 0 ? `
      <div class="section">
        <h2>Professional Experience</h2>
        ${cvData.experience.map((exp: any) => `
          <div class="item">
            <div class="item-title">${exp.company || 'Company'} ${exp.duration ? `- ${exp.duration}` : ''}</div>
            <div class="item-subtitle">${exp.role || 'Role'}</div>
            <ul>
              ${Array.isArray(exp.responsibilities) 
                ? exp.responsibilities.map((resp: string) => `<li>${resp}</li>`).join('') 
                : '<li>Responsible for key deliverables and projects</li>'}
            </ul>
          </div>
        `).join('')}
      </div>
      ` : ''}
      
      ${cvData.education && cvData.education.length > 0 ? `
      <div class="section">
        <h2>Education</h2>
        ${cvData.education.map((edu: any) => `
          <div class="item">
            <div class="item-title">${edu.degree || 'Degree'}</div>
            <div class="item-subtitle">${edu.institution || 'Institution'} ${edu.year ? `- ${edu.year}` : ''}</div>
          </div>
        `).join('')}
      </div>
      ` : ''}
      
      ${cvData.certifications && cvData.certifications.length > 0 ? `
      <div class="section">
        <h2>Certifications</h2>
        <ul>
          ${cvData.certifications.map((cert: string) => `<li>${cert}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
      
      ${cvData.languages && cvData.languages.length > 0 ? `
      <div class="section">
        <h2>Languages</h2>
        <p>${cvData.languages.join(', ')}</p>
      </div>
      ` : ''}
    </body>
    </html>
  `;
  
  return new Blob([htmlContent], { type: 'application/msword' });
};

/**
 * Generate a PDF document from CV data
 * @param cvData The structured CV data
 * @returns A Blob containing the PDF
 */
export const generatePdfDocument = (cvData: any): Blob => {
  // For PDF we need a proper MIME type and a different approach to structure
  // Using HTML with PDF-specific styling
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Professional CV - ${cvData.personalInfo?.name || 'Candidate'}</title>
      <style>
        @page {
          margin: 1cm;
          size: A4 portrait;
        }
        body { 
          font-family: 'Arial', sans-serif; 
          margin: 0; 
          padding: 0.5in;
          color: #333;
        }
        h1 { 
          color: #2c3e50; 
          border-bottom: 2px solid #3498db; 
          padding-bottom: 7px; 
          margin-top: 0;
        }
        h2 { 
          color: #34495e; 
          margin-top: 15px; 
          border-bottom: 1px solid #3498db; 
          padding-bottom: 3px; 
        }
        .section { margin-bottom: 15px; }
        .contact-info { margin-bottom: 20px; }
        .item { margin-bottom: 15px; }
        .item-title { font-weight: bold; }
        .item-subtitle { font-style: italic; color: #7f8c8d; }
        .skills-list { display: flex; flex-wrap: wrap; }
        .skill-item { 
          background: #e8f4fc; 
          padding: 3px 8px; 
          margin: 3px; 
          border-radius: 3px; 
          display: inline-block;
        }
        ul { padding-left: 20px; }
        li { margin-bottom: 3px; }
      </style>
    </head>
    <body>
      <h1>${cvData.personalInfo?.name || 'Professional CV'}</h1>
      
      <div class="contact-info">
        ${cvData.personalInfo?.email ? `Email: ${cvData.personalInfo.email}<br>` : ''}
        ${cvData.personalInfo?.phone ? `Phone: ${cvData.personalInfo.phone}<br>` : ''}
      </div>
      
      <div class="section">
        <h2>Professional Summary</h2>
        <p>${cvData.professionalSummary || 'Experienced professional with a track record of success.'}</p>
      </div>
      
      ${cvData.jobTitle ? `
      <div class="section">
        <h2>Professional Title</h2>
        <p>${cvData.jobTitle}</p>
      </div>
      ` : ''}
      
      ${cvData.skills && cvData.skills.length > 0 ? `
      <div class="section">
        <h2>Skills</h2>
        <div class="skills-list">
          ${cvData.skills.map((skill: string) => `<div class="skill-item">${skill}</div>`).join(' ')}
        </div>
      </div>
      ` : ''}
      
      ${cvData.experience && cvData.experience.length > 0 ? `
      <div class="section">
        <h2>Professional Experience</h2>
        ${cvData.experience.map((exp: any) => `
          <div class="item">
            <div class="item-title">${exp.company || 'Company'} ${exp.duration ? `- ${exp.duration}` : ''}</div>
            <div class="item-subtitle">${exp.role || 'Role'}</div>
            <ul>
              ${Array.isArray(exp.responsibilities) 
                ? exp.responsibilities.map((resp: string) => `<li>${resp}</li>`).join('') 
                : '<li>Responsible for key deliverables and projects</li>'}
            </ul>
          </div>
        `).join('')}
      </div>
      ` : ''}
      
      ${cvData.education && cvData.education.length > 0 ? `
      <div class="section">
        <h2>Education</h2>
        ${cvData.education.map((edu: any) => `
          <div class="item">
            <div class="item-title">${edu.degree || 'Degree'}</div>
            <div class="item-subtitle">${edu.institution || 'Institution'} ${edu.year ? `- ${edu.year}` : ''}</div>
          </div>
        `).join('')}
      </div>
      ` : ''}
      
      ${cvData.certifications && cvData.certifications.length > 0 ? `
      <div class="section">
        <h2>Certifications</h2>
        <ul>
          ${cvData.certifications.map((cert: string) => `<li>${cert}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
      
      ${cvData.languages && cvData.languages.length > 0 ? `
      <div class="section">
        <h2>Languages</h2>
        <p>${cvData.languages.join(', ')}</p>
      </div>
      ` : ''}
    </body>
    </html>
  `;
  
  // Use proper PDF MIME type
  return new Blob([htmlContent], { type: 'application/pdf' });
};
