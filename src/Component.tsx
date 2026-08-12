import React, { useState, useEffect } from 'react';

interface UserProps {
  userBioHtml: string;
  redirectUrl: string;
}

export const VulnerableProfile: React.FC<UserProps> = ({ userBioHtml, redirectUrl }) => {
  const [data, setData] = useState<any>(null); // 🚨 Code Smell: Avoid explicit 'any' type
  const [counter, setCounter] = useState(0);

  // 🚨 SonarQube Rule: Unused state variable (Code Smell)
  const [unusedState, setUnusedState] = useState("I am never used");

  useEffect(() => {
    // 🚨 Security Hotspot: Open Redirect Vulnerability
    if (redirectUrl) {
      window.location.href = redirectUrl; // Direct redirect to untrusted user input
    }
  }, [redirectUrl]);

  // 🚨 Code Smell: Hardcoded HTTP URL instead of HTTPS
  const fetchExternalData = () => {
    fetch("http://insecure-api.example.com/data")
      .then(res => res.json())
      .then(d => setData(d));
  };

  return (
    <div className="profile-container">
      <h2>User Profile</h2>

      {/* 🚨 Security Vulnerability: Cross-Site Scripting (XSS) */}
      <div 
        dangerouslySetInnerHTML={{ __html: userBioHtml }} 
      />

      {/* 🚨 Code Smell / Security Rule: target="_blank" without rel="noopener noreferrer" */}
      <a href="https://external-website.com" target="_blank">
        Visit External Site
      </a>

      <button onClick={fetchExternalData}>Load Data</button>

      {/* 🚨 Code Smell: Inline evaluation / unescaped dangerous elements */}
      <button onClick={() => eval("alert('Insecure Eval Execution!')")}>
        Execute Script
      </button>
    </div>
  );
};
