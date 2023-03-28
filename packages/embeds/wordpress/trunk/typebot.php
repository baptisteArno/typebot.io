<?php

/**
 * Plugin Name:       Typebot
 * Description:       Convert more with conversational forms
 * Version:           3.1.7
 * Author:            Typebot
 * Author URI:        http://typebot.io/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       typebot
 * Domain Path:       /languages
 */

if (!defined('WPINC')) {
  die();
}

define('TYPEBOT_VERSION', '3.1.7');

function activate_typebot()
{
  require_once plugin_dir_path(__FILE__) .
    'includes/class-typebot-activator.php';
  Typebot_Activator::activate();
}

function deactivate_typebot()
{
  require_once plugin_dir_path(__FILE__) .
    'includes/class-typebot-deactivator.php';
  Typebot_Deactivator::deactivate();
}

register_activation_hook(__FILE__, 'activate_typebot');
register_deactivation_hook(__FILE__, 'deactivate_typebot');

require plugin_dir_path(__FILE__) . 'includes/class-typebot.php';

function run_typebot()
{
  $plugin = new Typebot();
  $plugin->run();
}
run_typebot();
