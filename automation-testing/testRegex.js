const s = '[1/212] [chromium] \u203A tests\\Auth\\uat.spec.js:12:5 \u203A Auth Module \u203A LGN-F-001: Tampil Halaman Login'; 
const progressRegex = /\[(\d+)\/(\d+)\]\s+\[\w+\](?:.*?)([a-zA-Z]{2,5}-?[a-zA-Z0-9]{0,3}-?\d{1,4})(?:[:\s]|$)/; 
console.log(s.match(progressRegex));