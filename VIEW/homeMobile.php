<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GodCode</title>
  <link rel="stylesheet" href="../CSS/mobile.css">
</head>
<body>
  <!-- Redes sociales -->
  <div class="social-top">
    <a href="#"><i class="fab fa-tiktok"></i></a>
    <a href="#"><i class="fab fa-instagram"></i></a>
    <a href="#"><i class="fab fa-facebook-f"></i></a>
  </div>

  <!-- Header -->
<header class="header">
  <div class="logo">
    <img src="../ASSETS/godcode_icon.png" alt="Logo GodCode" class="logo-icon">
    GodCode
  </div>
  <button class="menu-toggle" onclick="toggleMenu()">☰</button>
</header>

  <!-- Menú lateral -->
  <nav id="mobileMenu" class="mobile-menu">
    <a href="#">Inicio</a>
    <a href="#">Productos</a>
    <a href="#">Quiénes somos</a>
    <a href="#">Ubicación</a>
  </nav>

  <!-- Contenido -->
  <main class="main-content">
    <!-- Aquí va el contenido de la página -->
  </main>

  <!-- Footer -->
  <footer class="footer">
    <div class="footer-section">
      <strong>Contacto</strong><br>
      Teléfono: 33 3333 3333<br>
      Ubicación: Ixtlahuacán de los membrillos
    </div>
    <div class="footer-section">
      <strong>Horarios de servicio</strong><br>
      Lunes a Viernes<br>
      De 9:00AM a 8:00PM
    </div>
  </footer>

  <script>
    function toggleMenu() {
      document.getElementById("mobileMenu").classList.toggle("active");
    }
  </script>

  <!-- FontAwesome para íconos -->
  <script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>
</body>
</html>
