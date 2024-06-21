<?php

/**
 * Plugin Name:       Sniper
 * Description:       Convert more with conversational forms
 * Version:           3.6.0
 * Author:            Sniper
 * Author URI:        http://sniper.io/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       sniper
 * Domain Path:       /languages
 */

if (!defined('WPINC')) {
  die();
}

define('SNIPER_VERSION', '3.6.0');

function activate_sniper()
{
  require_once plugin_dir_path(__FILE__) .
    'includes/class-sniper-activator.php';
  Sniper_Activator::activate();
}

function deactivate_sniper()
{
  require_once plugin_dir_path(__FILE__) .
    'includes/class-sniper-deactivator.php';
  Sniper_Deactivator::deactivate();
}

register_activation_hook(__FILE__, 'activate_sniper');
register_deactivation_hook(__FILE__, 'deactivate_sniper');

require plugin_dir_path(__FILE__) . 'includes/class-sniper.php';

function run_sniper()
{
  $plugin = new Sniper();
  $plugin->run();
}
run_sniper();
