<?php

define('TYPEBOT_DEFAULT_LIB_VERSION', '0.3');

class Typebot_Public
{
  public function __construct()
  {
    add_action('wp_head', array($this, 'parse_wp_user'));
    add_action('wp_footer', array($this, 'initialize_typebot'), 100);
  }

  public function parse_wp_user()
  {
    $wp_user = wp_get_current_user();
    echo '<script>
      if(typeof window.typebotWpUser === "undefined"){
      window.typebotWpUser = {
          "WP ID":"' .
      $wp_user->ID .
      '",
          "WP Username":"' .
      $wp_user->user_login .
      '",
          "WP Email":"' .
      $wp_user->user_email .
      '",
          "WP First name":"' .
      $wp_user->user_firstname .
      '",
          "WP Last name":"' .
      $wp_user->user_lastname .
      '"
        }
      }
      </script>';
  }

  public function add_head_code()
  {
    $this->parse_wp_user();
  }

  function initialize_typebot()
  {
    if (empty(get_option('init_snippet')) || $this->is_path_excluded(get_option('excluded_pages'))) return;
    $lib_version = ($version = get_option('lib_version')) ? $version : TYPEBOT_DEFAULT_LIB_VERSION;
    echo '<script type="module">
    import Typebot from "https://cdn.jsdelivr.net/npm/@typebot.io/js@'.$lib_version.'/dist/web.js";'.
      get_option('init_snippet').
      'Typebot.setPrefilledVariables({ ...typebotWpUser });
    </script>';
  }

  function is_path_excluded($excluded_paths) {
    if (empty($excluded_paths)) return false;
    
    $current_path = $_SERVER['REQUEST_URI'];
    $paths = explode(',', $excluded_paths);
    
    foreach ($paths as $path) {
      $path = trim($path);
      list($exclude_path, $exclude_search) = array_pad(explode('?', $path), 2, null);
      
      // Parse current URL
      $current_parsed = parse_url($current_path);
      $current_path_clean = rtrim($current_parsed['path'], '/');
      $current_query = [];
      if (isset($current_parsed['query'])) {
        parse_str($current_parsed['query'], $current_query);
      }
      
      // Handle wildcard paths
      if (str_ends_with($exclude_path, '*')) {
        $base_path = rtrim(substr($exclude_path, 0, -1), '/');
        if (!str_starts_with($current_path_clean, $base_path)) {
          continue;
        }
      } else {
        $exclude_path = rtrim($exclude_path, '/');
        if ($current_path_clean !== $exclude_path) {
          continue;
        }
      }
      
      // Check query parameters if they exist
      if ($exclude_search) {
        parse_str($exclude_search, $exclude_query);
        $matches = true;
        
        foreach ($exclude_query as $key => $value) {
          if ($value === '*') {
            if (!isset($current_query[$key])) {
              $matches = false;
              break;
            }
          } else if (!isset($current_query[$key]) || $current_query[$key] !== $value) {
            $matches = false;
            break;
          }
        }
        
        if ($matches) return true;
      } else {
        return true;
      }
    }
    
    return false;
  }

  public function add_typebot_container($attributes = []) {
    $lib_version = TYPEBOT_DEFAULT_LIB_VERSION;
    if (array_key_exists('lib_version', $attributes)) {
      $lib_version = $attributes['lib_version'];
      if (strlen($lib_version) > 10 || !preg_match('/^\d+\.\d+(\.\d+)?$/', $lib_version)) {
          $lib_version = TYPEBOT_DEFAULT_LIB_VERSION;
      } else {
          $lib_version = sanitize_text_field($lib_version);
      }
    }
    $lib_url = esc_url_raw("https://cdn.jsdelivr.net/npm/@typebot.io/js@". $lib_version ."/dist/web.js");
    $width = '100%';
    $height = '500px';
    $api_host = 'https://typebot.co';
    $ws_host = 'partykit.typebot.io';
    if (array_key_exists('width', $attributes)) {
      $width = $attributes['width'];
      if (strlen($width) > 10 || !preg_match('/^\d+(%|px)$/', $width)) {
        $width = '100%';
      } else {
        $width = sanitize_text_field($width);
      }
    }
    if (array_key_exists('height', $attributes)) {
      $height = $attributes['height'];
      if (strlen($height) > 10 || !preg_match('/^\d+(%|px)$/', $height)) {
        $height = '500px';
      } else {
        $height = sanitize_text_field($height);
      }
    }
    if (array_key_exists('typebot', $attributes)) {
      $typebot = $attributes['typebot'];
      if (strlen($typebot) > 50 || empty($typebot) || !preg_match('/^[a-zA-Z0-9_-]+$/', $typebot)) {
        return;
      } else {
        $typebot = sanitize_text_field($typebot);
      }
    }
    if (array_key_exists('host', $attributes)) {
      $api_host = $attributes['host'];
      // Limit the length and sanitize
      if (strlen($api_host) > 100 || !filter_var($api_host, FILTER_VALIDATE_URL)) {
        $api_host = 'https://typebot.co'; // fallback to default host
      } else {
        $api_host = sanitize_text_field($api_host);
      }
    }
    if (array_key_exists('ws_host', $attributes)) {
      $ws_host = $attributes['ws_host'];
      // Limit the length and sanitize
      if (strlen($ws_host) > 100 || !filter_var($ws_host, FILTER_VALIDATE_URL)) {
        $ws_host = 'partykit.typebot.io'; // fallback to default host
      } else {
        $ws_host = sanitize_text_field($ws_host);
      }
    }
    if (!$typebot) {
      return;
    }

    $id = $this->generateRandomString();

    $bot_initializer = '<script type="module">
    import Typebot from "' . esc_url($lib_url) . '"
    const urlParams = new URLSearchParams(window.location.search);
    const queryParams = Object.fromEntries(urlParams.entries());
    Typebot.initStandard({ apiHost: "' . esc_js($api_host) . '", wsHost: "' . esc_js($ws_host) . '", id: "' . esc_js($id) . '", typebot: "' . esc_js($typebot) . '", prefilledVariables: { ...window.typebotWpUser, ...queryParams } });</script>';
    return  '<typebot-standard id="' . esc_attr($id) . '" style="width: ' . esc_attr($width) . '; height: ' . esc_attr($height) . ';"></typebot-standard>' . $bot_initializer;
  }

  private function generateRandomString($length = 10)
  {
    return substr(
      str_shuffle(
        str_repeat(
          $x = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
          ceil($length / strlen($x))
        )
      ),
      1,
      $length
    );
  }
}

function custom_sanitize_text_field($str) {
  $str = str_replace(array('"', "'", '\\'), '', $str);
  $str = sanitize_text_field($str);
  return $str;
}
