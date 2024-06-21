<?php
if (!defined('ABSPATH')) {
  exit();
}

class Sniper_Admin
{
  public function my_admin_menu()
  {
    add_menu_page(
      'Sniper Settings',
      'Sniper',
      'manage_options',
      'sniper/settings.php',
      [$this, 'sniper_settings_callback'],
      'dashicons-format-chat',
      250
    );
  }

  public function sniper_settings_callback()
  {
    require_once 'partials/sniper-admin-display.php';
  }

  public function register_sniper_settings()
  {
    register_setting('sniper', 'lib_version');
    register_setting('sniper', 'init_snippet');
    register_setting('sniper', 'excluded_pages');
  }
}
