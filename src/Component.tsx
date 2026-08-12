// import React, { useState, useEffect } from 'react';

// interface UserProps {
//   userBioHtml: string;
//   redirectUrl: string;
// }

// export const VulnerableProfile: React.FC<UserProps> = ({ userBioHtml, redirectUrl }) => {
//   const [data, setData] = useState<any>(null); // 🚨 Code Smell: Avoid explicit 'any' type
//   const [counter, setCounter] = useState(0);

//   // 🚨 SonarQube Rule: Unused state variable (Code Smell)
//   const [unusedState, setUnusedState] = useState("I am never used");

//   useEffect(() => {
//     // 🚨 Security Hotspot: Open Redirect Vulnerability
//     if (redirectUrl) {
//       window.location.href = redirectUrl; // Direct redirect to untrusted user input
//     }
//   }, [redirectUrl]);

//   // 🚨 Code Smell: Hardcoded HTTP URL instead of HTTPS
//   const fetchExternalData = () => {
//     fetch("http://insecure-api.example.com/data")
//       .then(res => res.json())
//       .then(d => setData(d));
//   };

//   return (
//     <div className="profile-container">
//       <h2>User Profile</h2>

//       {/* 🚨 Security Vulnerability: Cross-Site Scripting (XSS) */}
//       <div 
//         dangerouslySetInnerHTML={{ __html: userBioHtml }} 
//       />

//       {/* 🚨 Code Smell / Security Rule: target="_blank" without rel="noopener noreferrer" */}
//       <a href="https://external-website.com" target="_blank">
//         Visit External Site
//       </a>

//       <button onClick={fetchExternalData}>Load Data</button>

//       {/* 🚨 Code Smell: Inline evaluation / unescaped dangerous elements */}
//       <button onClick={() => eval("alert('Insecure Eval Execution!')")}>
//         Execute Script
//       </button>
//     </div>
//   );
// };



//  atul fix this issue


import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';

interface UserProfileData {
  id: string;
  name: string;
}

interface UserProps {
  userBioHtml: string;
  redirectUrl: string;
}

export const SecureProfile: React.FC<UserProps> = ({ userBioHtml, redirectUrl }) => {
  // ✅ Fix: Replaced 'any' with an explicit interface type
  const [data, setData] = useState<UserProfileData | null>(null);

  useEffect(() => {
    // ✅ Fix: Open Redirect Prevention — Validate destination domain
    if (redirectUrl) {
      try {
        const url = new URL(redirectUrl, window.location.origin);
        // Only allow relative paths or trusted internal domain redirects
        if (url.origin === window.location.origin) {
          window.location.href = url.pathname;
        }
      } catch {
        console.error("Invalid or unsafe redirect URL attempted.");
      }
    }
  }, [redirectUrl]);

  // ✅ Fix: Enforce HTTPS protocol
  const fetchExternalData = async () => {
    try {
      const response = await fetch("https://secure-api.example.com/data");
      const result: UserProfileData = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  // ✅ Fix: Sanitize user HTML using DOMPurify before rendering
  const sanitizedBio = DOMPurify.sanitize(userBioHtml);

  return (
    <div className="profile-container">
      <h2>User Profile</h2>

      {/* Cross-Site Scripting (XSS) mitigated by sanitizing HTML */}
      <div 
        dangerouslySetInnerHTML={{ __html: sanitizedBio }} 
      />

      {/* ✅ Fix: Added rel="noopener noreferrer" for security */}
      <a 
        href="https://external-website.com" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        Visit External Site
      </a>

      <button onClick={fetchExternalData}>Load Data</button>

      {/* ✅ Fix: Safe event handling without dynamic string evaluation (eval) */}
      <button onClick={() => alert('Action executed safely!')}>
        Execute Action
      </button>

      {data && <p>Loaded User ID: {data.id}</p>}
    </div>
  );
};
