const fs = require('fs');
const path = require('path');

const phpFile = path.join(__dirname, '..', 'tests', 'Feature', 'KakMailTest.php');
let content = fs.readFileSync(phpFile, 'utf8');

content = content.replace('public function test_submit_sends_email_to_verifikator(): void', 
    '/**\n     * Test Case: KAK-IT-002, KAK-IT-036\n     */\n    public function test_submit_sends_email_to_verifikator(): void');

content = content.replace('public function test_approve_sends_email_to_pengusul(): void', 
    '/**\n     * Test Case: KAK-IT-005, KAK-IT-037\n     */\n    public function test_approve_sends_email_to_pengusul(): void');

content = content.replace('public function test_reject_sends_email_to_pengusul(): void', 
    '/**\n     * Test Case: KAK-IT-038\n     */\n    public function test_reject_sends_email_to_pengusul(): void');

content = content.replace('public function test_transaction_rolls_back_if_mail_fails(): void', 
    '/**\n     * Test Case: KAK-IT-023\n     */\n    public function test_transaction_rolls_back_if_mail_fails(): void');

fs.writeFileSync(phpFile, content);
console.log('Fixed KakMailTest.php');
