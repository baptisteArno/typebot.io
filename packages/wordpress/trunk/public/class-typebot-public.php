<?php

class Typebot_Public
{
  public function add_head_code()
  {
    wp_enqueue_script(
      'typebot',
      'https://unpkg.com/typebot-js@2.2/dist/index.umd.min.js'
    );
    wp_add_inline_script('typebot', $this->parse_wp_user());
    if (get_option('config_type') === 'advanced') {
      echo esc_html(get_option('custom_code'));
    }
    if (get_option('embed_type') === 'popup') {
      return $this->parse_popup_head_code();
    }
    if (get_option('embed_type') === 'bubble') {
      return $this->parse_bubble_head_code();
    }
  }

  private function parse_popup_head_code()
  {
    $url = str_starts_with(get_option('url'), 'https://typebot.io')
      ? 'https://viewer.typebot.io' . '/' . explode('/', get_option('url'))[3]
      : get_option('url');
    if (!$url) {
      return;
    }
    if (
      get_option('popup_included_pages') !== null &&
      get_option('popup_included_pages') !== ''
    ) {
      $paths = explode(',', get_option('popup_included_pages'));
      $arr_js = 'const typebot_include_paths = [';
      foreach ($paths as $path) {
        $arr_js = $arr_js . '"' . $path . '",';
      }
      $arr_js = $arr_js . ']';
      wp_add_inline_script('typebot', $arr_js);
    } else {
      wp_add_inline_script('typebot', 'const typebot_include_paths = null');
    }
    $params =
      '{
					url: "' .
      $url .
      '",
			hiddenVariables: typebotWpUser,
				}';
    if (
      get_option('popup_delay') !== null &&
      get_option('popup_delay') !== ''
    ) {
      $params =
        '{
					url: "' .
        $url .
        '",
					delay: ' .
        get_option('popup_delay') * 1000 .
        '
				}';
    }
    wp_add_inline_script(
      'typebot',
      'if (!typebot_include_paths) {
				Typebot.initPopup(' .
        $params .
        ');
			} else if (
				typebot_include_paths.some((path) => {
					let includePath = path;
					let windowPath = window.location.pathname;
					if (includePath.endsWith("*")) {
						return windowPath.startsWith(includePath.slice(0, -1));
					}
					if (includePath.endsWith("/")) {
						includePath = path.slice(0, -1);
					}
					if (windowPath.endsWith("/")) {
						windowPath = windowPath.slice(0, -1);
					}
					return windowPath === includePath;
				})
			) {
				Typebot.initPopup(' .
        $params .
        ');
		}'
    );
  }

  private function parse_bubble_head_code()
  {
    $url = str_starts_with(get_option('url'), 'https://typebot.io')
      ? 'https://viewer.typebot.io' . '/' . explode('/', get_option('url'))[3]
      : get_option('url');
    if (!$url) {
      return;
    }
    $chat_icon = get_option('chat_icon');
    if (
      get_option('chat_included_pages') !== null &&
      get_option('chat_included_pages') !== ''
    ) {
      $paths = explode(',', get_option('chat_included_pages'));
      $arr_js = 'const typebot_include_paths = [';
      foreach ($paths as $path) {
        $arr_js = $arr_js . '"' . $path . '",';
      }
      $arr_js = $arr_js . ']';
      wp_add_inline_script('typebot', $arr_js);
    } else {
      wp_add_inline_script('typebot', 'const typebot_include_paths = null');
    }
    $button_color = '#0042DA';
    if (
      get_option('button_color') !== null &&
      get_option('button_color') !== ''
    ) {
      $button_color = get_option('button_color');
    }
    $params =
      '{
					url: "' .
      $url .
      '",
						autoOpenDelay: ' .
      (get_option('chat_delay') === '' || get_option('chat_delay') === null
        ? 'undefined'
        : get_option('chat_delay') * 1000) .
      ',
      button: {
        color: "' .
      $button_color .
      '",
        iconUrl: "' .
      $chat_icon .
      '",
      },
			hiddenVariables: typebotWpUser,
				}';
    if (
      get_option('text_content') !== '' &&
      get_option('text_content') !== null
    ) {
      $remember =
        get_option('dont_show_callout_twice') === 'on' ? 'true' : 'false';
      $params =
        '{
					url: "' .
        $url .
        '",
						autoOpenDelay: ' .
        (get_option('chat_delay') === '' || get_option('chat_delay') === null
          ? 'undefined'
          : get_option('chat_delay') * 1000) .
        ',
					proactiveMessage: {
						avatarUrl: "' .
        get_option('avatar') .
        '",
						textContent: "' .
        get_option('text_content') .
        '",
						delay: ' .
        get_option('bubble_delay') * 1000 .
        ',
        rememberClose: ' .
        $remember .
        '
					},
					hiddenVariables: typebotWpUser,
					button: {
            color: "' .
        $button_color .
        '",
            iconUrl: "' .
        $chat_icon .
        '",
          },
				}';
    }
    wp_add_inline_script(
      'typebot',
      'if (!typebot_include_paths) {
				Typebot.initBubble(' .
        $params .
        ');
			} else if (
				typebot_include_paths.some((path) => {
					let includePath = path;
					let windowPath = window.location.pathname;
					if (includePath.endsWith("*")) {
						return windowPath.startsWith(includePath.slice(0, -1));
					}
					if (includePath.endsWith("/")) {
						includePath = path.slice(0, -1);
					}
					if (windowPath.endsWith("/")) {
						windowPath = windowPath.slice(0, -1);
					}
					return windowPath === includePath;
				})
			) {
				Typebot.initBubble(' .
        $params .
        ');
			}'
    );
  }

  private function parse_wp_user()
  {
    $wp_user = wp_get_current_user();
    return 'if(typeof typebotWpUser === "undefined"){
        var typebotWpUser = {
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
    $width = '100%';
    $height = '500px';
    $bg_color = 'rgba(255, 255, 255, 0)';
    $url = str_starts_with(get_option('url'), 'https://typebot.io')
      ? 'https://viewer.typebot.io' . '/' . explode('/', get_option('url'))[3]
      : get_option('url');
    if (is_array($attributes)) {
      if (array_key_exists('width', $attributes)) {
        $width = sanitize_text_field($attributes['width']);
      }
      if (array_key_exists('height', $attributes)) {
        $height = sanitize_text_field($attributes['height']);
      }
      if (array_key_exists('background-color', $attributes)) {
        $bg_color = sanitize_text_field($attributes['background-color']);
      }
      if (array_key_exists('url', $attributes)) {
        $url = sanitize_text_field($attributes['url']);
      }
    }
    if (!$url) {
      return;
    }
    $container_id = 'typebot-container-' . $this->generateRandomString(4);

    $bot_initializer =
      'var typebot = Typebot.initContainer("' .
      $container_id .
      '",{
    hiddenVariables: typebotWpUser,
          url: "' .
      $url .
      '",
        })';

    return '<script>' .
      $this->parse_wp_user() .
      '</script>' .
      '<div
			id="' .
      $container_id .
      '"
			style="width: ' .
      $width .
      '; height: ' .
      $height .
      '; background-color: ' .
      $bg_color .
      '"
				></div>
				<script>
        if(document.readyState == "complete"){
          ' .
      $bot_initializer .
      '
        } else {
        window.addEventListener("load",(event) => {
          ' .
      $bot_initializer .
      '
					}) 
        }
		</script>';
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
