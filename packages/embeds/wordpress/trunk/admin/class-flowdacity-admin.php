<?php
if (!defined('ABSPATH')) {
  exit();
}

class Flowdacity_Admin
{
  public function my_admin_menu()
  {
    add_menu_page(
      'Flowdacity Settings',
      'Flowdacity',
      'manage_options',
      'flowdacity/settings.php',
      [$this, 'flowdacity_settings_callback'],
      'dashicons-format-chat',
      250
    );
  }

  public function flowdacity_settings_callback()
  {
    require_once 'partials/flowdacity-admin-display.php';
  }

  public function register_flowdacity_settings()
  {
    register_setting('flowdacity', 'init_snippet');
    register_setting('flowdacity', 'excluded_pages');
  }
}
