<?php
// DB/WEB/Auth.php

declare(strict_types=1);

function godcode_require_session(array $options = []): void
{
    $loginUrl   = $options['login_url'] ?? '/VIEW/Login.php';
    $cookieName = $options['cookie_name'] ?? 'usuario';

    if (PHP_SAPI === 'cli') return;

    if (headers_sent()) {
        echo '<script>window.location.href = ' . json_encode($loginUrl) . ';</script>';
        exit;
    }

    $rawCookie = $_COOKIE[$cookieName] ?? '';

    if (!$rawCookie) {
        godcode_clear_cookie($cookieName);
        header('Location: ' . $loginUrl, true, 302);
        exit;
    }

    $payload = json_decode($rawCookie, true);

    if (!is_array($payload)) {
        godcode_clear_cookie($cookieName);
        header('Location: ' . $loginUrl, true, 302);
        exit;
    }

    $userId = (int)($payload['id'] ?? 0);

    if ($userId <= 0) {
        godcode_clear_cookie($cookieName);
        header('Location: ' . $loginUrl, true, 302);
        exit;
    }

    // esto ya es para un futuro
    // 1. Consultar usuario por ID
    // 2. Comparar correo, telefono, estatus, nombre, etc.
    // 3. Si no coincide, borrar cookie y mandar a Login

    $GLOBALS['godcode_usuario'] = $payload;
}

function godcode_clear_cookie(string $cookieName): void
{
    setcookie(
        $cookieName,
        '',
        time() - 3600,
        '/',
        '',
        isset($_SERVER['HTTPS']),
        false
    );
}