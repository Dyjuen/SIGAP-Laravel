<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $subject ?? 'SIGAP PNJ'; ?></title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #E3F2FD 0%, #B3E5FC 100%);
            background-color: #ECF7FB;
            font-family: 'Nexa', Arial, sans-serif;
        }
        .container {
            width: 100%;
            padding: 40px 0;
            background: linear-gradient(135deg, #ffffff 0%, <?php echo $emailData['status_color'] ?? '#e7fbff'; ?>20 100%);
            background-color: #ECF7FB;
        }
        .card {
            width: 90%;
            max-width: 500px;
            margin: 0 auto;
            margin-top: 30px;
            background-color: #ffffff;
            border-radius: 16px;
            border: 1px solid <?php echo $emailData['status_color'] ?? '#e0e0e0'; ?>;
            overflow: hidden;
            position: relative;
        }
        .card-header {
            background-color: <?php echo $emailData['status_color'] ?? '#dc3545'; ?>;
            height: 30px;
            width: 100%;
            border-radius: 16px 16px 0 0;
        }
        .content {
            padding: 40px 40px 40px 40px;
        }
        .title {
            font-size: 28px;
            font-weight: bold;
            color: <?php echo $emailData['status_color'] ?? '#1ABDD4'; ?>;
            margin: 0 0 20px 0;
            text-align: center;
        }
        .body-text {
            font-size: 16px;
            color: #333333;
            line-height: 1.6;
            margin: 0 0 30px 0;
        }
        .button-container {
            text-align: left;
            margin-bottom: 30px;
        }
        .button {
            background-color: <?php echo $emailData['status_color'] ?? '#1ABDD4'; ?>;
            color: #ffffff !important;
            padding: 14px 40px;
            border-radius: 12px;
            text-decoration: none;
            font-size: 16px;
            font-weight: bold;
            display: inline-block;
        }
        .button * {
            color: #ffffff !important;
        }
        .footer-text {
            font-size: 14px;
            color: #333333;
            margin: 0 0 8px 0;
        }
        .footer-text strong {
            font-weight: bold;
            color: #000000;
        }
        .bottom-section {
            text-align: center;
            padding-top: 40px;
        }
        .logo {
            width: 60px;
            margin: 0 auto 20px auto;
        }
        .phone-number {
            font-size: 14px;
            color: #000000;
            font-weight: normal;
            margin: 0 0 10px 0;
        }
        .address {
            font-size: 12px;
            color: #888888;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="card-header"></div>
            <div class="content">
                <?php if (isset($emailData['title'])) { ?>
                    <h1 class="title"><?php echo $emailData['title']; ?></h1>
                <?php } ?>
                
                <?php if (isset($emailData['body'])) { ?>
                    <p class="body-text"><?php echo $emailData['body']; ?></p>
                <?php } ?>

                <?php if (isset($emailData['button_text']) && isset($emailData['button_link'])) { ?>
                    <div class="button-container">
                        <a href="<?php echo $emailData['button_link']; ?>" class="button"><?php echo $emailData['button_text']; ?></a>
                    </div>
                <?php } ?>

                <?php if (isset($emailData['footer_line1'])) { ?>
                    <p class="footer-text"><?php echo $emailData['footer_line1']; ?></p>
                <?php } ?>
                
                <?php if (isset($emailData['footer_line2'])) { ?>
                    <p class="footer-text"><?php echo $emailData['footer_line2']; ?></p>
                <?php } ?>
            </div>
        </div>
        <div class="bottom-section">
            <img src="<?php echo $logoUrl ?? 'cid:logo'; ?>" alt="Logo" class="logo">
            <p class="phone-number">+123 456 789</p>
            <p class="address">Lorem ipsum dolor sit<br>amet, consectetur adipiscing elit,</p>
        </div>
    </div>
</body>
</html>