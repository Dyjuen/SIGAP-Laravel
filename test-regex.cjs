const fs=require('fs'); 
const xmlContent=fs.readFileSync('automation-testing/reports/phpunit-report.xml', 'utf8'); 
const mappingPath = 'automation-testing/test-mapping.json';
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

const testCaseRegex = /<testcase\s+name="([^"]+)"(.*?)(?:><\/testcase>|\/>|>(.*?)<\/testcase>)/gs;
let count=0; 
let match;
const results = {};
while((match = testCaseRegex.exec(xmlContent)) !== null) { 
    let methodName = match[1];
    const innerContent = match[3] || '';
    const mappedId = mapping[methodName] || Object.entries(mapping).find(([m, id]) => m.includes(methodName) || methodName.includes(m))?.[1];
    if(mappedId) {
        count++;
        results[mappedId] = 'Pass';
    } else {
        // console.log('Unmapped:', methodName);
    }
} 
console.log('Mapped count:', count);