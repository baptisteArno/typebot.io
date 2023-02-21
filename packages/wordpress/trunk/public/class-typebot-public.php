<?php

class Typebot_Public
{
  public function add_head_code()
  {
    function add_module_type($tag, $handle)
    {
      if ('typebot' !== $handle) {
        return $tag;
      }
      $tag = str_replace(
        '<script',
        '<script type ="module"',
        $tag
      );
      return $tag;
    }

    wp_enqueue_script('typebot', 'whatever.js');
    add_filter('script_loader_tag', 'add_module_type', 10, 2);
    wp_add_inline_script('typebot', $this->parse_wp_user());
    if (get_option('init_snippet') && get_option('init_snippet') !== '') {
      wp_add_inline_script('typebot', get_option('init_snippet'));
      wp_add_inline_script('typebot', 'Typebot.setPrefilledVariables({ typebotWpUser });');
    }
  }

  private function parse_wp_user()
  {
    $wp_user = wp_get_current_user();
    return 'if(typeof window.typebotWpUser === "undefined"){
      window.typebotWpUser = {
          wp_id:"' .
      $wp_user->ID .
      '",
          wp_username:"' .
      $wp_user->user_login .
      '",
          wp_email:"' .
      $wp_user->user_email .
      '",
          wp_first_name:"' .
      $wp_user->user_firstname .
      '",
          wp_last_name:"' .
      $wp_user->user_lastname .
      '",
        }
      }';
  }

  public function add_typebot_container($attributes = [])
  {
    $lib_url = "https://cdn.jsdelivr.net/npm/@typebot.io/js@0.0.9/dist/web.js";
    $width = '100%';
    $height = '500px';
    if (array_key_exists('width', $attributes)) {
      $width = sanitize_text_field($attributes['width']);
    }
    if (array_key_exists('height', $attributes)) {
      $height = sanitize_text_field($attributes['height']);
    }
    if (array_key_exists('typebot', $attributes)) {
      $typebot = sanitize_text_field($attributes['typebot']);
    }
    if (!$typebot) {
      return;
    }

    $id = $this->generateRandomString();

    $bot_initializer = '<script type="module">
    import Typebot from "' . $lib_url . '"
    Typebot.initStandard({ id: "' . $id . '", typebot: "' . $typebot . '", prefilledVariables: { typebotWpUser } });</script>';

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
