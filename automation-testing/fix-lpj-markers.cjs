const fs = require('fs');
const path = require('path');

const phpFile = path.join(__dirname, '..', 'tests', 'Feature', 'Validation', 'LPJValidationTest.php');
let content = fs.readFileSync(phpFile, 'utf8');

content = content.replace('public function test_lpj_revise_validation_rules()', 
    '/**\n     * Test Case: LPJ-F-003, LPJ-F-004, LPJ-F-005\n     */\n    public function test_lpj_revise_validation_rules()');

fs.writeFileSync(phpFile, content);
console.log('Fixed LPJValidationTest.php');
