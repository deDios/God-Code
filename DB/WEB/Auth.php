<?php
// DB/WEB/Auth.php

declare(strict_types=1);

/**
 * Valida que exista una sesión de usuario válida en la cookie.
 * Si no existe o está dañada, redirige al login.
 */
function godcode_require_session(array $options = []): void
{
    $loginUrl   = $options['login_url'] ?? '/VIEW/Login.php';
    $cookieName = $options['cookie_name'] ?? 'usuario';

    if (PHP_SAPI === 'cli') {
        return;
    }

    // Este archivo debe cargarse antes de cualquier salida HTML.
    if (headers_sent()) {
        echo '<script>window.location.href = ' . json_encode($loginUrl) . ';</script>';
        exit;
    }

    $rawCookie = $_COOKIE[$cookieName] ?? '';

    if (empty($rawCookie)) {
        godcode_redirect_login($cookieName, $loginUrl);
    }

    $payload = json_decode($rawCookie, true);

    if (!is_array($payload)) {
        godcode_redirect_login($cookieName, $loginUrl);
    }

    $userId = (int)($payload['id'] ?? 0);

    if ($userId <= 0) {
        godcode_redirect_login($cookieName, $loginUrl);
    }

    // Sesion disponible para usarla en la vista si se necesita.
    $GLOBALS['godcode_usuario'] = $payload;
}

/**
 * Limpia la cookie y redirige al login.
 */
function godcode_redirect_login(string $cookieName, string $loginUrl): void
{
    godcode_clear_cookie($cookieName);
    header('Location: ' . $loginUrl, true, 302);
    exit;
}

/**
 * Elimina una cookie del navegador.
 */
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