const text = "Student: John Doe\nGPA: 3.5";
const studentNameMatch = text.match(/(?:student|name)[:\s]+([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})*/i);
console.log('Match:', studentNameMatch ? studentNameMatch[1] : 'no match');
