<?php
if (!defined('ABSPATH')) {
  exit();
}

class Typebot_Admin
{
  private $version;

  public function __construct($version)
  {
    $this->version = $version;
  }

  public function enqueue_styles($hook)
  {
    if ($hook === 'toplevel_page_typebot/settings') {
      wp_enqueue_style(
        'bulma',
        plugin_dir_url(__FILE__) . 'css/bulma.min.css',
        [],
        $this->version,
        'all'
      );
    }
  }

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
    register_setting('typebot', 'url', [
      'sanitize_callback' => 'sanitize_text_field',
    ]);
    register_setting('typebot', 'embed_type', [
      'sanitize_callback' => 'sanitize_text_field',
    ]);
    register_setting('typebot', 'popup_delay', [
      'sanitize_callback' => 'sanitize_text_field',
    ]);
    register_setting('typebot', 'bubble_delay', [
      'sanitize_callback' => 'sanitize_text_field',
    ]);
    register_setting('typebot', 'chat_delay', [
      'sanitize_callback' => 'sanitize_text_field',
    ]);
    register_setting('typebot', 'avatar', [
      'sanitize_callback' => 'sanitize_text_field',
    ]);
    register_setting('typebot', 'text_content', [
      'sanitize_callback' => 'sanitize_text_field',
    ]);
    register_setting('typebot', 'button_color', [
      'sanitize_callback' => 'sanitize_text_field',
    ]);
    register_setting('typebot', 'chat_included_pages', [
      'sanitize_callback' => 'sanitize_text_field',
    ]);
    register_setting('typebot', 'popup_included_pages', [
      'sanitize_callback' => 'sanitize_text_field',
    ]);
    register_setting('typebot', 'chat_icon', [
      'sanitize_callback' => 'sanitize_text_field',
    ]);
    register_setting('typebot', 'custom_code', [
      'sanitize_callback' => 'sanitize_text_field',
    ]);
    register_setting('typebot', 'config_type', [
      'sanitize_callback' => 'sanitize_text_field',
    ]);
    register_setting('typebot', 'dont_show_callout_twice', [
      'sanitize_callback' => 'sanitize_text_field',
    ]);
  }
}
