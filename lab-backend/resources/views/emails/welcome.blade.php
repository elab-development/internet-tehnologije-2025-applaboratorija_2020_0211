<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Dobrodošli u ResearchHub!</title>
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
            background-color: #007bff;
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
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #999;
        }
        .button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Dobrodošli u ResearchHub!</h1>
        </div>
        <div class="content">
            <p>Pozdrav {{ $user->name }},</p>

            <p>Vaš nalog je uspešno kreiran u ResearchHub platformi. ResearchHub je moderna platforma za saradnju u istraživačkim projektima, upravljanje eksperimentima, uzorcima i opremom.</p>

            <h2>Šta možete raditi:</h2>
            <ul>
                <li>Kreirati i upravljati istraživačkim projektima</li>
                <li>Dokumentovati eksperimente i rezultate</li>
                <li>Upravljati laboratorijskom opremom</li>
                <li>Rezervisati opremu za vaše istraživane</li>
                <li>Saradnje sa kolegama na zajedničkim projektima</li>
            </ul>

            <p>Posetite platformu:</p>
            <a href="{{ config('app.frontend_url') }}" class="button">Pristupite ResearchHub-u</a>

            <p style="margin-top: 30px;">Ako imate bilo kakva pitanja, slobodno nas kontaktirajte.</p>

            <p>Srdačni pozdrav,<br>ResearchHub Tim</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} ResearchHub. Sva prava zadržana.</p>
        </div>
    </div>
</body>
</html>
