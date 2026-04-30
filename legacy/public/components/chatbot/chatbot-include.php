<?php
/**
 * LPJ/KAK Chatbot Component Include
 *
 * Usage: <?php include 'components/chatbot/chatbot-include.php'; ?>
 */
$vps_ip = $_ENV['OLLAMA_API_HOST'] ?? 'YOUR_VPS_IP'; // Set your VPS IP here
?>

<link rel="stylesheet" href="components/chatbot/chatbot-styles.css">
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Using PHP to inject the VPS IP address
    new ChatbotBubble('http://<?php echo $vps_ip; ?>:11434');
});
</script>
<script src="components/chatbot/chatbot-bubble.js"></script>