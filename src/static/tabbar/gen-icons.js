const fs = require('fs');

const homeNormal = `<svg xmlns="http://www.w3.org/2000/svg" width="81" height="81" viewBox="0 0 81 81"><path d="M40.5 12L10 38h8v31h17V51h11v18h17V38h8z" fill="none" stroke="#888" stroke-width="4" stroke-linejoin="round"/></svg>`;
const homeActive = `<svg xmlns="http://www.w3.org/2000/svg" width="81" height="81" viewBox="0 0 81 81"><path d="M40.5 12L10 38h8v31h17V51h11v18h17V38h8z" fill="#a78bfa" stroke="#a78bfa" stroke-width="2" stroke-linejoin="round"/></svg>`;
const aiNormal   = `<svg xmlns="http://www.w3.org/2000/svg" width="81" height="81" viewBox="0 0 81 81"><rect x="18" y="22" width="45" height="37" rx="8" fill="none" stroke="#888" stroke-width="4"/><circle cx="30" cy="40" r="4" fill="#888"/><circle cx="51" cy="40" r="4" fill="#888"/><path d="M33 50 q7.5 6 15 0" fill="none" stroke="#888" stroke-width="3" stroke-linecap="round"/><line x1="30" y1="22" x2="30" y2="16" stroke="#888" stroke-width="3"/><line x1="51" y1="22" x2="51" y2="16" stroke="#888" stroke-width="3"/><circle cx="30" cy="14" r="3" fill="#888"/><circle cx="51" cy="14" r="3" fill="#888"/></svg>`;
const aiActive   = `<svg xmlns="http://www.w3.org/2000/svg" width="81" height="81" viewBox="0 0 81 81"><rect x="18" y="22" width="45" height="37" rx="8" fill="#a78bfa" stroke="#a78bfa" stroke-width="2"/><circle cx="30" cy="40" r="4" fill="#fff"/><circle cx="51" cy="40" r="4" fill="#fff"/><path d="M33 50 q7.5 6 15 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><line x1="30" y1="22" x2="30" y2="16" stroke="#a78bfa" stroke-width="3"/><line x1="51" y1="22" x2="51" y2="16" stroke="#a78bfa" stroke-width="3"/><circle cx="30" cy="14" r="3" fill="#a78bfa"/><circle cx="51" cy="14" r="3" fill="#a78bfa"/></svg>`;

fs.writeFileSync('home.svg',        homeNormal);
fs.writeFileSync('home-active.svg', homeActive);
fs.writeFileSync('ai.svg',          aiNormal);
fs.writeFileSync('ai-active.svg',   aiActive);
console.log('done');
