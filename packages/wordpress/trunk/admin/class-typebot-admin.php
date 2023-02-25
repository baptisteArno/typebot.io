<?php
if (!defined('ABSPATH')) {
  exit();
}

class Typebot_Admin
{
  public function my_admin_menu()
  {
    add_menu_page(
      'Typebot Settings',
      'Typebot',
      'manage_options',
      'typebot/settings.php',
      [$this, 'typebot_settings_callback'],
      'dashicons-format-chat',
      250
    );
  }

  public function typebot_settings_callback()
  {
    require_once 'partials/typebot-admin-display.php';
  }

  public function register_typebot_settings()
  {
    register_setting('typebot', 'init_snippet');
    register_setting('typebot', 'excluded_pages');
  }
}
