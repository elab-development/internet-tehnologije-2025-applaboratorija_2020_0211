<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rad je obrisan</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .header {
            background-color: #dc3545;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: white;
            padding: 20px;
            border-radius: 0 0 5px 5px;
        }
        .info-box {
            background-color: #fff3cd;
            padding: 15px;
            border-left: 4px solid #dc3545;
            margin: 15px 0;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Rad je obrisan</h1>
        </div>
        <div class="content">
            <p>Pozdrav {{ $user->name }},</p>

            <p>Obaveštavamo vas da je sledeći rad obrisan iz ResearchHub platforme:</p>

            <div class="info-box">
                <p><strong>Naslov rada:</strong> {{ $paperTitle }}</p>
                <p><strong>Datum brisanja:</strong> {{ now()->format('d.m.Y H:i') }}</p>
            </div>

            <p>Ako mislite da je ovo urađeno greškom, molimo vas da kontaktirate administratore ResearchHub platforme.</p>

            <p style="margin-top: 30px;">Srdačni pozdrav,<br>ResearchHub Tim</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} ResearchHub. Sva prava zadržana.</p>
        </div>
    </div>
</body>
</html>
