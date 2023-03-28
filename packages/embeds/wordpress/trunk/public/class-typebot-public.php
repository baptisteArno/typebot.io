<?php

class Typebot_Public
{
  public function add_head_code()
  {
    function parse_wp_user()
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
        '",
        }
      }
      </script>';
    }

    function typebot_script()
    {
      echo '<script type="module">
      import Typebot from "https://cdn.jsdelivr.net/npm/@typebot.io/js@0.0/dist/web.js";';
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
          let excludePath = path.trim();
					let windowPath = window.location.pathname;
					if (excludePath.endsWith("*")) {
						return !windowPath.startsWith(excludePath.slice(0, -1));
					}
					if (excludePath.endsWith("/")) {
						excludePath = path.slice(0, -1);
					}
					if (windowPath.endsWith("/")) {
						windowPath = windowPath.slice(0, -1);
					}
					return windowPath !== excludePath;
				})) {
          ' . get_option('init_snippet') . '
          Typebot.setPrefilledVariables({ ...typebotWpUser });
          
        }';
      }
      echo '</script>';
    }
    add_action('wp_head', 'parse_wp_user');
    add_action('wp_footer', 'typebot_script');
  }

  public function add_typebot_container($attributes = [])
  {
    $lib_url = "https://cdn.jsdelivr.net/npm/@typebot.io/js@0.0/dist/web.js";
    $width = '100%';
    $height = '500px';
    $api_host = 'https://viewer.typebot.io';
    if (array_key_exists('width', $attributes)) {
      $width = sanitize_text_field($attributes['width']);
    }
    if (array_key_exists('height', $attributes)) {
      $height = sanitize_text_field($attributes['height']);
    }
    if (array_key_exists('typebot', $attributes)) {
      $typebot = sanitize_text_field($attributes['typebot']);
    }
    if (array_key_exists('apiHost', $attributes)) {
      $api_host = sanitize_text_field($attributes['apiHost']);
    }
    if (!$typebot) {
      return;
    }

    $id = $this->generateRandomString();

    $bot_initializer = '<script type="module">
    import Typebot from "' . $lib_url . '"
    Typebot.initStandard({ apiHost: "' . $api_host . '", id: "' . $id . '", typebot: "' . $typebot . '", prefilledVariables: { ...typebotWpUser } });</script>';

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
