import React from "react";
import "./ResourceLinksSection.css";

const ResourceLinksSection = ({ title, links, className = "" }) => {
  return (
    <div className={`ResourceLinksSection ${className}`}>
      <h3>{title}</h3>
      <ul className="ResourceLinksList">
        {links.map((link, idx) => (
          <li key={idx} className="ResourceLinkItem">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: link.color }}
            >
              <span className="ResourceLinkIcon">{link.icon}</span>
              <span className="ResourceLinkText">{link.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResourceLinksSection;
