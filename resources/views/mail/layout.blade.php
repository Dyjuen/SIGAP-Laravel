<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('subject', 'SIGAP PNJ')</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #ECF7FB;
            font-family: Arial, sans-serif;
        }
        .container {
            width: 100%;
            padding: 40px 0;
            background-color: #ECF7FB;
        }
        .card {
            width: 90%;
            max-width: 500px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            border: 1px solid #e0e0e0;
            overflow: hidden;
            position: relative;
        }
        .card-header {
            background-color: {{ $status_color ?? '#dc3545' }};
            height: 30px;
            width: 100%;
            border-radius: 16px 16px 0 0;
        }
        .content {
            padding: 40px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            color: {{ $status_color ?? '#1ABDD4' }};
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
            text-align: center;
            margin-bottom: 30px;
        }
        .button {
            background-color: {{ $status_color ?? '#1ABDD4' }};
            color: #ffffff !important;
            padding: 14px 40px;
            border-radius: 12px;
            text-decoration: none;
            font-size: 16px;
            font-weight: bold;
            display: inline-block;
        }
        .footer-text {
            font-size: 14px;
            color: #666666;
            margin: 0 0 8px 0;
        }
        .bottom-section {
            text-align: center;
            padding-top: 40px;
            color: #888888;
        }
        .logo {
            width: 60px;
            margin: 0 auto 20px auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="card-header"></div>
            <div class="content">
                @hasSection('title')
                    <h1 class="title">@yield('title')</h1>
                @endif
                
                <div class="body-text">
                    @yield('content')
                </div>

                @hasSection('button_link')
                    <div class="button-container">
                        <a href="@yield('button_link')" class="button">@yield('button_text', 'Buka Aplikasi')</a>
                    </div>
                @endif

                @yield('footer')
            </div>
        </div>
        <div class="bottom-section">
            <p><strong>SIGAP PNJ</strong></p>
            <p>Politeknik Negeri Jakarta</p>
        </div>
    </div>
</body>
</html>
