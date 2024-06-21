<?php

class Sniper_i18n
{
	public function load_plugin_textdomain()
	{

		load_plugin_textdomain(
			'sniper',
			false,
			dirname(dirname(plugin_basename(__FILE__))) . '/languages/'
		);
	}
}
