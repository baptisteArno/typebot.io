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
    echo '<script type="module">import Typebot from "https://cdn.jsdelivr.net/npm/@typebot.io/js@0.2.15/dist/web.js";';
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

  public function add_typebot_container($attributes = [])
  {
    $lib_version = '0.2';
    if(array_key_exists('lib_version', $attributes)) {
      $lib_version = sanitize_text_field($attributes['lib_version']);
    }
    $lib_url = "https://cdn.jsdelivr.net/npm/@typebot.io/js@". $lib_version ."/dist/web.js";
    $width = '100%';
    $height = '500px';
    $api_host = 'https://typebot.io';
    if (array_key_exists('width', $attributes)) {
      $width = sanitize_text_field($attributes['width']);
    }
    if (array_key_exists('height', $attributes)) {
      $height = sanitize_text_field($attributes['height']);
    }
    if (array_key_exists('typebot', $attributes)) {
      $typebot = sanitize_text_field($attributes['typebot']);
    }
    if (array_key_exists('host', $attributes)) {
      $api_host = sanitize_text_field($attributes['host']);
    }
    if (!$typebot) {
      return;
    }

    $id = $this->generateRandomString();

    $bot_initializer = '<script type="module">
    import Typebot from "' . $lib_url . '"

    const urlParams = new URLSearchParams(window.location.search);
    const queryParams = Object.fromEntries(urlParams.entries());

    Typebot.initStandard({ apiHost: "' . $api_host . '", id: "' . $id . '", typebot: "' . $typebot . '", prefilledVariables: { ...window.typebotWpUser, ...queryParams } });</script>';

    return  '<typebot-standard id="' . $id . '" style="width: ' . $width . '; height: ' . $height . ';"></typebot-standard>' . $bot_initializer;
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
