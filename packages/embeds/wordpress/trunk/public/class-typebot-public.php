<?php
class Typebot_Public
{
  public function __construct()
  {
    add_action('wp_head', array($this, 'parse_wp_user'));
    add_action('wp_footer', array($this, 'typebot_script'));
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

  function typebot_script()
  {
    $lib_version = get_option('lib_version') !== null && get_option('lib_version') !== ''  ? get_option('lib_version') : '0.3';
    echo '<script type="module">import Typebot from "https://cdn.jsdelivr.net/npm/@typebot.io/js@'.$lib_version.'/dist/web.js";';
    if (
      get_option('excluded_pages') !== null &&
      get_option('excluded_pages') !== ''
    ) {
      $paths = explode(',', get_option('excluded_pages'));
      $arr_js = 'const typebotExcludePaths = [';
      foreach ($paths as $path) {
        $arr_js = $arr_js . '"' . $path . '",';
      }
      $arr_js = substr($arr_js, 0, -1) . '];';
      echo $arr_js;
    } else {
      echo 'const typebotExcludePaths = null;';
    }

    if (get_option('init_snippet') && get_option('init_snippet') !== '') {
      echo 'if(!typebotExcludePaths || typebotExcludePaths.every((path) => {
          let [excludePath, excludeSearch] = path.trim().split("?");
          const excludeSearchParams = excludeSearch ? new URLSearchParams(excludeSearch) : null; 
					let windowPath = window.location.pathname;
          let windowSearchParams = window.location.search.length > 0 ? new URLSearchParams(window.location.search) : null;
					if (excludePath.endsWith("*")) {
            if(excludeSearchParams){
              if(!windowSearchParams) return true
              return !windowPath.startsWith(excludePath.slice(0, -1)) || !Array.from(excludeSearchParams.keys()).every((key) => excludeSearchParams.get(key) === "*" || (excludeSearchParams.get(key) === windowSearchParams.get(key)));
            }
						return !windowPath.startsWith(excludePath.slice(0, -1));
					}
					if (excludePath.endsWith("/")) {
						excludePath = excludePath.slice(0, -1);
					}
					if (windowPath.endsWith("/")) {
						windowPath = windowPath.slice(0, -1);
					}    
          if(excludeSearchParams){
            if(!windowSearchParams) return true
            return windowPath !== excludePath || !Array.from(excludeSearchParams.keys()).every((key) => excludeSearchParams.get(key) === "*" || (excludeSearchParams.get(key) === windowSearchParams.get(key)));
          } else {
            return windowPath !== excludePath;
          }
				})) {
          ' . get_option('init_snippet') . '
          Typebot.setPrefilledVariables({ ...typebotWpUser });
        }';
    }
    echo '</script>';
  }

  public function add_typebot_container($attributes = []) {
    $lib_version = '0.3';
    if (array_key_exists('lib_version', $attributes)) {
      $lib_version = $attributes['lib_version'];
      if (strlen($lib_version) > 10 || !preg_match('/^\d+\.\d+(\.\d+)?$/', $lib_version)) {
          $lib_version = '0.3';
      } else {
          $lib_version = sanitize_text_field($lib_version);
      }
    }
    $lib_url = esc_url_raw("https://cdn.jsdelivr.net/npm/@typebot.io/js@". $lib_version ."/dist/web.js");
    $width = '100%';
    $height = '500px';
    $api_host = 'https://typebot.co';
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
    if (!$typebot) {
      return;
    }

    $id = $this->generateRandomString();

    $bot_initializer = '<script type="module">
    import Typebot from "' . esc_url($lib_url) . '"

    const urlParams = new URLSearchParams(window.location.search);
    const queryParams = Object.fromEntries(urlParams.entries());

    Typebot.initStandard({ apiHost: "' . esc_js($api_host) . '", id: "' . esc_js($id) . '", typebot: "' . esc_js($typebot) . '", prefilledVariables: { ...window.typebotWpUser, ...queryParams } });</script>';

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
