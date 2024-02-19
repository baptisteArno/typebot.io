<?php

/**
 * Plugin Name:       Flowdacity
 * Description:       Convert more with conversational forms
 * Version:           3.5.0
 * Author:            Flowdacity
 * Author URI:        http://flowdacity.com
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       flowdacity
 * Domain Path:       /languages
 */

if (!defined('WPINC')) {
  die();
}

define('TYPEBOT_VERSION', '3.5.0');

function activate_flowdacity()
{
  require_once plugin_dir_path(__FILE__) .
    'includes/class-flowdacity-activator.php';
  Flowdacity_Activator::activate();
}

function deactivate_flowdacity()
{
  require_once plugin_dir_path(__FILE__) .
    'includes/class-flowdacity-deactivator.php';
  Flowdacity_Deactivator::deactivate();
}

register_activation_hook(__FILE__, 'activate_flowdacity');
register_deactivation_hook(__FILE__, 'deactivate_flowdacity');

require plugin_dir_path(__FILE__) . 'includes/class-flowdacity.php';

function run_flowdacity()
{
  $plugin = new Flowdacity();
  $plugin->run();
}
run_flowdacity();
